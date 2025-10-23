/**
 * Purchase Controllers
 * Handles product purchases and payment processing
 */

import { Response } from 'express';
import axios from 'axios';
import { Purchase, PurchaseStatus, PaymentProvider } from '../models/Purchase';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendPurchaseConfirmation, sendSaleNotification } from '../services/email.service';
import { generateDownloadUrl } from '../services/fileUpload.service';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize a purchase (create payment intent)
 */
export const initializePurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Get product details
    const product = await Product.findById(productId).populate('seller');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if product is published
    if (product.status !== 'PUBLISHED') {
      res.status(400).json({ error: 'Product is not available for purchase' });
      return;
    }

    // Check if user already owns this product
    const existingPurchase = await Purchase.findOne({
      buyer: req.user.userId,
      product: productId,
      paymentStatus: PurchaseStatus.COMPLETED,
    });

    if (existingPurchase) {
      res.status(400).json({ error: 'You already own this product' });
      return;
    }

    // Get buyer details
    const buyer = await User.findById(req.user.userId);

    if (!buyer) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate unique reference
    const reference = `DD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Initialize payment with Paystack
    try {
      const paystackResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: buyer.email,
          amount: Math.round(product.price * 100), // Convert to kobo/cents
          currency: product.currency,
          reference,
          metadata: {
            product_id: product._id.toString(),
            product_title: product.title,
            buyer_id: buyer._id.toString(),
            seller_id: product.seller._id.toString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!paystackResponse.data.status) {
        throw new Error('Payment initialization failed');
      }

      // Create pending purchase record
      const purchase = await Purchase.create({
        buyer: req.user.userId,
        product: product._id,
        seller: product.seller._id,
        amount: product.price,
        currency: product.currency,
        paymentProvider: PaymentProvider.PAYSTACK,
        paymentReference: reference,
        paymentStatus: PurchaseStatus.PENDING,
        paymentMetadata: paystackResponse.data.data,
      });

      res.status(201).json({
        message: 'Payment initialized successfully',
        purchase: purchase.toJSON(),
        paymentUrl: paystackResponse.data.data.authorization_url,
        reference,
      });
    } catch (paystackError: any) {
      console.error('Paystack error:', paystackError.response?.data || paystackError.message);
      res.status(500).json({
        error: 'Payment initialization failed',
        details: paystackError.response?.data?.message || paystackError.message,
      });
    }
  } catch (error) {
    console.error('Initialize purchase error:', error);
    res.status(500).json({ error: 'An error occurred while initializing purchase' });
  }
};

/**
 * Verify payment and complete purchase
 */
export const verifyPurchase = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({ error: 'Payment reference is required' });
      return;
    }

    // Find purchase record
    const purchase = await Purchase.findOne({ paymentReference: reference })
      .populate('product')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    // Check if user owns this purchase
    if (purchase.buyer._id.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // If already completed, return success
    if (purchase.paymentStatus === PurchaseStatus.COMPLETED) {
      res.status(200).json({
        message: 'Purchase already completed',
        purchase: purchase.toJSON(),
      });
      return;
    }

    // Verify payment with Paystack
    try {
      const paystackResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      if (!paystackResponse.data.status || !paystackResponse.data.data) {
        throw new Error('Payment verification failed');
      }

      const paymentData = paystackResponse.data.data;

      // Check if payment was successful
      if (paymentData.status === 'success') {
        // Update purchase status
        purchase.paymentStatus = PurchaseStatus.COMPLETED;
        purchase.transactionId = paymentData.id.toString();
        purchase.paymentMetadata = paymentData;
        await purchase.save();

        // Update product sales stats
        const product = await Product.findById(purchase.product._id);
        if (product) {
          product.totalSales += 1;
          product.totalRevenue += purchase.amount;
          await product.save();
        }

        await purchase.populate('product');
        await purchase.populate('buyer', 'name email');
        await purchase.populate('seller', 'name email');

        // Calculate platform fee and seller earnings
        const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
        const platformFee = (purchase.amount * platformFeePercentage) / 100;
        const sellerEarnings = purchase.amount - platformFee;

        // Update seller earnings
        const seller = await User.findById(purchase.seller._id);
        if (seller) {
          seller.totalEarnings += sellerEarnings;
          seller.totalSales += 1;
          await seller.save();
        }

        // Send emails (async, don't wait)
        const productData = purchase.product as any;
        const buyerData = purchase.buyer as any;
        const sellerData = purchase.seller as any;

        // Generate download URL for buyer
        const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/purchases/${purchase._id}`;

        sendPurchaseConfirmation(
          buyerData.email,
          buyerData.name || 'Buyer',
          productData.title,
          purchase.amount,
          purchase.currency,
          purchase._id.toString(),
          downloadUrl
        ).catch(err => console.error('Failed to send purchase confirmation:', err));

        sendSaleNotification(
          sellerData.email,
          sellerData.name || 'Seller',
          productData.title,
          purchase.amount,
          purchase.currency,
          sellerEarnings
        ).catch(err => console.error('Failed to send sale notification:', err));

        res.status(200).json({
          message: 'Purchase completed successfully',
          purchase: purchase.toJSON(),
        });
      } else {
        // Payment failed
        purchase.paymentStatus = PurchaseStatus.FAILED;
        purchase.paymentMetadata = paymentData;
        await purchase.save();

        res.status(400).json({
          error: 'Payment was not successful',
          status: paymentData.status,
        });
      }
    } catch (paystackError: any) {
      console.error('Paystack verification error:', paystackError.response?.data || paystackError.message);
      res.status(500).json({
        error: 'Payment verification failed',
        details: paystackError.response?.data?.message || paystackError.message,
      });
    }
  } catch (error) {
    console.error('Verify purchase error:', error);
    res.status(500).json({ error: 'An error occurred while verifying purchase' });
  }
};

