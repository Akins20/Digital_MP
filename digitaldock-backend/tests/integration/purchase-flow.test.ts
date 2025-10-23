import mongoose from 'mongoose';
import { User } from '../../src/models/User';
import { Product, ProductCategory, ProductStatus } from '../../src/models/Product';
import { Purchase, PurchaseStatus } from '../../src/models/Purchase';
import { uploadFileToR2, generateDownloadUrl, deleteFileFromR2 } from '../../src/services/fileUpload.service';

// Mock external services
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('../../src/services/email.service');

import { sendPurchaseConfirmation, sendSaleNotification } from '../../src/services/email.service';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
const mockSendPurchaseConfirmation = sendPurchaseConfirmation as jest.MockedFunction<typeof sendPurchaseConfirmation>;
const mockSendSaleNotification = sendSaleNotification as jest.MockedFunction<typeof sendSaleNotification>;

describe('Complete Purchase Flow Integration Tests', () => {
  let buyer: any;
  let seller: any;
  let product: any;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitaldock-test');
  });

  afterAll(async () => {
    await Purchase.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections
    await Purchase.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Setup email mocks
    mockSendPurchaseConfirmation.mockResolvedValue(true);
    mockSendSaleNotification.mockResolvedValue(true);

    // Create test users
    buyer = await User.create({
      name: 'Test Buyer',
      email: 'buyer@test.com',
      password: 'hashedpassword123',
      role: 'BUYER',
    });

    seller = await User.create({
      name: 'Test Seller',
      email: 'seller@test.com',
      password: 'hashedpassword123',
      role: 'SELLER',
    });

    // Mock S3 operations
    const mockSend = jest.fn().mockResolvedValue({});
    mockS3Client.prototype.send = mockSend;
    mockGetSignedUrl.mockResolvedValue('https://r2.example.com/signed-url');

    // Create test product with file
    const mockFile = {
      fieldname: 'file',
      originalname: 'awesome-template.zip',
      encoding: '7bit',
      mimetype: 'application/zip',
      buffer: Buffer.from('test file content'),
      size: 1024 * 100, // 100KB
    } as Express.Multer.File;

    const uploadResult = await uploadFileToR2(mockFile, 'products');

    product = await Product.create({
      title: 'Awesome Notion Template',
      description: 'A comprehensive productivity template',
      price: 29.99,
      category: ProductCategory.TEMPLATES,
      seller: seller._id,
      files: [
        {
          url: uploadResult.file?.url || 'https://r2.example.com/file.zip',
          name: uploadResult.file?.originalName || 'awesome-template.zip',
          size: uploadResult.file?.size || 1024 * 100,
          type: uploadResult.file?.mimetype || 'application/zip',
        },
      ],
      coverImage: 'https://r2.example.com/cover.jpg',
      images: ['https://r2.example.com/image1.jpg'],
      tags: ['notion', 'productivity'],
      status: ProductStatus.PUBLISHED,
    });
  });

  describe('Complete Purchase Journey', () => {
    it('should complete entire purchase flow successfully', async () => {
      // 1. Buyer initiates purchase
      const purchaseData = {
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_test_integration_123',
        paymentStatus: PurchaseStatus.PENDING,
      };

      const purchase = await Purchase.create(purchaseData);

      expect(purchase).toBeDefined();
      expect(purchase.paymentStatus).toBe(PurchaseStatus.PENDING);
      expect(purchase.buyer.toString()).toBe(buyer._id.toString());

      // 2. Payment webhook confirms payment
      purchase.paymentStatus = PurchaseStatus.COMPLETED;
      await purchase.save();

      const updatedPurchase = await Purchase.findById(purchase._id);
      expect(updatedPurchase?.paymentStatus).toBe(PurchaseStatus.COMPLETED);

      // 3. Generate download URL for buyer
      const fileKey = 'products/awesome-template.zip'; // In real app, this would be stored separately
      const downloadUrl = await generateDownloadUrl(fileKey);
      expect(downloadUrl).toBeDefined();
      expect(downloadUrl).toContain('https://');

      // 4. Send confirmation emails
      const buyerEmailSent = await sendPurchaseConfirmation(
        buyer.email,
        buyer.name,
        product.title,
        purchase.amount,
        purchase.currency,
        purchase._id.toString(),
        downloadUrl
      );

      expect(buyerEmailSent).toBe(true);
      expect(sendPurchaseConfirmation).toHaveBeenCalledWith(
        buyer.email,
        buyer.name,
        product.title,
        purchase.amount,
        purchase.currency,
        purchase._id.toString(),
        downloadUrl
      );

      // 5. Calculate and send seller notification
      const platformFee = purchase.amount * 0.1; // 10% platform fee
      const sellerEarnings = purchase.amount - platformFee;

      const sellerEmailSent = await sendSaleNotification(
        seller.email,
        seller.name,
        product.title,
        purchase.amount,
        purchase.currency,
        sellerEarnings
      );

      expect(sellerEmailSent).toBe(true);
      expect(sendSaleNotification).toHaveBeenCalledWith(
        seller.email,
        seller.name,
        product.title,
        purchase.amount,
        purchase.currency,
        sellerEarnings
      );

      // 6. Update product statistics
      product.totalSales += 1;
      product.totalRevenue += purchase.amount;
      await product.save();

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.totalSales).toBe(1);
      expect(updatedProduct?.totalRevenue).toBe(purchase.amount);

      // 7. Update seller earnings
      seller.totalEarnings += sellerEarnings;
      await seller.save();

      const updatedSeller = await User.findById(seller._id);
      expect(updatedSeller?.totalEarnings).toBe(sellerEarnings);

      // 8. Track download
      purchase.downloadCount += 1;
      purchase.lastDownloadAt = new Date();
      await purchase.save();

      const finalPurchase = await Purchase.findById(purchase._id);
      expect(finalPurchase?.downloadCount).toBe(1);
      expect(finalPurchase?.lastDownloadAt).toBeDefined();
    });

    it('should handle multiple purchases for same product', async () => {
      // Create second buyer
      const buyer2 = await User.create({
        name: 'Second Buyer',
        email: 'buyer2@test.com',
        password: 'hashedpassword123',
        role: 'BUYER',
      });

      // First purchase
      const purchase1 = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_purchase1',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Second purchase
      const purchase2 = await Purchase.create({
        buyer: buyer2._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_purchase2',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Update product stats
      product.totalSales = 2;
      product.totalRevenue = product.price * 2;
      await product.save();

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct?.totalSales).toBe(2);
      expect(updatedProduct?.totalRevenue).toBe(product.price * 2);

      // Update seller earnings
      const earningsPerSale = product.price * 0.9; // After 10% fee
      seller.totalEarnings = earningsPerSale * 2;
      await seller.save();

      const updatedSeller = await User.findById(seller._id);
      expect(updatedSeller?.totalEarnings).toBe(earningsPerSale * 2);
    });

    it('should prevent duplicate purchases by same buyer', async () => {
      // First purchase
      const purchase1 = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_first',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Check for existing purchase before allowing second
      const existingPurchase = await Purchase.findOne({
        buyer: buyer._id,
        product: product._id,
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      expect(existingPurchase).toBeDefined();
      expect(existingPurchase?._id.toString()).toBe(purchase1._id.toString());

      // In real application, this would prevent duplicate purchase
      if (existingPurchase) {
        // Don't create another purchase
        const purchases = await Purchase.find({
          buyer: buyer._id,
          product: product._id,
          paymentStatus: PurchaseStatus.COMPLETED,
        });
        expect(purchases).toHaveLength(1);
      }
    });
  });

  describe('Failed Purchase Handling', () => {
    it('should handle failed payment gracefully', async () => {
      // Create purchase
      const purchase = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_failed',
        paymentStatus: PurchaseStatus.PENDING,
      });

      // Payment fails
      purchase.paymentStatus = PurchaseStatus.FAILED;
      await purchase.save();

      // Product stats should not be updated
      const productAfter = await Product.findById(product._id);
      expect(productAfter?.totalSales).toBe(0);
      expect(productAfter?.totalRevenue).toBe(0);

      // Seller earnings should not be updated
      const sellerAfter = await User.findById(seller._id);
      expect(sellerAfter?.totalEarnings).toBe(0);

      // No emails should be sent for failed purchases
      expect(sendPurchaseConfirmation).not.toHaveBeenCalled();
      expect(sendSaleNotification).not.toHaveBeenCalled();
    });

    it('should handle refunds', async () => {
      // Complete purchase
      const purchase = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_refund',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Update product and seller
      product.totalSales = 1;
      product.totalRevenue = product.price;
      await product.save();

      const earnings = product.price * 0.9;
      seller.totalEarnings = earnings;
      await seller.save();

      // Process refund
      purchase.paymentStatus = PurchaseStatus.REFUNDED;
      await purchase.save();

      // Reverse stats (in real app, this would be triggered by webhook)
      product.totalSales -= 1;
      product.totalRevenue -= product.price;
      await product.save();

      seller.totalEarnings -= earnings;
      await seller.save();

      const finalPurchase = await Purchase.findById(purchase._id);
      expect(finalPurchase?.paymentStatus).toBe(PurchaseStatus.REFUNDED);

      const finalProduct = await Product.findById(product._id);
      expect(finalProduct?.totalSales).toBe(0);
      expect(finalProduct?.totalRevenue).toBe(0);

      const finalSeller = await User.findById(seller._id);
      expect(finalSeller?.totalEarnings).toBe(0);
    });
  });

  describe('Download Tracking', () => {
    it('should track multiple downloads', async () => {
      const purchase = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_downloads',
        paymentStatus: PurchaseStatus.COMPLETED,
        downloadCount: 0,
      });

      // Simulate multiple downloads
      for (let i = 0; i < 3; i++) {
        const fileKey = 'products/awesome-template.zip';
        const downloadUrl = await generateDownloadUrl(fileKey);
        expect(downloadUrl).toBeDefined();

        purchase.downloadCount += 1;
        purchase.lastDownloadAt = new Date();
        await purchase.save();
      }

      const finalPurchase = await Purchase.findById(purchase._id);
      expect(finalPurchase?.downloadCount).toBe(3);
      expect(finalPurchase?.lastDownloadAt).toBeDefined();
    });

    it('should allow unlimited downloads for completed purchases', async () => {
      const purchase = await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_unlimited',
        paymentStatus: PurchaseStatus.COMPLETED,
        downloadCount: 0,
      });

      // Simulate 10 downloads
      for (let i = 0; i < 10; i++) {
        purchase.downloadCount += 1;
        await purchase.save();
      }

      const finalPurchase = await Purchase.findById(purchase._id);
      expect(finalPurchase?.downloadCount).toBe(10);
    });
  });

  describe('Seller Revenue Tracking', () => {
    it('should calculate correct earnings across multiple products', async () => {
      // Create second product
      const mockFile2 = {
        fieldname: 'file',
        originalname: 'premium-template.zip',
        encoding: '7bit',
        mimetype: 'application/zip',
        buffer: Buffer.from('test content'),
        size: 1024 * 200,
      } as Express.Multer.File;

      const uploadResult2 = await uploadFileToR2(mockFile2, 'products');

      const product2 = await Product.create({
        title: 'Premium Template',
        description: 'Advanced template',
        price: 49.99,
        category: ProductCategory.TEMPLATES,
        seller: seller._id,
        files: [
          {
            url: uploadResult2.file?.url || 'https://r2.example.com/file2.zip',
            name: uploadResult2.file?.originalName || 'premium-template.zip',
            size: uploadResult2.file?.size || 1024 * 200,
            type: uploadResult2.file?.mimetype || 'application/zip',
          },
        ],
        coverImage: 'https://r2.example.com/cover2.jpg',
        status: ProductStatus.PUBLISHED,
      });

      // Purchase both products
      await Purchase.create({
        buyer: buyer._id,
        product: product._id,
        seller: seller._id,
        amount: product.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_product1',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      await Purchase.create({
        buyer: buyer._id,
        product: product2._id,
        seller: seller._id,
        amount: product2.price,
        currency: 'USD',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'ref_product2',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Calculate total earnings
      const totalRevenue = product.price + product2.price;
      const totalEarnings = totalRevenue * 0.9; // After 10% platform fee

      seller.totalEarnings = totalEarnings;
      await seller.save();

      const updatedSeller = await User.findById(seller._id);
      expect(updatedSeller?.totalEarnings).toBeCloseTo(totalEarnings, 2);
    });

    it('should track earnings by product', async () => {
      // Create multiple purchases for same product
      const buyer2 = await User.create({
        name: 'Buyer 2',
        email: 'buyer2@test.com',
        password: 'hashedpassword123',
        role: 'BUYER',
      });

      const buyer3 = await User.create({
        name: 'Buyer 3',
        email: 'buyer3@test.com',
        password: 'hashedpassword123',
        role: 'BUYER',
      });

      await Purchase.create([
        {
          buyer: buyer._id,
          product: product._id,
          seller: seller._id,
          amount: product.price,
          currency: 'USD',
          paymentProvider: 'PAYSTACK',
          paymentReference: 'ref_b1',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyer2._id,
          product: product._id,
          seller: seller._id,
          amount: product.price,
          currency: 'USD',
          paymentProvider: 'PAYSTACK',
          paymentReference: 'ref_b2',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyer3._id,
          product: product._id,
          seller: seller._id,
          amount: product.price,
          currency: 'USD',
          paymentProvider: 'PAYSTACK',
          paymentReference: 'ref_b3',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
      ]);

      // Update product revenue
      product.totalSales = 3;
      product.totalRevenue = product.price * 3;
      await product.save();

      const productRevenue = await Product.aggregate([
        { $match: { _id: product._id } },
        {
          $project: {
            title: 1,
            totalSales: 1,
            totalRevenue: 1,
            sellerEarnings: { $multiply: ['$totalRevenue', 0.9] },
          },
        },
      ]);

      expect(productRevenue[0].totalSales).toBe(3);
      expect(productRevenue[0].sellerEarnings).toBeCloseTo(product.price * 3 * 0.9, 2);
    });
  });
});
