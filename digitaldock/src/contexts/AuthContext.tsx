'use client';

/**
 * Authentication Context with Cookie-based Sliding Sessions
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import * as authApi from '@/lib/api/auth';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isPremium: boolean;
  isVerifiedSeller: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: authApi.LoginCredentials) => Promise<void>;
  register: (data: authApi.RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'digitaldock_token';
const USER_KEY = 'digitaldock_user';

// Cookie expiration: 1 day (sliding session)
const COOKIE_EXPIRES_DAYS = 1;

// Auto-refresh interval: 5 minutes
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

// Cookie options
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: COOKIE_EXPIRES_DAYS,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extend session by updating cookie expiration
  const extendSession = useCallback((authToken: string, userData: User) => {
    Cookies.set(TOKEN_KEY, authToken, COOKIE_OPTIONS);
    Cookies.set(USER_KEY, JSON.stringify(userData), COOKIE_OPTIONS);
  }, []);

  // Load user and token from cookies on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = Cookies.get(TOKEN_KEY);
        const storedUser = Cookies.get(USER_KEY);

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify token is still valid by fetching current user
          try {
            const { user: currentUser } = await authApi.getMe(storedToken);
            setUser(currentUser);

            // Extend session on successful verification (sliding session)
            extendSession(storedToken, currentUser);
          } catch (error) {
            // Token is invalid, clear cookies
            console.error('Token verification failed:', error);
            Cookies.remove(TOKEN_KEY, { path: '/' });
            Cookies.remove(USER_KEY, { path: '/' });
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [extendSession]);

  // Auto-refresh session periodically (sliding session)
  useEffect(() => {
    if (!token || !user) {
      // Clear interval if user logs out
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Set up auto-refresh interval
    refreshIntervalRef.current = setInterval(() => {
      const currentToken = Cookies.get(TOKEN_KEY);
      const currentUser = Cookies.get(USER_KEY);

      if (currentToken && currentUser) {
        // Extend session by updating cookie expiration
        extendSession(currentToken, JSON.parse(currentUser));
        console.log('Session extended automatically');
      }
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [token, user, extendSession]);

  const login = useCallback(async (credentials: authApi.LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);

      setUser(response.user);
      setToken(response.token);

      // Store in cookies with sliding session
      extendSession(response.token, response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [extendSession]);

  const register = useCallback(async (data: authApi.RegisterData) => {
    try {
      const response = await authApi.register(data);

      setUser(response.user);
      setToken(response.token);

      // Store in cookies with sliding session
      extendSession(response.token, response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [extendSession]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    Cookies.remove(TOKEN_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });

    // Clear auto-refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const { user: currentUser } = await authApi.getMe(token);
      setUser(currentUser);

      // Extend session on manual refresh (sliding session)
      extendSession(token, currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  }, [token, logout, extendSession]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
