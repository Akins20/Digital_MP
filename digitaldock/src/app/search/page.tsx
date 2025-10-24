'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IOSCard, IOSBadge, IOSButton } from '@/components/ios';
import { Search, Filter, SlidersHorizontal, Star, X, Package } from 'lucide-react';

interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  coverImage?: string;
  seller: {
    name: string;
  };
  category: string;
  rating?: number;
  totalSales?: number;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  const categories = [
    'All',
    'Templates',
    'Graphics',
    'Software',
    'Audio',
    '3D Models',
    'Ebooks',
    'Photos',
    'Videos',
    'Fonts',
    'Themes',
    'Plugins',
  ];

  const sortOptions = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Newest', value: '-createdAt' },
    { label: 'Best Selling', value: '-totalSales' },
    { label: 'Highest Rated', value: '-rating' },
  ];

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/products?search=${encodeURIComponent(searchTerm)}`;

      if (selectedCategory && selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (minPrice) {
        url += `&minPrice=${minPrice}`;
      }
      if (maxPrice) {
        url += `&maxPrice=${maxPrice}`;
      }
      if (sortBy && sortBy !== 'relevance') {
        url += `&sort=${sortBy}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalResults(data.total || data.products?.length || 0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleApplyFilters = () => {
    performSearch(query);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
    performSearch(query);
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || sortBy !== 'relevance';

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-ios-yellow-200 dark:bg-ios-yellow-700 text-gray-900 dark:text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10 pt-16">
      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-lg">
        {/* Search Header */}
        <div className="mb-ios-lg">
          <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">
            Search Results
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-ios-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 py-3 rounded-ios-lg bg-white dark:bg-ios-gray-800 border-2 border-gray-200 dark:border-gray-700 text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
              />
            </div>
          </form>

          {/* Results Info & Controls */}
          <div className="flex items-center justify-between flex-wrap gap-ios-sm">
            <div className="flex items-center gap-ios-sm">
              <p className="text-ios-body text-gray-700 dark:text-gray-300">
                {query && (
                  <>
                    {totalResults} result{totalResults !== 1 ? 's' : ''} for{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span>
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-ios-xs px-ios-sm py-ios-xs rounded-ios-md bg-ios-red-50 dark:bg-ios-red-900/20 text-ios-red-600 dark:text-ios-red-400 hover:bg-ios-red-100 dark:hover:bg-ios-red-900/30 text-ios-caption1 font-semibold transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-ios-sm">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-ios-xs px-ios-md py-ios-sm rounded-ios-lg bg-white dark:bg-ios-gray-800 border-2 border-gray-200 dark:border-gray-700 text-ios-body font-semibold text-gray-700 dark:text-gray-300 hover:border-ios-blue-500 transition-all"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-ios-blue-500 rounded-full"></span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setTimeout(() => performSearch(query), 0);
                }}
                className="px-ios-md py-ios-sm rounded-ios-lg bg-white dark:bg-ios-gray-800 border-2 border-gray-200 dark:border-gray-700 text-ios-body font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <IOSCard blur padding="lg" className="mb-ios-lg animate-ios-slide-down">
            <div className="flex items-center justify-between mb-ios-md">
              <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white flex items-center gap-ios-sm">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-ios-xs rounded-ios-md hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-ios-md mb-ios-md">
              {/* Category Filter */}
              <div>
                <label className="block text-ios-footnote font-semibold text-gray-700 dark:text-gray-300 mb-ios-sm">
                  Category
                </label>
                <div className="flex flex-wrap gap-ios-xs">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                      className={`px-ios-sm py-ios-xs rounded-ios-md text-ios-caption1 font-semibold transition-all ${
                        (category === 'All' && !selectedCategory) || selectedCategory === category
                          ? 'bg-ios-blue-500 text-white'
                          : 'bg-ios-gray-100 dark:bg-ios-gray-800 text-gray-700 dark:text-gray-300 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-ios-footnote font-semibold text-gray-700 dark:text-gray-300 mb-ios-sm">
                  Price Range
                </label>
                <div className="flex items-center gap-ios-sm">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    min="0"
                    className="flex-1 px-ios-sm py-ios-xs rounded-ios-md bg-ios-gray-100 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    min="0"
                    className="flex-1 px-ios-sm py-ios-xs rounded-ios-md bg-ios-gray-100 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-ios-footnote font-semibold text-gray-700 dark:text-gray-300 mb-ios-sm">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-ios-sm py-ios-xs rounded-ios-md bg-ios-gray-100 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-ios-sm">
              <IOSButton variant="secondary" size="sm" onClick={handleClearFilters}>
                Clear All
              </IOSButton>
              <IOSButton variant="primary" size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </IOSButton>
            </div>
          </IOSCard>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-ios-md">
            {[...Array(8)].map((_, i) => (
              <IOSCard key={i} blur padding="none" className="overflow-hidden">
                <div className="w-full h-48 bg-ios-gray-200 dark:bg-ios-gray-700 animate-pulse" />
                <div className="p-ios-md space-y-ios-sm">
                  <div className="h-4 bg-ios-gray-200 dark:bg-ios-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-ios-gray-200 dark:bg-ios-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </IOSCard>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-ios-md">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <IOSCard blur hover padding="none" className="overflow-hidden cursor-pointer group h-full">
                  <div className="relative w-full h-48 bg-gradient-to-br from-ios-blue-400 to-ios-purple-500 flex items-center justify-center overflow-hidden">
                    {product.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-white/80" />
                    )}
                    <div className="absolute top-ios-sm right-ios-sm">
                      <IOSBadge variant="blue">{product.category}</IOSBadge>
                    </div>
                  </div>
                  <div className="p-ios-md">
                    <h3 className="text-ios-body font-semibold text-gray-900 dark:text-white mb-ios-xs line-clamp-1 group-hover:text-ios-blue-500 transition-colors">
                      {highlightMatch(product.title, query)}
                    </h3>
                    <p className="text-ios-caption1 text-gray-600 dark:text-gray-400 mb-ios-sm line-clamp-2">
                      {highlightMatch(product.description, query)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-ios-title3 font-bold text-ios-blue-500">
                          {product.currency} {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-ios-caption2 text-gray-500 dark:text-gray-400">
                          by {product.seller.name}
                        </p>
                      </div>
                      {product.rating && (
                        <div className="flex items-center gap-ios-xs">
                          <Star className="w-4 h-4 fill-ios-yellow-500 text-ios-yellow-500" />
                          <span className="text-ios-caption1 font-semibold text-gray-700 dark:text-gray-300">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </IOSCard>
              </Link>
            ))}
          </div>
        ) : query ? (
          <IOSCard blur padding="lg" className="text-center">
            <div className="py-ios-xl">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-ios-md" />
              <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                No results found
              </h3>
              <p className="text-ios-body text-gray-600 dark:text-gray-400 mb-ios-md max-w-md mx-auto">
                We couldn't find any products matching "<span className="font-semibold">{query}</span>".
                Try adjusting your search or filters.
              </p>
              <div className="flex gap-ios-sm justify-center flex-wrap">
                <IOSButton variant="primary" size="md" onClick={handleClearFilters}>
                  Clear Filters
                </IOSButton>
                <Link href="/marketplace">
                  <IOSButton variant="secondary" size="md">
                    Browse All Products
                  </IOSButton>
                </Link>
              </div>
            </div>
          </IOSCard>
        ) : (
          <IOSCard blur padding="lg" className="text-center">
            <div className="py-ios-xl">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-ios-md" />
              <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                Start searching
              </h3>
              <p className="text-ios-body text-gray-600 dark:text-gray-400 mb-ios-md">
                Enter a search term to find products
              </p>
            </div>
          </IOSCard>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
