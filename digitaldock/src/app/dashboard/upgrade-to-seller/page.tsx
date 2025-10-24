'use client';

/**
 * Upgrade to Seller Page
 * Allow buyers to upgrade their account to seller status
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as usersApi from '@/lib/api/users';

export default function UpgradeToSellerPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    sellerSlug: '',
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState('');

  // Redirect if not authenticated or already a seller
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'SELLER') {
        router.push('/seller/products');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const validateSlug = (slug: string) => {
    // Slug validation: lowercase letters, numbers, hyphens only
    const slugRegex = /^[a-z0-9-]+$/;

    if (!slug) {
      setSlugError('Seller slug is required');
      return false;
    }

    if (slug.length < 3) {
      setSlugError('Slug must be at least 3 characters');
      return false;
    }

    if (slug.length > 50) {
      setSlugError('Slug must be less than 50 characters');
      return false;
    }

    if (!slugRegex.test(slug)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
      return false;
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
      setSlugError('Slug cannot start or end with a hyphen');
      return false;
    }

    setSlugError('');
    return true;
  };

  const handleSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, sellerSlug: slug });
    validateSlug(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    if (!validateSlug(formData.sellerSlug)) {
      return;
    }

    try {
      setIsSubmitting(true);

      const upgradeData: usersApi.UpgradeToSellerData = {
        sellerSlug: formData.sellerSlug.trim(),
        bio: formData.bio.trim() || undefined,
      };

      await usersApi.upgradeToSeller(token, upgradeData);
      success('Successfully upgraded to seller account!', 'Success');
      await refreshUser();
      router.push('/seller/products/new');
    } catch (error: any) {
      console.error('Failed to upgrade to seller:', error);
      if (error.message.includes('slug') || error.message.includes('already exists')) {
        setSlugError('This seller slug is already taken');
      }
      showError(error.message || 'Failed to upgrade to seller', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || user?.role === 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/settings"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Settings
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-4">
            Become a Seller
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Start selling your digital products on our marketplace
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white mb-8">
          <h2 className="text-2xl font-semibold mb-4">Seller Benefits</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Reach thousands of potential buyers worldwide</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure payment processing with instant payouts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Advanced analytics to track your sales performance</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Complete control over your pricing and product listings</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Automated file delivery and download management</span>
            </li>
          </ul>
        </div>

        {/* Upgrade Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Seller Information
          </h2>

          <div className="space-y-6">
            {/* Seller Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seller Slug *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  marketplace.com/seller/
                </span>
                <input
                  type="text"
                  value={formData.sellerSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  maxLength={50}
                  className={`flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    slugError
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="your-store-name"
                />
              </div>
              {slugError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{slugError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Your unique seller URL. Use lowercase letters, numbers, and hyphens only.
              </p>
              {formData.sellerSlug && !slugError && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✓ Your store will be available at: marketplace.com/seller/{formData.sellerSlug}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seller Bio (optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={500}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Tell buyers about yourself and what you sell..."
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.bio.length} / 500 characters
              </p>
            </div>

            {/* Terms Agreement */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                By becoming a seller, you agree to our{' '}
                <Link href="/legal/seller-agreement" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Seller Agreement
                </Link>
                ,{' '}
                <Link href="/legal/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Terms of Service
                </Link>
                , and{' '}
                <Link href="/legal/content-guidelines" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Content Guidelines
                </Link>
                .
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !!slugError}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Upgrading...
                  </span>
                ) : (
                  'Upgrade to Seller'
                )}
              </button>

              <Link
                href="/dashboard/settings"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        {/* FAQ */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                What are the fees for selling?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We charge a platform fee on each sale to cover payment processing and platform maintenance. Check our pricing page for current rates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Can I change my seller slug later?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your seller slug is permanent once created to maintain consistent URLs for your store. Choose carefully!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                What products can I sell?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can sell any digital products including ebooks, templates, graphics, software, courses, music, videos, photography, fonts, and presets. Physical products are not supported.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                How do I get paid?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payments are processed securely through our payment partners and transferred to your connected account automatically after each sale.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
