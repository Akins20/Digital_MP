/**
 * Auth API Module
 * Handles authentication requests using the unified API client
 */

import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isPremium: boolean;
  isVerifiedSeller: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  role?: 'BUYER' | 'SELLER';
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/api/auth/register', data);
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/api/auth/login', credentials);
}

/**
 * Get current user profile
 */
export async function getMe(token: string): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>('/api/auth/me', { token });
}
