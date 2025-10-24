'use client';

/**
 * Marketplace Page
 * Browse and search digital products
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import * as productsApi from '@/lib/api/products';
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import { ShoppingBag, Package, BadgeCheck, Star, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<productsApi.Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<productsApi.ProductQueryParams>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsApi.getProducts(filters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: productsApi.ProductCategory | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'ALL' ? undefined : category,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.split('-');
    setFilters((prev) => ({
      ...prev,
      sortBy: field as any,
      sortOrder: order as 'asc' | 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const categories = [
    { value: 'ALL', label: 'All Products' },
    { value: 'EBOOKS', label: 'E-Books' },
    { value: 'TEMPLATES', label: 'Templates' },
    { value: 'GRAPHICS', label: 'Graphics' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'COURSES', label: 'Courses' },
    { value: 'MUSIC', label: 'Music' },
    { value: 'VIDEOS', label: 'Videos' },
    { value: 'PHOTOGRAPHY', label: 'Photography' },
    { value: 'FONTS', label: 'Fonts' },
    { value: 'PRESETS', label: 'Presets' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10 pt-16">
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Header */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">Marketplace</h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            Discover amazing digital products from talented creators worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-ios-md mb-ios-lg">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-ios-xs">
            {categories.slice(0, 6).map((category) => {
              const isActive = (category.value === 'ALL' && !filters.category) || filters.category === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value as any)}
                  className={`
                    px-ios-md py-ios-sm rounded-ios-lg text-ios-footnote font-semibold
                    transition-all duration-200
                    ${isActive
                      ? 'bg-ios-blue-500 text-white'
                      : 'bg-white/50 dark:bg-ios-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-ios-gray-800'
                    }
                  `}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <select
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-ios-md py-ios-sm rounded-ios-lg bg-white/50 dark:bg-ios-gray-800/50 backdrop-blur-ios border border-ios-gray-200 dark:border-ios-gray-700 text-ios-footnote text-gray-900 dark:text-white focus:outline-none focus:border-ios-blue-500 transition-all"
          >
            <option value="createdAt-desc">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="totalSales-desc">Popular</option>
            <option value="averageRating-desc">Top Rated</option>
          </select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-ios-3xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-blue-500 border-t-transparent"></div>
            <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <IOSCard blur padding="lg" className="text-center py-ios-3xl">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-full flex items-center justify-center mx-auto mb-ios-lg">
                <Package className="w-10 h-10 text-ios-gray-400" />
              </div>
              <p className="text-ios-title3 font-semibold text-gray-900 dark:text-white mb-ios-xs">No products found</p>
              <p className="text-ios-subheadline text-ios-gray-600 dark:text-ios-gray-400">Try adjusting your filters to see more results</p>
            </div>
          </IOSCard>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-ios-lg">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.slug}`}
                  className="group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <IOSCard hover padding="none" className="h-full overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-video bg-ios-gray-100 dark:bg-ios-gray-800 overflow-hidden">
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-ios-md">
                      {/* Seller */}
                      <div className="flex items-center gap-ios-xs mb-ios-xs">
                        <span className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
                          {product.seller.name || 'Anonymous'}
                        </span>
                        {product.seller.isVerifiedSeller && (
                          <BadgeCheck className="w-3 h-3 text-ios-blue-500 fill-current" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-ios-body font-medium text-gray-900 dark:text-white mb-ios-sm line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Rating & Price */}
                      <div className="flex items-center justify-between">
                        {product.totalReviews > 0 ? (
                          <div className="flex items-center gap-ios-xs">
                            <Star className="w-3.5 h-3.5 text-ios-orange-500 fill-current" />
                            <span className="text-ios-footnote font-semibold text-gray-900 dark:text-white">
                              {product.averageRating.toFixed(1)}
                            </span>
                            <span className="text-ios-caption2 text-ios-gray-500">
                              ({product.totalReviews})
                            </span>
                          </div>
                        ) : (
                          <div />
                        )}
                        <span className="text-ios-body font-bold text-gray-900 dark:text-white">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      </div>
                    </div>
                  </IOSCard>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-ios-3xl">
                <IOSCard blur padding="md" className="inline-flex items-center gap-ios-xs mx-auto">
                  <IOSButton
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="ghost"
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </IOSButton>

                  <div className="flex items-center gap-ios-xs">
                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.pages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`
                              min-w-[2.5rem] h-10 rounded-ios-lg text-ios-body font-semibold
                              transition-all duration-200 active:scale-95
                              ${
                                page === pagination.page
                                  ? 'bg-ios-blue-500 text-white shadow-ios-sm'
                                  : 'bg-ios-gray-100 dark:bg-ios-gray-800 text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700'
                              }
                            `}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                        return (
                          <span key={page} className="px-ios-xs text-ios-gray-400">
                            •••
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <IOSButton
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    variant="ghost"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </IOSButton>
                </IOSCard>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
