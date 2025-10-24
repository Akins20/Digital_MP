/**
 * iOS-style Badge Component
 * Small colored badges for status indicators
 */

import { ReactNode } from 'react';

interface IOSBadgeProps {
  children: ReactNode;
  variant?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export default function IOSBadge({
  children,
  variant = 'blue',
  size = 'md',
  dot = false,
}: IOSBadgeProps) {
  const variantClasses = {
    blue: 'bg-ios-blue-500/10 text-ios-blue-500 dark:bg-ios-blue-500/20',
    green: 'bg-ios-green-500/10 text-ios-green-500 dark:bg-ios-green-500/20',
    red: 'bg-ios-red-500/10 text-ios-red-500 dark:bg-ios-red-500/20',
    orange: 'bg-ios-orange-500/10 text-ios-orange-500 dark:bg-ios-orange-500/20',
    purple: 'bg-ios-purple-500/10 text-ios-purple-500 dark:bg-ios-purple-500/20',
    gray: 'bg-ios-gray-200 text-ios-gray-700 dark:bg-ios-gray-700 dark:text-ios-gray-300',
  };

  const sizeClasses = {
    sm: dot ? 'w-2 h-2' : 'px-ios-xs py-0.5 text-ios-caption2',
    md: dot ? 'w-2.5 h-2.5' : 'px-ios-sm py-0.5 text-ios-caption1',
  };

  if (dot) {
    return (
      <span
        className={`
          inline-block rounded-full
          ${variantClasses[variant].split(' ')[0]}
          ${sizeClasses[size]}
        `}
      />
    );
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {children}
    </span>
  );
}
