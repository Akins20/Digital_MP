/**
 * iOS-style Button Component
 * Rounded buttons with smooth animations
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface IOSButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export default function IOSButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: IOSButtonProps) {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-ios-lg
    transition-all duration-200
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;

  const variantClasses = {
    primary: `
      bg-ios-blue-500 hover:bg-ios-blue-600
      text-white shadow-ios-sm hover:shadow-ios
    `,
    secondary: `
      bg-ios-gray-100 hover:bg-ios-gray-200
      dark:bg-ios-gray-800 dark:hover:bg-ios-gray-700
      text-ios-gray-900 dark:text-white
    `,
    outline: `
      border-2 border-ios-blue-500 hover:border-ios-blue-600
      text-ios-blue-500 hover:text-ios-blue-600
      hover:bg-ios-blue-50 dark:hover:bg-ios-blue-900/20
    `,
    ghost: `
      text-ios-blue-500 hover:text-ios-blue-600
      hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800
    `,
    danger: `
      bg-ios-red-500 hover:bg-ios-red-600
      text-white shadow-ios-sm hover:shadow-ios
    `,
  };

  const sizeClasses = {
    sm: 'px-ios-md py-ios-sm text-ios-footnote',
    md: 'px-ios-lg py-ios text-ios-body',
    lg: 'px-ios-xl py-ios-md text-ios-headline',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  );
}
