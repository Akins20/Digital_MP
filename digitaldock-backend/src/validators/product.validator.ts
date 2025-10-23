/**
 * Product Validation Schemas
 * Zod schemas for validating product requests
 */

import { z } from 'zod';
import { ProductCategory, ProductStatus } from '../models/Product';

export const createProductSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  shortDescription: z
    .string()
    .max(300, 'Short description cannot exceed 300 characters')
    .optional()
    .nullable(),
  category: z.nativeEnum(ProductCategory, {
    errorMap: () => ({ message: 'Invalid product category' }),
  }),
  tags: z
    .array(z.string().trim())
    .max(10, 'Cannot have more than 10 tags')
    .optional()
    .default([]),
  price: z.number().min(0, 'Price cannot be negative'),
  originalPrice: z.number().min(0, 'Original price cannot be negative').optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional().default('USD'),
  coverImage: z.string().url('Cover image must be a valid URL'),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(10, 'Cannot have more than 10 images')
    .optional()
    .default([]),
  demoUrl: z.string().url('Demo URL must be a valid URL').optional().nullable(),
  requirements: z
    .string()
    .max(1000, 'Requirements cannot exceed 1000 characters')
    .optional()
    .nullable(),
  includesUpdates: z.boolean().optional().default(false),
  includesSupport: z.boolean().optional().default(false),
  metaTitle: z
    .string()
    .max(60, 'Meta title cannot exceed 60 characters')
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, 'Meta description cannot exceed 160 characters')
    .optional()
    .nullable(),
});

export const updateProductSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional(),
  shortDescription: z
    .string()
    .max(300, 'Short description cannot exceed 300 characters')
    .optional()
    .nullable(),
  category: z
    .nativeEnum(ProductCategory, {
      errorMap: () => ({ message: 'Invalid product category' }),
    })
    .optional(),
  tags: z.array(z.string().trim()).max(10, 'Cannot have more than 10 tags').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  originalPrice: z.number().min(0, 'Original price cannot be negative').optional().nullable(),
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(10, 'Cannot have more than 10 images')
    .optional(),
  demoUrl: z.string().url('Demo URL must be a valid URL').optional().nullable(),
  status: z
    .nativeEnum(ProductStatus, {
      errorMap: () => ({ message: 'Invalid product status' }),
    })
    .optional(),
  requirements: z
    .string()
    .max(1000, 'Requirements cannot exceed 1000 characters')
    .optional()
    .nullable(),
  includesUpdates: z.boolean().optional(),
  includesSupport: z.boolean().optional(),
  metaTitle: z
    .string()
    .max(60, 'Meta title cannot exceed 60 characters')
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(160, 'Meta description cannot exceed 160 characters')
    .optional()
    .nullable(),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: z.nativeEnum(ProductCategory).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  seller: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'price', 'totalSales', 'averageRating'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
