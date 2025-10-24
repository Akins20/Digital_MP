'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IOSCard, IOSButton } from '@/components/ios';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-3xl">
        <div className="text-center space-y-ios-xl animate-ios-fade-in">
          <div className="inline-block px-ios-lg py-ios-sm bg-ios-blue-500/10 dark:bg-ios-blue-500/20 rounded-full mb-ios-lg animate-ios-bounce">
            <span className="text-ios-footnote font-semibold text-ios-blue-500">
              🚀 Welcome to the Future of Digital Commerce
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

          <div className="flex gap-ios-md items-center justify-center flex-wrap pt-ios-lg">
            <Link href="/marketplace">
              <IOSButton variant="primary" size="lg" className="shadow-ios-lg hover:shadow-ios-xl transition-shadow">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                <Link href="/login">
                  <IOSButton variant="outline" size="lg">
                    Sign In
                  </IOSButton>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <Link href="/dashboard">
                <IOSButton variant="primary" size="lg" className="shadow-ios-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Go to Dashboard
                </IOSButton>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-ios-3xl grid grid-cols-1 md:grid-cols-3 gap-ios-lg animate-ios-slide-up">
          <IOSCard blur hover padding="lg">
            <div className="flex flex-col items-center text-center space-y-ios-md">
              <div className="w-16 h-16 bg-gradient-to-br from-ios-blue-500 to-ios-blue-600 rounded-ios-2xl flex items-center justify-center shadow-ios-md">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
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
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
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
        <div className="mt-ios-3xl">
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
      </main>
    </div>
  );
}
