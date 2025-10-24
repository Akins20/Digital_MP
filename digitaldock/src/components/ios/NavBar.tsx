/**
 * iOS-style Navigation Bar
 * Blur navigation bar with smooth scroll effects
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';

interface IOSNavBarProps {
  title?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  transparent?: boolean;
  fixed?: boolean;
}

export default function IOSNavBar({
  title,
  leftContent,
  rightContent,
  transparent = false,
  fixed = true,
}: IOSNavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`
        ${fixed ? 'fixed top-0 left-0 right-0' : 'relative'}
        z-30
        transition-all duration-300
        ${
          scrolled && !transparent
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-ios-md shadow-ios-sm'
            : transparent
            ? 'bg-transparent'
            : 'bg-white dark:bg-gray-900'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-ios-md">
        <div className="flex items-center justify-between h-16">
          {/* Left Content */}
          <div className="flex items-center min-w-0 flex-1">
            {leftContent}
          </div>

          {/* Title */}
          {title && (
            <div className="flex-shrink-0 px-ios-md">
              <h1 className="text-ios-headline font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h1>
            </div>
          )}

          {/* Right Content */}
          <div className="flex items-center justify-end min-w-0 flex-1">
            {rightContent}
          </div>
        </div>
      </div>
    </nav>
  );
}
