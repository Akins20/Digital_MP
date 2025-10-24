'use client';

/**
 * Dashboard Page
 * Protected page accessible only to authenticated users
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { IOSCard, IOSButton, IOSBadge } from '@/components/ios';
import { User, Mail, Shield, Crown, BadgeCheck, RefreshCw, Info, ShoppingBag, Package, Settings } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh profile', error);
    }
  };

  const isSeller = user?.role === 'SELLER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 pt-16">
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Welcome Section */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">
            Welcome back{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            Manage your account and {isSeller ? 'track your sales' : 'view your purchases'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-ios-lg mb-ios-xl">
          <IOSCard blur hover padding="lg" className="animate-ios-scale-in">
            <div className="flex items-center gap-ios-md">
              <div className={`w-12 h-12 rounded-ios-xl flex items-center justify-center ${
                isSeller
                  ? 'bg-gradient-to-br from-ios-orange-500 to-ios-green-500'
                  : 'bg-gradient-to-br from-ios-blue-500 to-ios-purple-500'
              }`}>
                {isSeller ? <Package className="w-6 h-6 text-white" /> : <ShoppingBag className="w-6 h-6 text-white" />}
              </div>
              <div>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Account Type</p>
                <p className="text-ios-title3 font-semibold text-gray-900 dark:text-white">{user?.role}</p>
              </div>
            </div>
          </IOSCard>

          <Link href={isSeller ? '/seller/products' : '/dashboard/purchases'} className="block">
            <IOSCard blur hover padding="lg" className="h-full animate-ios-scale-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-ios-md">
                <div className="w-12 h-12 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-xl flex items-center justify-center">
                  {isSeller ? <Package className="w-6 h-6 text-white" /> : <ShoppingBag className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
                    {isSeller ? 'My Products' : 'My Purchases'}
                  </p>
                  <p className="text-ios-title3 font-semibold text-gray-900 dark:text-white">View All</p>
                </div>
              </div>
            </IOSCard>
          </Link>

          <Link href="/dashboard/settings" className="block">
            <IOSCard blur hover padding="lg" className="h-full animate-ios-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-ios-md">
                <div className="w-12 h-12 bg-gradient-to-br from-ios-gray-500 to-ios-gray-600 rounded-ios-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Settings</p>
                  <p className="text-ios-title3 font-semibold text-gray-900 dark:text-white">Configure</p>
                </div>
              </div>
            </IOSCard>
          </Link>
        </div>

        {/* Profile Information */}
        <IOSCard blur padding="lg" className="mb-ios-xl animate-ios-slide-up">
          <div className="flex items-center justify-between mb-ios-lg">
            <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            <IOSButton onClick={handleRefresh} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </IOSButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-ios-lg">
            {/* User ID */}
            <div className="flex items-start gap-ios-md">
              <div className="w-10 h-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-ios-gray-600 dark:text-ios-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                  User ID
                </p>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400 font-mono truncate">
                  {user?.id}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-ios-md">
              <div className="w-10 h-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-ios-gray-600 dark:text-ios-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                  Email
                </p>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="flex items-start gap-ios-md">
              <div className="w-10 h-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-ios-gray-600 dark:text-ios-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                  Full Name
                </p>
                <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
                  {user?.name || 'Not set'}
                </p>
              </div>
            </div>

            {/* Premium Status */}
            <div className="flex items-start gap-ios-md">
              <div className="w-10 h-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-ios-gray-600 dark:text-ios-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                  Premium Status
                </p>
                <IOSBadge variant={user?.isPremium ? 'warning' : 'secondary'}>
                  {user?.isPremium ? 'Premium' : 'Free'}
                </IOSBadge>
              </div>
            </div>

            {/* Verified Seller (if seller) */}
            {isSeller && (
              <div className="flex items-start gap-ios-md">
                <div className="w-10 h-10 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-5 h-5 text-ios-gray-600 dark:text-ios-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                    Verification Status
                  </p>
                  <IOSBadge variant={user?.isVerifiedSeller ? 'success' : 'warning'}>
                    {user?.isVerifiedSeller ? 'Verified' : 'Not Verified'}
                  </IOSBadge>
                </div>
              </div>
            )}
          </div>
        </IOSCard>

        {/* Session Info */}
        <IOSCard blur padding="lg" className="bg-ios-blue-50/50 dark:bg-ios-blue-900/10 border border-ios-blue-200 dark:border-ios-blue-800 animate-ios-fade-in">
          <div className="flex items-start gap-ios-md">
            <div className="w-10 h-10 bg-ios-blue-100 dark:bg-ios-blue-900/30 rounded-ios-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-ios-blue-600 dark:text-ios-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-ios-body font-semibold text-ios-blue-900 dark:text-ios-blue-200 mb-ios-xs">
                Session Information
              </h4>
              <p className="text-ios-footnote text-ios-blue-700 dark:text-ios-blue-300 leading-relaxed">
                Your session is protected with cookie-based sliding sessions. The session will automatically extend every 5 minutes while you&apos;re active. Session expires 1 day after your last activity.
              </p>
            </div>
          </div>
        </IOSCard>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
