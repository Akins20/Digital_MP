/**
 * Product Controllers
 * Handles product CRUD operations
 */

import { Response } from 'express';
import { Product, ProductStatus } from '../models/Product';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/product.validator';

/**
 * Get all products with filtering and pagination
 */
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validation = productQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.errors,
      });
      return;
    }

    const {
      page,
      limit,
      category,
      status,
      minPrice,
      maxPrice,
      featured,
      seller,
      search,
      sortBy,
      sortOrder,
    } = validation.data;

    // Build query
    const query: any = {};

    // Only published products for non-authenticated users or non-sellers
    if (!req.user || req.user.role !== 'SELLER') {
      query.status = ProductStatus.PUBLISHED;
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (featured !== undefined) {
      query.featured = featured;
    }

    if (seller) {
      query.seller = seller;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query (don't use .lean() to get virtuals and transforms)
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email avatar sellerSlug isVerifiedSeller')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    // Explicitly convert to JSON to ensure transforms are applied
    const productsJson = products.map(p => p.toJSON());

    res.status(200).json({
      products: productsJson,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'An error occurred while fetching products' });
  }
};

/**
 * Get single product by ID or slug
 */
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let product = null;

    // Check if id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ID first (don't populate yet)
      product = await Product.findById(id);
    }

    // If not found by ID or not a valid ObjectId, try by slug
    if (!product) {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Store the seller ID before populating (it's an ObjectId at this point)
    const sellerId = product.seller.toString();

    // Check if user can view this product
    if (product.status !== ProductStatus.PUBLISHED) {
      // Only seller or admin can view unpublished products
      if (!req.user || (req.user.userId !== sellerId && req.user.role !== 'ADMIN')) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
    }

    // Now populate the seller info
    await product.populate('seller', 'name email avatar sellerSlug isVerifiedSeller');

    res.status(200).json({ product: product.toJSON() });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'An error occurred while fetching the product' });
  }
};

/**
 * Create new product (Seller only)
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const validation = createProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const productData = validation.data;

    // Create product
    const product = await Product.create({
      ...productData,
      seller: req.user.userId,
      status: ProductStatus.DRAFT,
    });

    // Populate seller info
    await product.populate('seller', 'name email avatar sellerSlug isVerifiedSeller');

    res.status(201).json({
      message: 'Product created successfully',
      product: product.toJSON(),
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'An error occurred while creating the product' });
  }
};

/**
 * Update product (Seller only - own products)
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const validation = updateProductSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user owns this product (or is admin)
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You do not have permission to update this product' });
      return;
    }

    // Update product
    Object.assign(product, validation.data);
    await product.save();

    // Populate seller info
    await product.populate('seller', 'name email avatar sellerSlug isVerifiedSeller');

    res.status(200).json({
      message: 'Product updated successfully',
      product: product.toJSON(),
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'An error occurred while updating the product' });
  }
};

/**
 * Delete product (Seller only - own products)
 */
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if user owns this product (or is admin)
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You do not have permission to delete this product' });
      return;
    }

    // Check if product has sales
    if (product.totalSales > 0) {
      // Archive instead of delete
      product.status = ProductStatus.ARCHIVED;
      await product.save();
      res.status(200).json({
        message: 'Product archived successfully (has existing sales)',
        product: product.toJSON(),
      });
      return;
    }

    await product.deleteOne();

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the product' });
  }
};

/**
 * Get seller's own products
 */
export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const validation = productQuerySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid query parameters',
        details: validation.error.errors,
      });
      return;
    }

    const { page, limit, category, status, sortBy, sortOrder } = validation.data;

    // Build query
    const query: any = { seller: req.user.userId };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query (don't use .lean() to get virtuals and transforms)
    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    // Explicitly convert to JSON to ensure transforms are applied
    const productsJson = products.map(p => p.toJSON());

    res.status(200).json({
      products: productsJson,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'An error occurred while fetching your products' });
  }
};
