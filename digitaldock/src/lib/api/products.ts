/**
 * Products API Module
 * Handles product-related requests using the unified API client
 */

import { apiClient } from './client';

export enum ProductCategory {
  EBOOKS = 'EBOOKS',
  TEMPLATES = 'TEMPLATES',
  GRAPHICS = 'GRAPHICS',
  SOFTWARE = 'SOFTWARE',
  COURSES = 'COURSES',
  MUSIC = 'MUSIC',
  VIDEOS = 'VIDEOS',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  FONTS = 'FONTS',
  PRESETS = 'PRESETS',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: ProductCategory;
  tags: string[];
  price: number;
  originalPrice: number | null;
  currency: string;
  seller: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    sellerSlug: string | null;
    isVerifiedSeller: boolean;
  };
  files: {
    url: string;
    name: string;
    size: number;
    type: string;
  }[];
  coverImage: string;
  images: string[];
  demoUrl: string | null;
  status: ProductStatus;
  featured: boolean;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  requirements: string | null;
  includesUpdates: boolean;
  includesSupport: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  discountPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  product: Product;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  seller?: string;
  search?: string;
  sortBy?: 'createdAt' | 'price' | 'totalSales' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  title: string;
  description: string;
  shortDescription?: string | null;
  category: ProductCategory;
  tags?: string[];
  price: number;
  originalPrice?: number | null;
  currency?: string;
  coverImage: string;
  images?: string[];
  files?: Array<{
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
  demoUrl?: string | null;
  requirements?: string | null;
  includesUpdates?: boolean;
  includesSupport?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: ProductStatus;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
  const queryParams: Record<string, string> = {};

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });
  }

  return apiClient.get<ProductsResponse>('/api/products', { params: queryParams });
}

/**
 * Get a single product by ID or slug
 */
export async function getProduct(id: string, token?: string): Promise<ProductResponse> {
  return apiClient.get<ProductResponse>(`/api/products/${id}`, { token });
}

/**
 * Get current seller's products
 */
export async function getMyProducts(
  token: string,
  params?: ProductQueryParams
): Promise<ProductsResponse> {
  const queryParams: Record<string, string> = {};

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = String(value);
      }
    });
  }

  return apiClient.get<ProductsResponse>('/api/products/my', { token, params: queryParams });
}

/**
 * Create a new product (seller only)
 */
export async function createProduct(
  token: string,
  data: CreateProductData
): Promise<ProductResponse & { message: string }> {
  return apiClient.post<ProductResponse & { message: string }>('/api/products', data, { token });
}

/**
 * Update a product (seller only - own products)
 */
export async function updateProduct(
  token: string,
  productId: string,
  data: UpdateProductData
): Promise<ProductResponse & { message: string }> {
  return apiClient.put<ProductResponse & { message: string }>(
    `/api/products/${productId}`,
    data,
    { token }
  );
}

/**
 * Delete a product (seller only - own products)
 */
export async function deleteProduct(
  token: string,
  productId: string
): Promise<{ message: string; product?: Product }> {
  return apiClient.delete<{ message: string; product?: Product }>(`/api/products/${productId}`, {
    token,
  });
}
