'use client';

/**
 * Payment Success Page
 * Displayed after successful payment completion
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import * as purchasesApi from '@/lib/api/purchases';
import { IOSButton, IOSCard } from '@/components/ios';
import { CheckCircle, Download, ArrowRight, Package } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && token) {
      verifyPayment(reference);
    } else {
      setIsVerifying(false);
      setVerificationError('No payment reference found');
    }
  }, [searchParams, token]);

  const verifyPayment = async (reference: string) => {
    if (!token) return;

    try {
      setIsVerifying(true);
      const response = await purchasesApi.verifyPurchase(token, reference);

      if (response.purchase.paymentStatus === 'COMPLETED') {
        setPurchase(response.purchase);
      } else {
        setVerificationError('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error);
      setVerificationError(error.message || 'Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-green-900/10 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-green-500 border-t-transparent"></div>
          <p className="mt-ios-sm text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
            Verifying payment...
          </p>
        </div>
      </div>
    );
  }

  if (verificationError || !purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-red-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-red-900/10 flex items-center justify-center pt-16 px-ios-md">
        <IOSCard blur padding="md" className="max-w-md w-full text-center animate-ios-scale-in">
          <div className="w-16 h-16 bg-ios-red-100 dark:bg-ios-red-900/30 rounded-full flex items-center justify-center mx-auto mb-ios-md">
            <Package className="w-8 h-8 text-ios-red-600 dark:text-ios-red-400" />
          </div>

          <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-sm">
            Verification Failed
          </h1>

          <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mb-ios-lg">
            {verificationError || 'Unable to verify your payment'}
          </p>

          <div className="flex flex-col gap-ios-xs">
            <Link href="/dashboard/purchases">
              <IOSButton variant="primary" size="md" fullWidth>
                View My Purchases
              </IOSButton>
            </Link>
            <Link href="/marketplace">
              <IOSButton variant="ghost" size="md" fullWidth>
                Back to Marketplace
              </IOSButton>
            </Link>
          </div>
        </IOSCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-green-900/10 flex items-center justify-center pt-16 px-ios-md">
      <IOSCard blur padding="md" className="max-w-md w-full text-center animate-ios-scale-in">
        {/* Success Icon */}
        <div className="relative mb-ios-md">
          <div className="w-20 h-20 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-full flex items-center justify-center mx-auto shadow-ios-lg animate-ios-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-ios-green-500 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-xs">
          Payment Successful!
        </h1>

        <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mb-ios-lg">
          Your purchase has been completed successfully. You can now download your product files.
        </p>

        {/* Purchase Details */}
        <div className="bg-ios-gray-50 dark:bg-ios-gray-800 rounded-ios-lg p-ios-sm mb-ios-lg text-left">
          <div className="flex justify-between items-start mb-ios-xs">
            <span className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
              Order ID
            </span>
            <span className="text-ios-caption1 font-mono text-gray-900 dark:text-white">
              #{purchase.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex justify-between items-start mb-ios-xs">
            <span className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
              Amount Paid
            </span>
            <span className="text-ios-footnote font-semibold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: purchase.currency || 'USD',
              }).format(purchase.amount)}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
              Status
            </span>
            <span className="text-ios-caption1 font-semibold text-ios-green-600 dark:text-ios-green-400">
              Completed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-ios-xs">
          <Link href={`/dashboard/purchases/${purchase.id}`}>
            <IOSButton variant="primary" size="md" fullWidth className="group">
              <Download className="w-4 h-4 mr-ios-xs" />
              Download Files
              <ArrowRight className="w-4 h-4 ml-ios-xs group-hover:translate-x-1 transition-transform" />
            </IOSButton>
          </Link>

          <Link href="/dashboard/purchases">
            <IOSButton variant="outline" size="md" fullWidth>
              View All Purchases
            </IOSButton>
          </Link>

          <Link href="/marketplace">
            <IOSButton variant="ghost" size="md" fullWidth>
              Continue Shopping
            </IOSButton>
          </Link>
        </div>

        {/* Info */}
        <p className="mt-ios-md text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">
          A confirmation email has been sent to your registered email address.
        </p>
      </IOSCard>
    </div>
  );
}
