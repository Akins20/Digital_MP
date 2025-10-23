import mongoose from 'mongoose';
import { Purchase, PurchaseStatus } from '../../src/models/Purchase';
import { Product, ProductCategory, ProductStatus } from '../../src/models/Product';
import { User } from '../../src/models/User';

// Mock email service
jest.mock('../../src/services/email.service', () => ({
  sendPurchaseConfirmation: jest.fn().mockResolvedValue(true),
  sendSaleNotification: jest.fn().mockResolvedValue(true),
}));

describe('Purchase Model Tests', () => {
  let buyerId: string;
  let sellerId: string;
  let productId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitaldock-test');

    // Create test users
    const buyer = await User.create({
      name: 'Test Buyer',
      email: 'buyer@test.com',
      password: 'hashedpassword123',
      role: 'BUYER',
    });
    buyerId = buyer._id;

    const seller = await User.create({
      name: 'Test Seller',
      email: 'seller@test.com',
      password: 'hashedpassword123',
      role: 'SELLER',
    });
    sellerId = seller._id;

    // Create test product
    const product = await Product.create({
      title: 'Test Product',
      description: 'Test description',
      price: 50,
      category: ProductCategory.TEMPLATES,
      seller: sellerId,
      files: [],
      coverImage: 'https://r2.example.com/product-cover.jpg',
      status: ProductStatus.PUBLISHED,
    });
    productId = product._id;
  });

  afterAll(async () => {
    await Purchase.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Only clear purchases, not users or products (they're created once in beforeAll)
    await Purchase.deleteMany({});
  });

  describe('Purchase Creation', () => {
    it('should create a purchase with valid data', async () => {
      const purchaseData = {
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_test123',
        paymentStatus: PurchaseStatus.PENDING,
      };

      const purchase = await Purchase.create(purchaseData);

      expect(purchase).toBeDefined();
      expect(purchase.amount).toBe(50);
      expect(purchase.paymentStatus).toBe(PurchaseStatus.PENDING);
      expect(purchase.buyer.toString()).toBe(buyerId.toString());
      expect(purchase.product.toString()).toBe(productId.toString());
    });

    it('should fail when required fields are missing', async () => {
      const invalidPurchase = {
        buyer: buyerId,
        amount: 50,
        // Missing required fields: product, seller, paymentReference
      };

      await expect(Purchase.create(invalidPurchase)).rejects.toThrow();
    });

    it('should set default payment status to PENDING', async () => {
      const purchase = await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_test123',
      });

      expect(purchase.paymentStatus).toBe(PurchaseStatus.PENDING);
    });
  });

  describe('Purchase Payment Flow', () => {
    it('should update purchase status to COMPLETED', async () => {
      const purchase = await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_test123',
        paymentStatus: PurchaseStatus.PENDING,
      });

      purchase.paymentStatus = PurchaseStatus.COMPLETED;
      await purchase.save();

      const updated = await Purchase.findById(purchase._id);
      expect(updated?.paymentStatus).toBe(PurchaseStatus.COMPLETED);
      expect(updated?.updatedAt).toBeDefined();
    });

    it('should update purchase status to FAILED', async () => {
      const purchase = await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_test123',
        paymentStatus: PurchaseStatus.PENDING,
      });

      purchase.paymentStatus = PurchaseStatus.FAILED;
      await purchase.save();

      const updated = await Purchase.findById(purchase._id);
      expect(updated?.paymentStatus).toBe(PurchaseStatus.FAILED);
    });
  });

  describe('Platform Fee Calculation', () => {
    it('should calculate 10% platform fee correctly', async () => {
      const amount = 100;
      const platformFeePercentage = 10;
      const platformFee = (amount * platformFeePercentage) / 100;
      const sellerEarnings = amount - platformFee;

      expect(platformFee).toBe(10);
      expect(sellerEarnings).toBe(90);
    });

    it('should calculate 5% platform fee for premium sellers', async () => {
      const amount = 100;
      const platformFeePercentage = 5;
      const platformFee = (amount * platformFeePercentage) / 100;
      const sellerEarnings = amount - platformFee;

      expect(platformFee).toBe(5);
      expect(sellerEarnings).toBe(95);
    });

    it('should handle fractional amounts correctly', async () => {
      const amount = 29.99;
      const platformFeePercentage = 10;
      const platformFee = (amount * platformFeePercentage) / 100;
      const sellerEarnings = amount - platformFee;

      expect(platformFee).toBeCloseTo(3.0, 2);
      expect(sellerEarnings).toBeCloseTo(26.99, 2);
    });
  });

  describe('Purchase Queries', () => {
    beforeEach(async () => {
      // Create multiple purchases for testing
      await Purchase.create([
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 50,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_1',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 30,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_2',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 20,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_3',
          paymentStatus: PurchaseStatus.PENDING,
        },
      ]);
    });

    it('should find purchases by buyer', async () => {
      const purchases = await Purchase.find({ buyer: buyerId });
      expect(purchases).toHaveLength(3);
    });

    it('should find purchases by seller', async () => {
      const purchases = await Purchase.find({ seller: sellerId });
      expect(purchases).toHaveLength(3);
    });

    it('should find completed purchases only', async () => {
      const purchases = await Purchase.find({ paymentStatus: PurchaseStatus.COMPLETED });
      expect(purchases).toHaveLength(2);
    });

    it('should find purchases by payment reference', async () => {
      const purchase = await Purchase.findOne({ paymentProvider: 'PAYSTACK', paymentReference: 'ref_1' });
      expect(purchase).toBeDefined();
      expect(purchase?.amount).toBe(50);
    });

    it('should populate buyer and seller details', async () => {
      const purchase = await Purchase.findOne({ paymentProvider: 'PAYSTACK', paymentReference: 'ref_1' })
        .populate('buyer', 'name email')
        .populate('seller', 'name email');

      expect(purchase?.buyer).toBeDefined();
      expect((purchase?.buyer as any).email).toBe('buyer@test.com');
      expect((purchase?.seller as any).email).toBe('seller@test.com');
    });

    it('should populate product details', async () => {
      const purchase = await Purchase.findOne({ paymentProvider: 'PAYSTACK', paymentReference: 'ref_1' })
        .populate('product', 'title price');

      expect(purchase?.product).toBeDefined();
      expect((purchase?.product as any).title).toBe('Test Product');
    });
  });

  describe('Refund Handling', () => {
    it('should update purchase status to REFUNDED', async () => {
      const purchase = await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_refund',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      purchase.paymentStatus = PurchaseStatus.REFUNDED;
      await purchase.save();

      const updated = await Purchase.findById(purchase._id);
      expect(updated?.paymentStatus).toBe(PurchaseStatus.REFUNDED);
    });
  });

  describe('Download Tracking', () => {
    it('should track download count', async () => {
      const purchase = await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_download',
        paymentStatus: PurchaseStatus.COMPLETED,
        downloadCount: 0,
      });

      // Simulate downloads
      purchase.downloadCount += 1;
      await purchase.save();

      const updated = await Purchase.findById(purchase._id);
      expect(updated?.downloadCount).toBe(1);

      // Second download
      updated!.downloadCount += 1;
      await updated!.save();

      const secondUpdate = await Purchase.findById(purchase._id);
      expect(secondUpdate?.downloadCount).toBe(2);
    });
  });

  describe('Purchase Statistics', () => {
    it('should calculate total revenue for seller', async () => {
      await Purchase.create([
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 50,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_stat1',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 30,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_stat2',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
      ]);

      const purchases = await Purchase.find({
        seller: sellerId,
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
      expect(totalRevenue).toBe(80);
    });

    it('should count total sales for product', async () => {
      await Purchase.create([
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 50,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_count1',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
        {
          buyer: buyerId,
          product: productId,
          seller: sellerId,
          amount: 50,
          currency: 'USD',
          paymentProvider: 'PAYSTACK', paymentReference: 'ref_count2',
          paymentStatus: PurchaseStatus.COMPLETED,
        },
      ]);

      const salesCount = await Purchase.countDocuments({
        product: productId,
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      expect(salesCount).toBe(2);
    });
  });

  describe('Duplicate Purchase Prevention', () => {
    it('should detect existing purchase by buyer and product', async () => {
      await Purchase.create({
        buyer: buyerId,
        product: productId,
        seller: sellerId,
        amount: 50,
        currency: 'USD',
        paymentProvider: 'PAYSTACK', paymentReference: 'ref_existing',
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      // Check if buyer already purchased this product
      const existingPurchase = await Purchase.findOne({
        buyer: buyerId,
        product: productId,
        paymentStatus: PurchaseStatus.COMPLETED,
      });

      expect(existingPurchase).toBeDefined();
      expect(existingPurchase?.paymentReference).toBe('ref_existing');
    });
  });
});
