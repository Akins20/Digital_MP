'use client';

/**
 * Payment Failed Page
 * Displayed when payment fails or is cancelled
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IOSButton, IOSCard } from '@/components/ios';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reason, setReason] = useState<string>('');
  const [productSlug, setProductSlug] = useState<string>('');

  useEffect(() => {
    const reasonParam = searchParams.get('reason');
    const productParam = searchParams.get('product');

    setReason(reasonParam || 'Payment was not completed');
    setProductSlug(productParam || '');
  }, [searchParams]);

  const getFailureMessage = () => {
    const lowerReason = reason.toLowerCase();

    if (lowerReason.includes('cancel')) {
      return 'You cancelled the payment process';
    } else if (lowerReason.includes('timeout')) {
      return 'Payment session expired';
    } else if (lowerReason.includes('insufficient')) {
      return 'Insufficient funds';
    } else if (lowerReason.includes('declined')) {
      return 'Payment was declined by your bank';
    } else if (lowerReason.includes('network')) {
      return 'Network error occurred during payment';
    }

    return reason;
  };

  const getHelpText = () => {
    const lowerReason = reason.toLowerCase();

    if (lowerReason.includes('cancel')) {
      return 'No charges were made to your account.';
    } else if (lowerReason.includes('declined') || lowerReason.includes('insufficient')) {
      return 'Please check your payment method or try a different card.';
    } else if (lowerReason.includes('network') || lowerReason.includes('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    return 'Please try again or contact support if the problem persists.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-red-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-red-900/10 flex items-center justify-center pt-16 px-ios-md">
      <IOSCard blur padding="md" className="max-w-md w-full text-center animate-ios-scale-in">
        {/* Error Icon */}
        <div className="relative mb-ios-md">
          <div className="w-20 h-20 bg-gradient-to-br from-ios-red-500 to-ios-orange-500 rounded-full flex items-center justify-center mx-auto shadow-ios-lg animate-ios-shake">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-ios-red-500 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-xs">
          Payment Failed
        </h1>

        <p className="text-ios-footnote text-ios-gray-700 dark:text-ios-gray-300 mb-ios-sm">
          {getFailureMessage()}
        </p>

        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400 mb-ios-lg">
          {getHelpText()}
        </p>

        {/* Common Issues */}
        <div className="bg-ios-orange-50 dark:bg-ios-orange-900/20 border border-ios-orange-200 dark:border-ios-orange-800 rounded-ios-lg p-ios-sm mb-ios-lg text-left">
          <div className="flex items-start gap-ios-xs mb-ios-xs">
            <HelpCircle className="w-4 h-4 text-ios-orange-600 dark:text-ios-orange-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-ios-footnote font-semibold text-ios-orange-900 dark:text-ios-orange-300">
              Common Issues
            </h3>
          </div>
          <ul className="space-y-1 text-ios-caption1 text-ios-orange-800 dark:text-ios-orange-400">
            <li>• Incorrect card details or expired card</li>
            <li>• Insufficient balance in your account</li>
            <li>• Card not enabled for online payments</li>
            <li>• Payment blocked by your bank</li>
            <li>• Poor internet connection</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-ios-xs">
          {productSlug && (
            <Link href={`/marketplace/${productSlug}`}>
              <IOSButton variant="primary" size="md" fullWidth className="group">
                <RefreshCw className="w-4 h-4 mr-ios-xs" />
                Try Again
              </IOSButton>
            </Link>
          )}

          <Link href="/marketplace">
            <IOSButton variant={productSlug ? 'outline' : 'primary'} size="md" fullWidth>
              <ArrowLeft className="w-4 h-4 mr-ios-xs" />
              Back to Marketplace
            </IOSButton>
          </Link>

          <Link href="/dashboard/purchases">
            <IOSButton variant="ghost" size="md" fullWidth>
              View My Purchases
            </IOSButton>
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-ios-md pt-ios-md border-t border-ios-gray-200 dark:border-ios-gray-700">
          <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400 mb-ios-xs">
            Need help?
          </p>
          <Link
            href="/support"
            className="text-ios-caption1 text-ios-blue-600 dark:text-ios-blue-400 hover:underline font-medium"
          >
            Contact Support
          </Link>
        </div>
      </IOSCard>
    </div>
  );
}
