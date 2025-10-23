import mongoose from 'mongoose';
import { Product, ProductStatus, ProductCategory } from '../../src/models/Product';
import { User } from '../../src/models/User';

describe('Product Model Tests', () => {
  let sellerId: string;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digitaldock-test');

    // Create a test seller
    const seller = await User.create({
      name: 'Test Seller',
      email: 'seller@test.com',
      password: 'hashedpassword123',
      role: 'SELLER',
    });
    sellerId = seller._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  describe('Product Creation', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        title: 'Awesome Notion Template',
        description: 'A comprehensive productivity template',
        price: 29.99,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [],
        coverImage: 'https://r2.example.com/cover.jpg',
        images: ['https://r2.example.com/image1.jpg'],
        tags: ['notion', 'productivity', 'template'],
      };

      const product = await Product.create(productData);

      expect(product).toBeDefined();
      expect(product.title).toBe(productData.title);
      expect(product.price).toBe(productData.price);
      expect(product.status).toBe(ProductStatus.DRAFT); // Default status
      expect(product.slug).toBeDefined();
      expect(product.slug).toMatch(/awesome-notion-template/);
    });

    it('should generate unique slugs for products with same title', async () => {
      const productData = {
        title: 'Same Title',
        description: 'Product 1',
        price: 10,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [],
        coverImage: 'https://r2.example.com/cover.jpg',
      };

      const product1 = await Product.create(productData);
      const product2 = await Product.create({
        ...productData,
        description: 'Product 2',
      });

      expect(product1.slug).not.toBe(product2.slug);
      expect(product2.slug).toMatch(/same-title-\w+/);
    });

    it('should fail when required fields are missing', async () => {
      const invalidProduct = {
        title: 'Incomplete Product',
        // Missing required fields: description, price, category, seller, files
      };

      await expect(Product.create(invalidProduct)).rejects.toThrow();
    });

    it('should fail when price is negative', async () => {
      const invalidProduct = {
        title: 'Negative Price Product',
        description: 'Should fail',
        price: -10,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
      };

      await expect(Product.create(invalidProduct)).rejects.toThrow();
    });

    it('should create product with high price', async () => {
      const product = await Product.create({
        title: 'Expensive Product',
        description: 'Premium product',
        price: 999.99,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
      });

      expect(product.price).toBe(999.99);
    });

    it('should create product with tags', async () => {
      const productData = {
        title: 'Tagged Product',
        description: 'Product with tags',
        price: 15,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const product = await Product.create(productData);

      expect(product.tags).toHaveLength(3);
      expect(product.tags).toContain('tag1');
    });
  });

  describe('Product Updates', () => {
    it('should update product fields', async () => {
      const product = await Product.create({
        title: 'Original Title',
        description: 'Original description',
        price: 20,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
      });

      product.title = 'Updated Title';
      product.price = 25;
      await product.save();

      const updated = await Product.findById(product._id);
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.price).toBe(25);
      expect(updated?.updatedAt).not.toBe(product.createdAt);
    });

    it('should update product status', async () => {
      const product = await Product.create({
        title: 'Test Product',
        description: 'Test description',
        price: 20,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
      });

      expect(product.status).toBe(ProductStatus.DRAFT);

      product.status = ProductStatus.PUBLISHED;
      await product.save();

      const updated = await Product.findById(product._id);
      expect(updated?.status).toBe(ProductStatus.PUBLISHED);
    });
  });

  describe('Product Queries', () => {
    beforeEach(async () => {
      // Create multiple products for testing
      await Product.create([
        {
          title: 'Notion Template 1',
          description: 'First template',
          price: 10,
          category: ProductCategory.TEMPLATES,
          seller: sellerId,
          files: [],
          coverImage: 'https://r2.example.com/cover1.jpg',
          status: ProductStatus.PUBLISHED,
          tags: ['notion', 'productivity'],
        },
        {
          title: 'Notion Template 2',
          description: 'Second template',
          price: 20,
          category: ProductCategory.TEMPLATES,
          seller: sellerId,
          files: [],
          coverImage: 'https://r2.example.com/cover2.jpg',
          status: ProductStatus.PUBLISHED,
          tags: ['notion', 'business'],
        },
        {
          title: 'Figma Design Kit',
          description: 'Design system',
          price: 30,
          category: ProductCategory.GRAPHICS,
          seller: sellerId,
          files: [],
          coverImage: 'https://r2.example.com/cover3.jpg',
          status: ProductStatus.DRAFT,
          tags: ['figma', 'design'],
        },
      ]);
    });

    it('should find products by category', async () => {
      const products = await Product.find({ category: ProductCategory.TEMPLATES });
      expect(products).toHaveLength(2);
    });

    it('should find published products only', async () => {
      const products = await Product.find({ status: ProductStatus.PUBLISHED });
      expect(products).toHaveLength(2);
    });

    it('should find products by seller', async () => {
      const products = await Product.find({ seller: sellerId });
      expect(products).toHaveLength(3);
    });

    it('should search products by title', async () => {
      const products = await Product.find({
        title: { $regex: 'Notion', $options: 'i' },
      });
      expect(products).toHaveLength(2);
    });

    it('should find products by price range', async () => {
      const products = await Product.find({
        price: { $gte: 15, $lte: 25 },
      });
      expect(products).toHaveLength(1);
      expect(products[0].title).toBe('Notion Template 2');
    });

    it('should find products by tags', async () => {
      const products = await Product.find({
        tags: { $in: ['productivity'] },
      });
      expect(products).toHaveLength(1);
    });
  });

  describe('Product Deletion', () => {
    it('should delete a product', async () => {
      const product = await Product.create({
        title: 'To Delete',
        description: 'Will be deleted',
        price: 10,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
      });

      await Product.findByIdAndDelete(product._id);

      const deleted = await Product.findById(product._id);
      expect(deleted).toBeNull();
    });
  });

  describe('Product Statistics', () => {
    it('should track total sales', async () => {
      const product = await Product.create({
        title: 'Popular Product',
        description: 'Bestseller',
        price: 50,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
        totalSales: 0,
      });

      product.totalSales += 1;
      await product.save();

      const updated = await Product.findById(product._id);
      expect(updated?.totalSales).toBe(1);
    });

    it('should track total revenue', async () => {
      const product = await Product.create({
        title: 'Revenue Product',
        description: 'Tracks revenue',
        price: 50,
        category: ProductCategory.TEMPLATES,
        seller: sellerId,
        files: [], coverImage: 'https://r2.example.com/cover.jpg',
        totalRevenue: 0,
      });

      product.totalRevenue += 50;
      await product.save();

      const updated = await Product.findById(product._id);
      expect(updated?.totalRevenue).toBe(50);
    });
  });
});
