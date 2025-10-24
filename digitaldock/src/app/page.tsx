'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import { Search, Lock, Zap, Shield, LayoutGrid, Star, TrendingUp, ArrowRight, FileText, Palette, Code, Music, Box, BookOpen, Image, Video, Type, Blocks, Package } from 'lucide-react';

interface Product {
  id: string;
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

interface CategoryData {
  name: string;
  icon: any;
  count: number;
}

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([
    { name: 'Templates', icon: FileText, count: 0 },
    { name: 'Graphics', icon: Palette, count: 0 },
    { name: 'Software', icon: Code, count: 0 },
    { name: 'Audio', icon: Music, count: 0 },
    { name: '3D Models', icon: Box, count: 0 },
    { name: 'Ebooks', icon: BookOpen, count: 0 },
    { name: 'Photos', icon: Image, count: 0 },
    { name: 'Videos', icon: Video, count: 0 },
    { name: 'Fonts', icon: Type, count: 0 },
    { name: 'Themes', icon: Blocks, count: 0 },
  ]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategoryCounts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?limit=8&sort=-createdAt`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchCategoryCounts = async () => {
    try {
      const updatedCategories = await Promise.all(
        categories.map(async (category) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/products?category=${encodeURIComponent(category.name)}&limit=1`
            );
            if (response.ok) {
              const data = await response.json();
              return { ...category, count: data.total || 0 };
            }
          } catch (error) {
            console.error(`Error fetching count for ${category.name}:`, error);
          }
          return category;
        })
      );
      setCategories(updatedCategories.filter(cat => cat.count > 0).slice(0, 6));
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 pt-16">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-2xl">
        <div className="text-center space-y-ios-lg animate-ios-fade-in">
          <div className="inline-block px-ios-lg py-ios-sm bg-ios-blue-500/10 dark:bg-ios-blue-500/20 rounded-full mb-ios-md animate-ios-bounce">
            <span className="text-ios-footnote font-semibold text-ios-blue-500">
              Welcome to the Future of Digital Commerce
            </span>
          </div>

          <h1 className="text-ios-large-title sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Buy & Sell{' '}
            <span className="bg-gradient-to-r from-ios-blue-500 via-ios-purple-500 to-ios-pink-500 bg-clip-text text-transparent">
              Digital Products
            </span>
            <br />
            <span className="text-ios-title1 sm:text-ios-large-title">With Confidence</span>
          </h1>

          <p className="text-ios-body sm:text-ios-headline text-ios-gray-600 dark:text-ios-gray-400 max-w-2xl mx-auto leading-relaxed">
            The ultimate marketplace for creators and buyers. Secure payments, instant delivery, and quality products you can trust.
          </p>

          <div className="flex gap-ios-md items-center justify-center flex-wrap pt-ios-md">
            <Link href="/marketplace">
              <IOSButton variant="primary" size="lg" className="shadow-ios-lg hover:shadow-ios-xl transition-shadow">
                <Search className="w-5 h-5" />
                Explore Marketplace
              </IOSButton>
            </Link>

            {!isAuthenticated && !isLoading && (
              <>
                <Link href="/register">
                  <IOSButton variant="secondary" size="lg">
                    Start Selling Today
                  </IOSButton>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <Link href="/dashboard">
                <IOSButton variant="secondary" size="lg">
                  <LayoutGrid className="w-5 h-5" />
                  Go to Dashboard
                </IOSButton>
              </Link>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-ios-2xl">
          <div className="flex items-center justify-between mb-ios-md">
            <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <Link href="/marketplace" className="text-ios-footnote font-semibold text-ios-blue-500 hover:text-ios-blue-600 flex items-center gap-ios-xs">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-ios-sm">
            {categories.map((category, i) => {
              const IconComponent = category.icon;
              return (
                <Link key={i} href={`/marketplace?category=${category.name}`}>
                  <IOSCard blur hover padding="md" className="text-center cursor-pointer">
                    <div className="w-12 h-12 mx-auto mb-ios-sm bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-ios-footnote font-semibold text-gray-900 dark:text-white mb-ios-xs">
                      {category.name}
                    </h3>
                    {category.count > 0 && (
                      <p className="text-ios-caption1 text-gray-600 dark:text-gray-400">
                        {category.count} {category.count === 1 ? 'product' : 'products'}
                      </p>
                    )}
                  </IOSCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mt-ios-2xl">
          <div className="flex items-center justify-between mb-ios-md">
            <div>
              <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-xs">
                Featured Products
              </h2>
              <p className="text-ios-footnote text-gray-600 dark:text-gray-400">
                Discover the latest and most popular digital products
              </p>
            </div>
            <Link href="/marketplace" className="text-ios-footnote font-semibold text-ios-blue-500 hover:text-ios-blue-600 flex items-center gap-ios-xs">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoadingProducts ? (
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
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-ios-md">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <IOSCard blur hover padding="none" className="overflow-hidden cursor-pointer group">
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
                        <IOSBadge variant="primary">{product.category}</IOSBadge>
                      </div>
                    </div>
                    <div className="p-ios-md">
                      <h3 className="text-ios-body font-semibold text-gray-900 dark:text-white mb-ios-xs line-clamp-1 group-hover:text-ios-blue-500 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-ios-caption1 text-gray-600 dark:text-gray-400 mb-ios-sm line-clamp-2">
                        {product.description}
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
          ) : (
            <IOSCard blur padding="lg" className="text-center">
              <p className="text-ios-body text-gray-600 dark:text-gray-400">
                No products available yet. Check back soon!
              </p>
            </IOSCard>
          )}
        </div>

        {/* Features */}
        <div className="mt-ios-2xl grid grid-cols-1 md:grid-cols-3 gap-ios-lg animate-ios-slide-up">
          <IOSCard blur hover padding="lg">
            <div className="flex flex-col items-center text-center space-y-ios-md">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue-500 to-ios-blue-600 rounded-ios-2xl flex items-center justify-center shadow-ios-md">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                Secure Transactions
              </h3>
              <p className="text-ios-subheadline text-ios-gray-600 dark:text-ios-gray-400 leading-relaxed">
                Bank-level encryption protects your payments and personal data at all times.
              </p>
            </div>
          </IOSCard>

          <IOSCard blur hover padding="lg">
            <div className="flex flex-col items-center text-center space-y-ios-md">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-2xl flex items-center justify-center shadow-ios-md">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                Instant Delivery
              </h3>
              <p className="text-ios-subheadline text-ios-gray-600 dark:text-ios-gray-400 leading-relaxed">
                Access your purchased products immediately. No waiting, no delays.
              </p>
            </div>
          </IOSCard>

          <IOSCard blur hover padding="lg">
            <div className="flex flex-col items-center text-center space-y-ios-md">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-2xl flex items-center justify-center shadow-ios-md">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                Verified Quality
              </h3>
              <p className="text-ios-subheadline text-ios-gray-600 dark:text-ios-gray-400 leading-relaxed">
                Every seller is verified to ensure premium quality digital products.
              </p>
            </div>
          </IOSCard>
        </div>

        {/* Stats Section */}
        <div className="mt-ios-2xl">
          <IOSCard blur padding="lg" className="animate-ios-scale-in">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-ios-xl text-center">
              <div>
                <div className="text-ios-title1 sm:text-4xl font-bold text-ios-blue-500">10K+</div>
                <div className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mt-ios-xs">Products</div>
              </div>
              <div>
                <div className="text-ios-title1 sm:text-4xl font-bold text-ios-purple-500">5K+</div>
                <div className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mt-ios-xs">Creators</div>
              </div>
              <div>
                <div className="text-ios-title1 sm:text-4xl font-bold text-ios-green-500">50K+</div>
                <div className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mt-ios-xs">Happy Buyers</div>
              </div>
              <div>
                <div className="text-ios-title1 sm:text-4xl font-bold text-ios-orange-500">99.9%</div>
                <div className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mt-ios-xs">Satisfaction</div>
              </div>
            </div>
          </IOSCard>
        </div>

        {/* CTA Section */}
        <div className="mt-ios-2xl">
          <IOSCard blur padding="lg" className="text-center bg-gradient-to-br from-ios-blue-500/5 to-ios-purple-500/5">
            <TrendingUp className="w-12 h-12 text-ios-blue-500 mx-auto mb-ios-md" />
            <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-sm">
              Ready to Start Selling?
            </h2>
            <p className="text-ios-body text-gray-700 dark:text-gray-300 mb-ios-md max-w-2xl mx-auto">
              Join thousands of creators earning money from their digital products.
              It's free to join and takes less than 2 minutes to get started.
            </p>
            <div className="flex gap-ios-sm justify-center flex-wrap">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <IOSButton variant="primary" size="lg">
                      Create Free Account
                    </IOSButton>
                  </Link>
                  <Link href="/marketplace">
                    <IOSButton variant="secondary" size="lg">
                      Browse Products
                    </IOSButton>
                  </Link>
                </>
              ) : (
                <Link href="/seller/products/create">
                  <IOSButton variant="primary" size="lg">
                    List Your First Product
                  </IOSButton>
                </Link>
              )}
            </div>
          </IOSCard>
        </div>
      </main>
    </div>
  );
}
