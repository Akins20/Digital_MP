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
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import { ShoppingBag, Download, Package, DollarSign, Calendar, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react';

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
    const statusVariants: { [key: string]: 'success' | 'warning' | 'danger' | 'secondary' } = {
      COMPLETED: 'success',
      PENDING: 'warning',
      FAILED: 'danger',
      REFUNDED: 'secondary',
    };

    const variant = statusVariants[status] || 'warning';

    return <IOSBadge variant={variant}>{status}</IOSBadge>;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      COMPLETED: <CheckCircle className="w-4 h-4" />,
      PENDING: <Clock className="w-4 h-4" />,
      FAILED: <XCircle className="w-4 h-4" />,
      REFUNDED: <RotateCcw className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />;
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-blue-500 border-t-transparent"></div>
          <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading purchases...</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 pt-16">
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Header */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">My Purchases</h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            View and download your purchased products
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-ios-lg mb-ios-xl">
          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-md">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Purchases</p>
                <p className="text-ios-title1 font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-ios-md">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Completed</p>
                <p className="text-ios-title1 font-bold text-ios-green-600 dark:text-ios-green-400">
                  {stats.completed}
                </p>
              </div>
            </div>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-ios-md">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-blue-600 rounded-ios-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Spent</p>
                <p className="text-ios-title1 font-bold text-ios-blue-600 dark:text-ios-blue-400">
                  {formatPrice(stats.totalSpent)}
                </p>
              </div>
            </div>
          </IOSCard>
        </div>

        {/* Filter */}
        <IOSCard blur padding="md" className="mb-ios-lg animate-ios-slide-up">
          <div className="flex items-center gap-ios-md">
            <label className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300">
              Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-footnote text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
            >
              <option value="ALL">All Purchases</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </IOSCard>

        {/* Purchases List */}
        {isLoadingPurchases ? (
          <div className="flex flex-col items-center justify-center py-ios-3xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-blue-500 border-t-transparent"></div>
            <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading purchases...</p>
          </div>
        ) : purchases.length === 0 ? (
          <IOSCard blur padding="lg" className="text-center py-ios-3xl">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-full flex items-center justify-center mx-auto mb-ios-lg">
                <ShoppingBag className="w-10 h-10 text-ios-gray-400" />
              </div>
              <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                No purchases yet
              </h3>
              <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400 mb-ios-xl">
                Start exploring the marketplace to find amazing products
              </p>
              <Link href="/marketplace">
                <IOSButton variant="primary" size="lg">
                  <Package className="w-4 h-4" />
                  Browse Marketplace
                </IOSButton>
              </Link>
            </div>
          </IOSCard>
        ) : (
          <div className="space-y-ios-lg">
            {purchases.map((purchase, index) => (
              <IOSCard
                key={purchase.id}
                blur
                hover
                padding="lg"
                className="animate-ios-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-ios-md">
                  {/* Product Image */}
                  <Link href={`/marketplace/${purchase.product.slug}`} className="flex-shrink-0">
                    <img
                      src={purchase.product.coverImage}
                      alt={purchase.product.title}
                      className="w-full sm:w-24 h-24 object-cover rounded-ios-lg shadow-ios-sm hover:shadow-ios transition-shadow"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-ios-md">
                      <div className="flex-1">
                        <Link
                          href={`/marketplace/${purchase.product.slug}`}
                          className="text-ios-title3 font-semibold text-gray-900 dark:text-white hover:text-ios-blue-600 dark:hover:text-ios-blue-400 transition-colors"
                        >
                          {purchase.product.title}
                        </Link>
                        <p className="mt-ios-xs text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
                          Seller: {purchase.seller.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-ios-xs mt-ios-xs text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(purchase.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-ios-sm">
                        <p className="text-ios-title3 font-bold text-gray-900 dark:text-white">
                          {formatPrice(purchase.amount, purchase.currency)}
                        </p>
                        <div className="flex items-center gap-ios-xs">
                          {getStatusIcon(purchase.paymentStatus)}
                          {getStatusBadge(purchase.paymentStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-ios-md flex flex-wrap items-center gap-ios-sm">
                      {purchase.paymentStatus === 'COMPLETED' && (
                        <>
                          <Link href={`/dashboard/purchases/${purchase.id}`}>
                            <IOSButton variant="primary" size="sm">
                              <Download className="w-4 h-4" />
                              Download Files
                            </IOSButton>
                          </Link>
                          {purchase.downloadCount > 0 && (
                            <span className="text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400">
                              Downloaded {purchase.downloadCount} time{purchase.downloadCount > 1 ? 's' : ''}
                              {purchase.lastDownloadAt &&
                                ` · Last: ${formatDate(purchase.lastDownloadAt)}`
                              }
                            </span>
                          )}
                        </>
                      )}
                      {purchase.paymentStatus === 'PENDING' && (
                        <span className="text-ios-footnote text-ios-orange-600 dark:text-ios-orange-400 flex items-center gap-ios-xs">
                          <Clock className="w-4 h-4" />
                          Payment pending...
                        </span>
                      )}
                      {purchase.paymentStatus === 'FAILED' && (
                        <span className="text-ios-footnote text-ios-red-600 dark:text-ios-red-400 flex items-center gap-ios-xs">
                          <XCircle className="w-4 h-4" />
                          Payment failed. Please contact support.
                        </span>
                      )}
                      {purchase.paymentStatus === 'REFUNDED' && (
                        <span className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 flex items-center gap-ios-xs">
                          <RotateCcw className="w-4 h-4" />
                          This purchase has been refunded.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </IOSCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
