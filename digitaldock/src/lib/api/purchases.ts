/**
 * Purchases API Module
 * Handles purchase and payment requests using the unified API client
 */

import { apiClient } from './client';

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  PAYSTACK = 'PAYSTACK',
}

export interface Purchase {
  id: string;
  buyer: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    files: {
      url: string;
      name: string;
      size: number;
      type: string;
    }[];
  };
  seller: {
    id: string;
    name: string | null;
    email: string;
  };
  amount: number;
  currency: string;
  platformFee: number;
  sellerEarnings: number;
  paymentProvider: PaymentProvider;
  paymentReference: string;
  paymentStatus: PurchaseStatus;
  downloadCount: number;
  lastDownloadAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitializePurchaseRequest {
  productId: string;
}

export interface InitializePurchaseResponse {
  message: string;
  purchase: Purchase;
  paymentUrl: string;
  reference: string;
}

export interface VerifyPurchaseResponse {
  message: string;
  purchase: Purchase;
}

export interface MyPurchasesResponse {
  purchases: Purchase[];
  total: number;
}

export interface MySalesResponse {
  sales: Purchase[];
  stats: {
    totalSales: number;
    totalRevenue: number;
    currency: string;
  };
}

export interface DownloadLinksResponse {
  files: {
    name: string;
    url: string;
    size: number;
  }[];
  downloadCount: number;
}

export interface PurchaseQueryParams {
  status?: PurchaseStatus;
}

/**
 * Initialize a purchase and get payment URL
 */
export async function initializePurchase(
  token: string,
  data: InitializePurchaseRequest
): Promise<InitializePurchaseResponse> {
  return apiClient.post<InitializePurchaseResponse>(
    '/api/purchases/initialize',
    data,
    { token }
  );
}

/**
 * Verify payment and complete purchase
 */
export async function verifyPurchase(
  token: string,
  reference: string
): Promise<VerifyPurchaseResponse> {
  return apiClient.get<VerifyPurchaseResponse>(
    `/api/purchases/verify/${reference}`,
    { token }
  );
}

/**
 * Get current user's purchase history
 */
export async function getMyPurchases(
  token: string,
  params?: PurchaseQueryParams
): Promise<MyPurchasesResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.status) {
    queryParams.status = params.status;
  }

  return apiClient.get<MyPurchasesResponse>(
    '/api/purchases/my-purchases',
    { token, params: queryParams }
  );
}

/**
 * Get seller's sales history and stats
 */
export async function getMySales(
  token: string,
  params?: PurchaseQueryParams
): Promise<MySalesResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.status) {
    queryParams.status = params.status;
  }

  return apiClient.get<MySalesResponse>(
    '/api/purchases/my-sales',
    { token, params: queryParams }
  );
}

/**
 * Get download links for purchased product
 */
export async function getDownloadLinks(
  token: string,
  purchaseId: string
): Promise<DownloadLinksResponse> {
  return apiClient.get<DownloadLinksResponse>(
    `/api/purchases/${purchaseId}/download`,
    { token }
  );
}
