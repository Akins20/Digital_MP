'use client';

/**
 * Product Detail Page
 * Display full product information and purchase options
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as productsApi from '@/lib/api/products';
import * as purchasesApi from '@/lib/api/purchases';
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import { Star, BadgeCheck, CheckCircle, Users, Download, ChevronRight, Tag, FileText, Package } from 'lucide-react';

// Extend Window interface for Paystack
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();
  const [product, setProduct] = useState<productsApi.Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [params.slug, token]);

  // Check for payment verification callback
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && token) {
      verifyPayment(reference);
    }
  }, [searchParams, token]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      // The backend getProduct endpoint accepts both ID and slug
      // Pass token to allow sellers to view their own draft products
      const response = await productsApi.getProduct(params.slug as string, token);
      setProduct(response.product);
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    if (!token) return;

    try {
      const response = await purchasesApi.verifyPurchase(token, reference);

      if (response.purchase.paymentStatus === 'COMPLETED') {
        success('Purchase completed successfully! You can now download your product.', 'Success');
        // Redirect to download page
        router.push(`/dashboard/purchases/${response.purchase.id}`);
      } else {
        showError('Payment verification failed. Please contact support.', 'Error');
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      showError(error.message || 'Failed to verify payment', 'Error');
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/marketplace/${params.slug}`);
      return;
    }

    if (!token || !product) {
      showError('Unable to process purchase. Please try again.', 'Error');
      return;
    }

    if (!paystackLoaded) {
      showError('Payment system is loading. Please try again in a moment.', 'Error');
      return;
    }

    try {
      setIsPurchasing(true);

      // Initialize purchase with backend
      const response = await purchasesApi.initializePurchase(token, {
        productId: product.id,
      });

      // Open Paystack payment popup
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
          email: user?.email || '',
          amount: Math.round(response.purchase.amount * 100), // Convert to kobo/cents
          currency: response.purchase.currency,
          ref: response.reference,
          callback: (paystackResponse) => {
            // Payment successful, verify on backend
            success('Payment successful! Verifying...', 'Success');
            verifyPayment(paystackResponse.reference);
          },
          onClose: () => {
            setIsPurchasing(false);
            showError('Payment cancelled', 'Info');
          },
        });

        handler.openIframe();
      } else {
        showError('Payment system not available. Please refresh the page.', 'Error');
        setIsPurchasing(false);
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      showError(error.message || 'Failed to initialize purchase', 'Error');
      setIsPurchasing(false);
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue-500 border-t-transparent"></div>
          <p className="mt-ios-sm text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10 pt-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-2xl">
          <IOSCard blur padding="md" className="text-center py-ios-2xl">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-full flex items-center justify-center mx-auto mb-ios-md">
                <Package className="w-8 h-8 text-ios-gray-400" />
              </div>
              <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-sm">
                Product Not Found
              </h1>
              <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mb-ios-lg">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/marketplace">
                <IOSButton variant="primary" size="md">
                  Back to Marketplace
                </IOSButton>
              </Link>
            </div>
          </IOSCard>
        </div>
      </div>
    );
  }

  const allImages = [product.coverImage, ...product.images];

  return (
    <>
      {/* Load Paystack Script */}
      <Script
        src="https://js.paystack.co/v1/inline.js"
        onLoad={() => setPaystackLoaded(true)}
        onError={() => {
          console.error('Failed to load Paystack script');
          showError('Payment system failed to load. Please refresh the page.', 'Error');
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10 pt-16">
        <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-lg">
        {/* Breadcrumb */}
        <nav className="flex items-center mb-ios-md text-ios-footnote animate-ios-fade-in">
          <Link
            href="/marketplace"
            className="text-ios-blue-500 hover:text-ios-blue-600 transition-colors"
          >
            Marketplace
          </Link>
          <ChevronRight className="w-4 h-4 mx-ios-xs text-ios-gray-400" />
          <span className="text-ios-gray-600 dark:text-ios-gray-400 truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-ios-md mb-ios-xl">
          {/* Image Gallery */}
          <div className="lg:col-span-2 animate-ios-fade-in">
            {/* Main Image */}
            <IOSCard padding="none" className="overflow-hidden mb-ios-sm shadow-ios-md">
              <img
                src={allImages[selectedImage]}
                alt={product.title}
                className="w-full aspect-video object-cover"
              />
            </IOSCard>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-6 gap-ios-xs">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-ios-md overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                      selectedImage === index
                        ? 'border-ios-blue-500 shadow-ios-sm'
                        : 'border-ios-gray-200 dark:border-ios-gray-700 hover:border-ios-gray-300 dark:hover:border-ios-gray-600'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full aspect-video object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="animate-ios-scale-in" style={{ animationDelay: '100ms' }}>
            <IOSCard blur padding="md" className="shadow-ios-md sticky top-20">
              {/* Category & Title */}
              <div className="mb-ios-sm">
                <IOSBadge variant="primary" className="mb-ios-xs">{product.category}</IOSBadge>
                <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mb-ios-md leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Seller Info */}
              <div className="flex items-center mb-ios-md pb-ios-md border-b border-ios-gray-200 dark:border-ios-gray-700">
                <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-full flex items-center justify-center shadow-ios-sm">
                  <span className="text-white font-semibold">
                    {product.seller.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="ml-ios-sm flex-1 min-w-0">
                  <p className="text-ios-caption2 text-ios-gray-600 dark:text-ios-gray-400">Sold by</p>
                  <div className="flex items-center gap-ios-xs">
                    <p className="text-ios-footnote font-semibold text-gray-900 dark:text-white truncate">
                      {product.seller.name || 'Anonymous Seller'}
                    </p>
                    {product.seller.isVerifiedSeller && (
                      <BadgeCheck className="w-4 h-4 text-ios-blue-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {product.totalReviews > 0 && (
                <div className="flex items-center mb-ios-md">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.averageRating)
                            ? 'text-ios-orange-500 fill-current'
                            : 'text-ios-gray-300 dark:text-ios-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-ios-xs text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
                    {product.averageRating.toFixed(1)} ({product.totalReviews})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-ios-md">
                <div className="flex items-baseline gap-ios-sm flex-wrap">
                  <span className="text-ios-title1 font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-ios-body text-ios-gray-500 dark:text-ios-gray-400 line-through">
                        {formatPrice(product.originalPrice, product.currency)}
                      </span>
                      <IOSBadge variant="danger">
                        -{product.discountPercentage}%
                      </IOSBadge>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-ios-md space-y-ios-xs">
                {product.includesUpdates && (
                  <div className="flex items-center gap-ios-xs text-ios-caption1 text-ios-gray-700 dark:text-ios-gray-300">
                    <CheckCircle className="w-4 h-4 text-ios-green-500 flex-shrink-0" />
                    <span>Lifetime updates</span>
                  </div>
                )}
                {product.includesSupport && (
                  <div className="flex items-center gap-ios-xs text-ios-caption1 text-ios-gray-700 dark:text-ios-gray-300">
                    <CheckCircle className="w-4 h-4 text-ios-green-500 flex-shrink-0" />
                    <span>Support included</span>
                  </div>
                )}
                {product.totalSales > 0 && (
                  <div className="flex items-center gap-ios-xs text-ios-caption1 text-ios-gray-700 dark:text-ios-gray-300">
                    <Users className="w-4 h-4 text-ios-blue-500 flex-shrink-0" />
                    <span>{product.totalSales} sales</span>
                  </div>
                )}
              </div>

              {/* Purchase Button */}
              <IOSButton
                onClick={handlePurchase}
                disabled={isPurchasing || product.status !== 'PUBLISHED'}
                variant="primary"
                size="md"
                fullWidth
                loading={isPurchasing}
                className="mb-ios-xs"
              >
                {isPurchasing ? (
                  'Processing...'
                ) : product.status !== 'PUBLISHED' ? (
                  'Not Available'
                ) : (
                  'Purchase Now'
                )}
              </IOSButton>

              {/* Demo Link */}
              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <IOSButton variant="outline" size="md" fullWidth>
                    View Demo
                  </IOSButton>
                </a>
              )}

              {/* Stats */}
              <div className="mt-ios-md pt-ios-md border-t border-ios-gray-200 dark:border-ios-gray-700 text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400 space-y-1">
                <p>Published {formatDate(product.createdAt)}</p>
                <p>Updated {formatDate(product.updatedAt)}</p>
              </div>
            </IOSCard>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-ios-md animate-ios-slide-up">
          {/* Description - Full Width on Mobile, 2 Cols on Desktop */}
          <div className="lg:col-span-2">
            <IOSCard blur padding="md" className="h-full">
              <div className="flex items-center gap-ios-xs mb-ios-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-ios-blue-500 to-ios-cyan-500 rounded-ios-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                  Description
                </h3>
              </div>
              <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>

              {/* Requirements */}
              {product.requirements && (
                <div className="mt-ios-md pt-ios-md border-t border-ios-gray-200 dark:border-ios-gray-700">
                  <div className="flex items-center gap-ios-xs mb-ios-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-md flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                      Requirements
                    </h3>
                  </div>
                  <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 whitespace-pre-wrap leading-relaxed">
                    {product.requirements}
                  </p>
                </div>
              )}
            </IOSCard>
          </div>

          {/* Sidebar - Files & Tags */}
          <div className="space-y-ios-md">
            {/* Files Included */}
            {product.files && product.files.length > 0 && (
              <IOSCard blur padding="md">
                <div className="flex items-center gap-ios-xs mb-ios-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-md flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">
                    Files Included
                  </h3>
                </div>
                <div className="space-y-ios-xs">
                  {product.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-ios-xs p-ios-xs rounded-ios-md bg-ios-gray-50 dark:bg-ios-gray-800"
                    >
                      <FileText className="w-4 h-4 text-ios-blue-500 flex-shrink-0" />
                      <span className="text-ios-caption1 text-ios-gray-700 dark:text-ios-gray-300 flex-1 truncate">
                        {file.name}
                      </span>
                      <span className="text-ios-caption2 text-ios-gray-500 flex-shrink-0">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    </div>
                  ))}
                </div>
              </IOSCard>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <IOSCard blur padding="md">
                <div className="flex items-center gap-ios-xs mb-ios-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-ios-orange-500 to-ios-red-500 rounded-ios-md flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-ios-xs">
                  {product.tags.map((tag, index) => (
                    <IOSBadge key={index} variant="secondary">
                      {tag}
                    </IOSBadge>
                  ))}
                </div>
              </IOSCard>
            )}
          </div>
        </div>

        {/* Related Products - TODO: Implement */}
        {/* <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Products
          </h2>
        </div> */}
      </main>
    </div>
    </>
  );
}
