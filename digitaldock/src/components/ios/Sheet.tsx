/**
 * iOS-style Sheet Component
 * Bottom sheet modal with slide-up animation
 */

'use client';

import { ReactNode, useEffect } from 'react';

interface IOSSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export default function IOSSheet({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}: IOSSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-h-[40vh]',
    md: 'max-h-[60vh]',
    lg: 'max-h-[80vh]',
    full: 'h-[95vh]',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-ios-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-ios-slide-up">
        <div
          className={`
            mx-auto max-w-3xl
            bg-white/95 dark:bg-gray-900/95
            backdrop-blur-ios-lg
            rounded-t-ios-3xl
            shadow-ios-xl
            ${sizeClasses[size]}
            overflow-hidden
          `}
        >
          {/* Drag Indicator */}
          <div className="flex justify-center pt-ios-sm pb-ios-xs">
            <div className="w-10 h-1 bg-ios-gray-300 dark:bg-ios-gray-700 rounded-full" />
          </div>

          {/* Title */}
          {title && (
            <div className="px-ios-lg py-ios border-b border-ios-gray-200 dark:border-ios-gray-800">
              <h2 className="text-ios-headline font-semibold text-center text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>
          )}

          {/* Content */}
          <div className="overflow-y-auto p-ios-lg">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
