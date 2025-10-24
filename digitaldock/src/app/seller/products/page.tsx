'use client';

/**
 * Seller Products Management Page
 * Manage and view all seller products
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import * as productsApi from '@/lib/api/products';
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import {
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Archive
} from 'lucide-react';

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { success, error: showError } = useNotification();
  const [products, setProducts] = useState<productsApi.Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<productsApi.ProductQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'SELLER')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SELLER') {
      loadProducts();
    }
  }, [filters, isAuthenticated, user]);

  const loadProducts = async () => {
    if (!token) return;

    try {
      setIsLoadingProducts(true);
      const response = await productsApi.getMyProducts(token, filters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      showError(error.message || 'Failed to load your products', 'Error');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirm({ isOpen: true, productId });
  };

  const handleDeleteConfirm = async () => {
    const productId = deleteConfirm.productId;
    setDeleteConfirm({ isOpen: false, productId: null });

    if (!productId || !token) {
      showError('Authentication required', 'Error');
      return;
    }

    try {
      setDeletingId(productId);
      await productsApi.deleteProduct(token, productId);
      success('Product deleted successfully', 'Success');
      loadProducts(); // Reload products
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      showError(error.message || 'Failed to delete product', 'Error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (productId: string, newStatus: productsApi.ProductStatus) => {
    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    try {
      await productsApi.updateProduct(token, productId, { status: newStatus });
      success(`Product ${newStatus.toLowerCase()} successfully`, 'Success');
      loadProducts(); // Reload products
    } catch (error: any) {
      console.error('Failed to update product status:', error);
      showError(error.message || 'Failed to update product status', 'Error');
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusVariants: { [key: string]: 'green' | 'orange' | 'gray' } = {
      PUBLISHED: 'green',
      DRAFT: 'orange',
      ARCHIVED: 'gray',
    };

    return (
      <IOSBadge variant={statusVariants[status] || 'orange'}>
        {status}
      </IOSBadge>
    );
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-orange-500 border-t-transparent"></div>
          <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: products.length,
    published: products.filter((p) => p.status === 'PUBLISHED').length,
    draft: products.filter((p) => p.status === 'DRAFT').length,
    totalSales: products.reduce((sum, p) => sum + (p.totalSales || 0), 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.totalRevenue || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 pt-16">
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Header */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <div className="flex items-start justify-between gap-ios-lg">
            <div className="flex-1">
              <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">
                My Products
              </h1>
              <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
                Manage your digital products and listings
              </p>
            </div>

            <Link href="/seller/products/new">
              <IOSButton variant="primary" size="md">
                <Plus className="w-4 h-4" />
                Create Product
              </IOSButton>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-ios-md mb-ios-xl">
          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-sm mb-ios-xs">
              <Package className="w-5 h-5 text-ios-orange-500" />
              <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Products</p>
            </div>
            <p className="text-ios-title1 font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-sm mb-ios-xs">
              <CheckCircle className="w-5 h-5 text-ios-green-500" />
              <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Published</p>
            </div>
            <p className="text-ios-title1 font-bold text-ios-green-600 dark:text-ios-green-400">
              {stats.published}
            </p>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-sm mb-ios-xs">
              <FileText className="w-5 h-5 text-ios-orange-500" />
              <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Drafts</p>
            </div>
            <p className="text-ios-title1 font-bold text-ios-orange-600 dark:text-ios-orange-400">
              {stats.draft}
            </p>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-sm mb-ios-xs">
              <TrendingUp className="w-5 h-5 text-ios-blue-500" />
              <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Sales</p>
            </div>
            <p className="text-ios-title1 font-bold text-ios-blue-600 dark:text-ios-blue-400">
              {stats.totalSales}
            </p>
          </IOSCard>

          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-sm mb-ios-xs">
              <DollarSign className="w-5 h-5 text-ios-purple-500" />
              <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Revenue</p>
            </div>
            <p className="text-ios-title1 font-bold text-ios-purple-600 dark:text-ios-purple-400">
              {formatPrice(stats.totalRevenue)}
            </p>
          </IOSCard>
        </div>

        {/* Filters */}
        <IOSCard blur padding="md" className="mb-ios-lg animate-ios-slide-up">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-ios-sm">
            <select
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value ? e.target.value as productsApi.ProductStatus : undefined,
                  page: 1,
                }))
              }
              className="px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all"
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setFilters((prev) => ({
                  ...prev,
                  sortBy: field as any,
                  sortOrder: order as 'asc' | 'desc',
                  page: 1,
                }));
              }}
              className="px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Name: A-Z</option>
              <option value="title-desc">Name: Z-A</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="totalSales-desc">Most Sales</option>
            </select>
          </div>
        </IOSCard>

        {/* Products List */}
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-ios-3xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-orange-500 border-t-transparent"></div>
            <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <IOSCard blur padding="lg" className="text-center py-ios-3xl">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-full flex items-center justify-center mx-auto mb-ios-lg">
                <Package className="w-10 h-10 text-ios-gray-400" />
              </div>
              <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                No products yet
              </h3>
              <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400 mb-ios-xl">
                Get started by creating your first product
              </p>
              <Link href="/seller/products/new">
                <IOSButton variant="primary" size="lg">
                  <Plus className="w-4 h-4" />
                  Create Product
                </IOSButton>
              </Link>
            </div>
          </IOSCard>
        ) : (
          <>
            {/* Products Cards */}
            <div className="space-y-ios-md">
              {products.map((product, index) => (
                <IOSCard
                  key={product.id}
                  blur
                  hover
                  padding="none"
                  className="animate-ios-slide-up overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image - Full Left Side */}
                    <Link href={`/marketplace/${product.slug}`} className="flex-shrink-0">
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-full sm:w-28 h-24 sm:h-full object-cover"
                      />
                    </Link>

                    {/* Content Area with Padding */}
                    <div className="flex-1 p-ios-sm flex flex-col lg:flex-row gap-ios-sm">
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/marketplace/${product.slug}`}
                          className="text-ios-title3 font-semibold text-gray-900 dark:text-white hover:text-ios-orange-600 dark:hover:text-ios-orange-400 transition-colors line-clamp-1"
                        >
                          {product.title}
                        </Link>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400 mt-ios-xs">
                          {product.category}
                        </p>
                        <div className="flex items-center gap-ios-sm mt-ios-sm">
                          {getStatusBadge(product.status)}
                          <span className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">
                            {formatDate(product.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-start gap-ios-sm">
                        {/* Stats */}
                        <div className="flex gap-ios-sm">
                          <div>
                            <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">Price</p>
                            <p className="text-ios-body font-semibold text-gray-900 dark:text-white">
                              {formatPrice(product.price, product.currency)}
                            </p>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400 line-through">
                                {formatPrice(product.originalPrice, product.currency)}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">Sales</p>
                            <p className="text-ios-body font-semibold text-ios-blue-600 dark:text-ios-blue-400">
                              {product.totalSales}
                            </p>
                          </div>

                          <div>
                            <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">Revenue</p>
                            <p className="text-ios-body font-semibold text-ios-purple-600 dark:text-ios-purple-400">
                              {formatPrice(product.totalRevenue || 0, product.currency)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-ios-xs">
                          <Link href={`/marketplace/${product.slug}`} title="View">
                            <IOSButton variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </IOSButton>
                          </Link>

                          <Link href={`/seller/products/${product.id}/edit`} title="Edit">
                            <IOSButton variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </IOSButton>
                          </Link>

                          {product.status === 'PUBLISHED' ? (
                            <IOSButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(product.id, productsApi.ProductStatus.DRAFT)}
                              title="Unpublish"
                            >
                              <XCircle className="w-4 h-4 text-ios-orange-600" />
                            </IOSButton>
                          ) : (
                            <IOSButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(product.id, productsApi.ProductStatus.PUBLISHED)}
                              title="Publish"
                            >
                              <CheckCircle className="w-4 h-4 text-ios-green-600" />
                            </IOSButton>
                          )}

                          <IOSButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={deletingId === product.id}
                            title="Delete"
                          >
                            {deletingId === product.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-ios-red-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Trash2 className="w-4 h-4 text-ios-red-600" />
                            )}
                          </IOSButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </IOSCard>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-ios-xl flex justify-center items-center gap-ios-xs">
                <IOSButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </IOSButton>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <IOSButton
                        key={page}
                        variant={page === pagination.page ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </IOSButton>
                    );
                  } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                    return (
                      <span key={page} className="px-ios-xs text-ios-gray-500 dark:text-ios-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <IOSButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </IOSButton>
              </div>
            )}
          </>
        )}
      </main>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, productId: null })}
      />
    </div>
  );
}