/**
 * Get user's purchases
 */
export const getMyPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { status } = req.query;

    const query: any = { buyer: req.user.userId };

    if (status) {
      query.paymentStatus = status;
    }

    const purchases = await Purchase.find(query)
      .populate('product', 'title slug coverImage category')
      .populate('seller', 'name email sellerSlug')
      .sort({ createdAt: -1 });

    const purchasesJson = purchases.map(p => p.toJSON());

    res.status(200).json({
      purchases: purchasesJson,
      total: purchases.length,
    });
  } catch (error) {
    console.error('Get my purchases error:', error);
    res.status(500).json({ error: 'An error occurred while fetching purchases' });
  }
};

/**
 * Get seller's sales
 */
export const getMySales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { status } = req.query;

    const query: any = {
      seller: req.user.userId,
      paymentStatus: PurchaseStatus.COMPLETED,
    };

    if (status) {
      query.paymentStatus = status;
    }

    const sales = await Purchase.find(query)
      .populate('product', 'title slug coverImage category')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    const salesJson = sales.map(s => s.toJSON());

    // Calculate statistics
    const stats = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
      currency: sales.length > 0 ? sales[0].currency : 'USD',
    };

    res.status(200).json({
      sales: salesJson,
      stats,
    });
  } catch (error) {
    console.error('Get my sales error:', error);
    res.status(500).json({ error: 'An error occurred while fetching sales' });
  }
};

/**
 * Get download link for purchased product
 */
export const getDownloadLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { purchaseId } = req.params;

    const purchase = await Purchase.findById(purchaseId).populate('product');

    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    // Check if user owns this purchase
    if (purchase.buyer.toString() !== req.user.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Check if purchase is completed
    if (purchase.paymentStatus !== PurchaseStatus.COMPLETED) {
      res.status(400).json({ error: 'Purchase is not completed' });
      return;
    }

    // Update download count
    purchase.downloadCount += 1;
    purchase.lastDownloadAt = new Date();
    await purchase.save();

    const product = purchase.product as any;

    res.status(200).json({
      files: product.files,
      downloadCount: purchase.downloadCount,
    });
  } catch (error) {
    console.error('Get download link error:', error);
    res.status(500).json({ error: 'An error occurred while fetching download link' });
  }
};

/**
 * Paystack webhook handler
 */
export const paystackWebhook = async (req: any, res: Response): Promise<void> => {
  try {
    const event = req.body;

    // Verify webhook signature - CRITICAL FOR SECURITY
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    if (event.event === 'charge.success') {
      const { reference } = event.data;

      const purchase = await Purchase.findOne({ paymentReference: reference })
        .populate('product')
        .populate('buyer', 'name email')
        .populate('seller', 'name email');

      if (purchase && purchase.paymentStatus === PurchaseStatus.PENDING) {
        purchase.paymentStatus = PurchaseStatus.COMPLETED;
        purchase.transactionId = event.data.id.toString();
        purchase.paymentMetadata = event.data;
        await purchase.save();

        // Update product sales stats
        const product = await Product.findById(purchase.product._id);
        if (product) {
          product.totalSales += 1;
          product.totalRevenue += purchase.amount;
          await product.save();
        }

        // Calculate platform fee and seller earnings
        const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '10');
        const platformFee = (purchase.amount * platformFeePercentage) / 100;
        const sellerEarnings = purchase.amount - platformFee;

        // Update seller earnings
        const seller = await User.findById(purchase.seller._id);
        if (seller) {
          seller.totalEarnings += sellerEarnings;
          seller.totalSales += 1;
          await seller.save();
        }

        // Send emails (async, don't wait)
        const productData = purchase.product as any;
        const buyerData = purchase.buyer as any;
        const sellerData = purchase.seller as any;

        const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/purchases/${purchase._id}`;

        sendPurchaseConfirmation(
          buyerData.email,
          buyerData.name || 'Buyer',
          productData.title,
          purchase.amount,
          purchase.currency,
          purchase._id.toString(),
          downloadUrl
        ).catch(err => console.error('Failed to send purchase confirmation:', err));

        sendSaleNotification(
          sellerData.email,
          sellerData.name || 'Seller',
          productData.title,
          purchase.amount,
          purchase.currency,
          sellerEarnings
        ).catch(err => console.error('Failed to send sale notification:', err));
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};
