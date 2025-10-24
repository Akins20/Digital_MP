'use client';

/**
 * Login Page
 * User authentication page
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IOSCard, IOSButton, IOSInput } from '@/components/ios';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      // Redirect to dashboard or home page after successful login
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 px-ios-md pt-16">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-ios-xl">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">
            Welcome Back
          </h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            Sign in to your DigitalDock account
          </p>
        </div>

        {/* Login Form */}
        <IOSCard blur padding="lg">
          <form onSubmit={handleSubmit} className="space-y-ios-lg">
            {/* Error Message */}
            {error && (
              <div className="bg-ios-red-50 dark:bg-ios-red-900/20 border border-ios-red-200 dark:border-ios-red-800 text-ios-red-600 dark:text-ios-red-400 px-ios-md py-ios-sm rounded-ios-lg text-ios-footnote">
                {error}
              </div>
            )}

            {/* Email Field */}
            <IOSInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            {/* Password Field */}
            <IOSInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-5 h-5" />}
              showPasswordToggle
              required
            />

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-ios-footnote font-semibold text-ios-blue-500 hover:text-ios-blue-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <IOSButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </IOSButton>
          </form>

          {/* Register Link */}
          <div className="mt-ios-lg pt-ios-lg border-t border-ios-gray-200/50 dark:border-ios-gray-700/50 text-center">
            <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-ios-blue-500 hover:text-ios-blue-600 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </IOSCard>
      </div>
    </div>
  );
}
