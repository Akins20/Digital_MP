/**
 * iOS-style Card Component
 * Glass-morphism card with blur effect
 */

import { ReactNode } from 'react';

interface IOSCardProps {
  children: ReactNode;
  className?: string;
  blur?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hover?: boolean;
}

export default function IOSCard({
  children,
  className = '',
  blur = false,
  padding = 'md',
  onClick,
  hover = false,
}: IOSCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-ios-sm',
    md: 'p-ios-md',
    lg: 'p-ios-lg',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        rounded-ios-xl
        ${blur ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-ios' : 'bg-white dark:bg-gray-800'}
        border border-gray-200/50 dark:border-gray-700/50
        shadow-ios
        ${paddingClasses[padding]}
        ${hover ? 'transition-all duration-200 hover:shadow-ios-md hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
