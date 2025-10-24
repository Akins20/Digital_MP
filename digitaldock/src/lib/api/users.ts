/**
 * Users API Module
 * Handles user profile and account management
 */

import { apiClient } from './client';

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  sellerSlug: string | null;
  isVerifiedSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalPurchases: number;
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
}

export interface UserProfile {
  user: User;
  stats: UserStats;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface UpgradeToSellerData {
  sellerSlug: string;
  bio?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get current user profile
 */
export async function getMyProfile(token: string): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/api/users/me', { token });
}

/**
 * Update current user profile
 */
export async function updateProfile(
  token: string,
  data: UpdateProfileData
): Promise<{ user: User }> {
  return apiClient.put<{ user: User }>('/api/users/me', data, { token });
}

/**
 * Upgrade to seller account
 */
export async function upgradeToSeller(
  token: string,
  data: UpgradeToSellerData
): Promise<{ user: User }> {
  return apiClient.post<{ user: User }>('/api/users/upgrade-to-seller', data, { token });
}

/**
 * Change password
 */
export async function changePassword(
  token: string,
  data: ChangePasswordData
): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/api/users/change-password', data, { token });
}

/**
 * Get user by seller slug (public)
 */
export async function getUserBySlug(slug: string): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>(`/api/users/seller/${slug}`);
}

/**
 * Delete user account
 */
export async function deleteAccount(
  token: string,
  password: string
): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>('/api/users/me', { password }, { token });
}
