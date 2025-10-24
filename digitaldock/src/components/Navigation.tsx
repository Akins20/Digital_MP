'use client';

/**
 * Navigation Component
 * Main navigation bar for the application
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IOSButton } from '@/components/ios';
import { Menu, X, Home, ShoppingBag, LayoutGrid, Package, LogOut, User, Settings, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300
      ${scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-ios-md shadow-ios-sm'
        : 'bg-white dark:bg-gray-900'}
      border-b border-gray-200/50 dark:border-gray-700/50
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-ios-sm group">
            <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center shadow-ios-sm group-hover:shadow-ios transition-shadow">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="text-ios-headline font-bold text-gray-900 dark:text-white">DigitalDock</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-ios-lg">
            <Link
              href="/"
              className={`
                flex items-center gap-ios-xs px-ios-md py-ios-sm rounded-ios-lg
                text-ios-body font-semibold transition-all duration-200
                ${isActive('/')
                  ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/marketplace"
              className={`
                flex items-center gap-ios-xs px-ios-md py-ios-sm rounded-ios-lg
                text-ios-body font-semibold transition-all duration-200
                ${isActive('/marketplace')
                  ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <ShoppingBag className="w-4 h-4" />
              Marketplace
            </Link>

            {isAuthenticated ? (
              <>
                {user?.role === 'SELLER' && (
                  <Link
                    href="/seller/products"
                    className={`
                      flex items-center gap-ios-xs px-ios-md py-ios-sm rounded-ios-lg
                      text-ios-body font-semibold transition-all duration-200
                      ${pathname?.startsWith('/seller')
                        ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Package className="w-4 h-4" />
                    My Products
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative pl-ios-md ml-ios-md border-l border-gray-200/50 dark:border-gray-700/50 user-menu-container">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-ios-sm px-ios-sm py-ios-xs rounded-ios-lg hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-all active:scale-95"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-full flex items-center justify-center shadow-ios-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-ios-footnote font-semibold text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-ios-caption2 text-ios-gray-600 dark:text-ios-gray-400">{user?.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-ios-gray-600 dark:text-ios-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-ios-xs w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-ios-md rounded-ios-xl shadow-ios-lg border border-gray-200/50 dark:border-gray-700/50 animate-ios-scale-in origin-top-right overflow-hidden">
                      {/* User Info */}
                      <div className="px-ios-md py-ios-sm border-b border-gray-200/50 dark:border-gray-700/50">
                        <p className="text-ios-footnote font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-ios-xs">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-body text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-body text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-body text-ios-red-600 dark:text-ios-red-400 hover:bg-ios-red-50 dark:hover:bg-ios-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-ios-sm">
                <Link href="/login">
                  <IOSButton variant="ghost" size="sm">
                    Sign In
                  </IOSButton>
                </Link>
                <Link href="/register">
                  <IOSButton variant="primary" size="sm">
                    Get Started
                  </IOSButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-ios-sm rounded-ios-lg text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-ios-md border-t border-gray-200/50 dark:border-gray-700/50 animate-ios-slide-down">
            <div className="flex flex-col gap-ios-xs">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg
                  text-ios-body font-semibold transition-all duration-200 active:scale-95
                  ${isActive('/')
                    ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800'
                  }
                `}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg
                  text-ios-body font-semibold transition-all duration-200 active:scale-95
                  ${isActive('/marketplace')
                    ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800'
                  }
                `}
              >
                <ShoppingBag className="w-5 h-5" />
                Marketplace
              </Link>

              {isAuthenticated ? (
                <>
                  {user?.role === 'SELLER' && (
                    <Link
                      href="/seller/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg
                        text-ios-body font-semibold transition-all duration-200 active:scale-95
                        ${pathname?.startsWith('/seller')
                          ? 'bg-ios-blue-500/10 dark:bg-ios-blue-500/20 text-ios-blue-500'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800'
                        }
                      `}
                    >
                      <Package className="w-5 h-5" />
                      My Products
                    </Link>
                  )}

                  <div className="pt-ios-sm mt-ios-sm border-t border-gray-200/50 dark:border-gray-700/50 space-y-ios-xs">
                    <div className="px-ios-md py-ios-sm flex items-center gap-ios-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-full flex items-center justify-center shadow-ios-sm">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-ios-footnote font-semibold text-gray-900 dark:text-white">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg text-ios-body font-semibold text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-all active:scale-95"
                    >
                      <LayoutGrid className="w-5 h-5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg text-ios-body font-semibold text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-all active:scale-95"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-ios-sm px-ios-md py-ios-sm rounded-ios-lg text-ios-body font-semibold text-ios-red-600 dark:text-ios-red-400 hover:bg-ios-red-50 dark:hover:bg-ios-red-900/20 transition-all active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <IOSButton variant="ghost" size="md" fullWidth>
                      Sign In
                    </IOSButton>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <IOSButton variant="primary" size="md" fullWidth>
                      Get Started
                    </IOSButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
