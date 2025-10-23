'use client';

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'BUYER' | 'SELLER' | 'ADMIN';
  requireVerifiedSeller?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireRole,
  requireVerifiedSeller = false,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Check role requirement
    if (requireRole && user?.role !== requireRole) {
      router.push('/unauthorized');
      return;
    }

    // Check verified seller requirement
    if (requireVerifiedSeller && !user?.isVerifiedSeller) {
      router.push('/verify-seller');
      return;
    }
  }, [isLoading, isAuthenticated, user, requireRole, requireVerifiedSeller, router, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if role requirement not met
  if (requireRole && user?.role !== requireRole) {
    return null;
  }

  // Don't render if verified seller requirement not met
  if (requireVerifiedSeller && !user?.isVerifiedSeller) {
    return null;
  }

  return <>{children}</>;
}
