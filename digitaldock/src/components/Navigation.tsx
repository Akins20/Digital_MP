'use client';

/**
 * Navigation Component
 * Main navigation bar with global search functionality
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IOSButton } from '@/components/ios';
import { Menu, X, Home, ShoppingBag, LayoutGrid, Package, LogOut, User, Settings, ChevronDown, Search, Box } from 'lucide-react';

interface SearchResult {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  coverImage?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (showSearchDropdown && searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, showSearchDropdown]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.products || []);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-ios-yellow-200 dark:bg-ios-yellow-700 text-gray-900 dark:text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
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
        <div className="flex justify-between h-16 items-center gap-ios-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-ios-sm group flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center shadow-ios-sm group-hover:shadow-ios transition-shadow">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="hidden sm:block text-ios-headline font-bold text-gray-900 dark:text-white">DigitalDock</span>
          </Link>

          {/* Global Search */}
          <div className="hidden md:flex flex-1 max-w-xl relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-ios-lg bg-ios-gray-100 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 focus:bg-white dark:focus:bg-ios-gray-700 transition-all"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-ios-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-ios-md rounded-ios-xl shadow-ios-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden animate-ios-scale-in origin-top max-h-96 overflow-y-auto">
                {searchResults.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-start gap-ios-sm p-ios-sm hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors border-b border-gray-200/50 dark:border-gray-700/50 last:border-0"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-400 to-ios-purple-500 rounded-ios-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.coverImage ? (
                        <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <Box className="w-6 h-6 text-white/80" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-ios-footnote font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {highlightMatch(product.title, searchQuery)}
                      </h4>
                      <p className="text-ios-caption1 text-gray-600 dark:text-gray-400 line-clamp-1">
                        {highlightMatch(product.description, searchQuery)}
                      </p>
                      <div className="flex items-center gap-ios-sm mt-ios-xs">
                        <span className="text-ios-caption1 font-bold text-ios-blue-500">
                          {product.currency} {product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-ios-caption2 text-gray-500 dark:text-gray-400">in {product.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className="block p-ios-sm text-center text-ios-footnote font-semibold text-ios-blue-500 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                >
                  View all results for "{searchQuery}"
                </Link>
              </div>
            )}

            {showSearchDropdown && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-ios-md rounded-ios-xl shadow-ios-lg border border-gray-200/50 dark:border-gray-700/50 p-ios-md text-center animate-ios-scale-in origin-top">
                <p className="text-ios-footnote text-gray-600 dark:text-gray-400">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-ios-md flex-shrink-0">
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
            {/* Mobile Search */}
            <div className="mb-ios-md">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-ios-lg bg-ios-gray-100 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all"
                  />
                </div>
              </form>
            </div>

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
