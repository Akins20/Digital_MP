'use client';

/**
 * Purchase History Page
 * Display user's purchase history
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as purchasesApi from '@/lib/api/purchases';

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();
  const { error: showError } = useNotification();
  const [purchases, setPurchases] = useState<purchasesApi.Purchase[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [filter, setFilter] = useState<purchasesApi.PurchaseStatus | 'ALL'>('ALL');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadPurchases = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingPurchases(true);
      const params = filter !== 'ALL' ? { status: filter } : undefined;
      const response = await purchasesApi.getMyPurchases(token, params);
      setPurchases(response.purchases);
    } catch (error: any) {
      console.error('Failed to load purchases:', error);
      showError(error.message || 'Failed to load purchase history', 'Error');
    } finally {
      setIsLoadingPurchases(false);
    }
  }, [token, filter, showError]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadPurchases();
    }
  }, [isAuthenticated, token, loadPurchases]);

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      REFUNDED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          statusColors[status as keyof typeof statusColors] || statusColors.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: purchases.length,
    completed: purchases.filter((p) => p.paymentStatus === 'COMPLETED').length,
    totalSpent: purchases
      .filter((p) => p.paymentStatus === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Purchases</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and download your purchased products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchases</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(stats.totalSpent)}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Purchases</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        {/* Purchases List */}
        {isLoadingPurchases ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">
              No purchases yet
            </h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Start exploring the marketplace to find amazing products
            </p>
            <Link
              href="/marketplace"
              className="mt-6 inline-block px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <img
                      src={purchase.product.coverImage}
                      alt={purchase.product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/marketplace/${purchase.product.slug}`}
                            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            {purchase.product.title}
                          </Link>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Seller: {purchase.seller.name || 'Anonymous'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Purchased on {formatDate(purchase.createdAt)}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(purchase.amount, purchase.currency)}
                          </p>
                          <p className="mt-1">{getStatusBadge(purchase.paymentStatus)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-3">
                        {purchase.paymentStatus === 'COMPLETED' && (
                          <>
                            <Link
                              href={`/dashboard/purchases/${purchase.id}`}
                              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                              Download Files
                            </Link>
                            {purchase.downloadCount > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Downloaded {purchase.downloadCount} time{purchase.downloadCount > 1 ? 's' : ''}
                                {purchase.lastDownloadAt &&
                                  ` · Last: ${formatDate(purchase.lastDownloadAt)}`
                                }
                              </span>
                            )}
                          </>
                        )}
                        {purchase.paymentStatus === 'PENDING' && (
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">
                            Payment pending...
                          </span>
                        )}
                        {purchase.paymentStatus === 'FAILED' && (
                          <span className="text-sm text-red-600 dark:text-red-400">
                            Payment failed. Please contact support.
                          </span>
                        )}
                        {purchase.paymentStatus === 'REFUNDED' && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            This purchase has been refunded.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
