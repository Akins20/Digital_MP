'use client';

/**
 * Register Page
 * User registration page with role selection
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { IOSCard, IOSButton, IOSInput } from '@/components/ios';
import { Mail, Lock, User as UserIcon, ShoppingBag, Package } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER' as 'BUYER' | 'SELLER',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    hasMinLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
  }>({
    hasMinLength: false,
    hasUppercase: false,
    hasNumber: false,
  });

  const handleNextStep = () => {
    setError(null);

    // Step 1: Just move forward (role selection)
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    // Step 2: Validate email and password
    if (currentStep === 2) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!passwordStrength.hasMinLength || !passwordStrength.hasUppercase || !passwordStrength.hasNumber) {
        setError('Password does not meet strength requirements');
        return;
      }

      setCurrentStep(3);
      return;
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        role: formData.role,
      });

      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength on password change
    if (name === 'password') {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUppercase: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Dynamic theming based on role
  const isBuyer = formData.role === 'BUYER';
  const bgGradient = isBuyer
    ? 'from-ios-blue-50 via-white to-ios-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20'
    : 'from-ios-orange-50 via-white to-ios-green-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-green-900/20';
  const accentColor = isBuyer ? 'ios-blue' : 'ios-orange';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgGradient} px-ios-md pt-16 py-ios-xl transition-all duration-500`}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-ios-xl animate-ios-fade-in">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">
            {currentStep === 1 ? 'Join DigitalDock' : currentStep === 2 ? 'Create Your Account' : `Welcome ${isBuyer ? 'Buyer' : 'Seller'}!`}
          </h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            {currentStep === 1
              ? 'Choose how you want to get started'
              : currentStep === 2
              ? 'Set up your secure login credentials'
              : isBuyer
              ? 'Find amazing digital products'
              : 'Start selling your digital creations'
            }
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-ios-xs mt-ios-lg">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? `w-8 bg-${accentColor}-500`
                    : step < currentStep
                    ? `w-6 bg-${accentColor}-400`
                    : 'w-6 bg-ios-gray-200 dark:bg-ios-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <IOSCard blur padding="lg" className="animate-ios-scale-in">
          {/* Error Message */}
          {error && (
            <div className="bg-ios-red-50 dark:bg-ios-red-900/20 border border-ios-red-200 dark:border-ios-red-800 text-ios-red-600 dark:text-ios-red-400 px-ios-md py-ios-sm rounded-ios-lg text-ios-footnote mb-ios-md">
              {error}
            </div>
          )}

          {/* STEP 1: Role Selection */}
          {currentStep === 1 && (
            <div className="space-y-ios-lg animate-ios-fade-in">
              <div className="space-y-ios-md">
                {/* Buyer Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, role: 'BUYER' }));
                    handleNextStep();
                  }}
                  className="w-full p-ios-lg rounded-ios-xl border-2 border-ios-blue-200 dark:border-ios-blue-800 hover:border-ios-blue-500 dark:hover:border-ios-blue-500 bg-gradient-to-br from-ios-blue-50 to-ios-purple-50 dark:from-ios-blue-900/20 dark:to-ios-purple-900/20 transition-all duration-200 active:scale-98 group"
                >
                  <div className="flex items-start gap-ios-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-xl flex items-center justify-center shadow-ios-md group-hover:shadow-ios-lg transition-shadow">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white mb-ios-xs">
                        I'm here to buy
                      </h3>
                      <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
                        Discover and purchase amazing digital products from talented creators
                      </p>
                    </div>
                  </div>
                </button>

                {/* Seller Option */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, role: 'SELLER' }));
                    handleNextStep();
                  }}
                  className="w-full p-ios-lg rounded-ios-xl border-2 border-ios-orange-200 dark:border-ios-orange-800 hover:border-ios-orange-500 dark:hover:border-ios-orange-500 bg-gradient-to-br from-ios-orange-50 to-ios-green-50 dark:from-ios-orange-900/20 dark:to-ios-green-900/20 transition-all duration-200 active:scale-98 group"
                >
                  <div className="flex items-start gap-ios-md">
                    <div className="w-12 h-12 bg-gradient-to-br from-ios-orange-500 to-ios-green-500 rounded-ios-xl flex items-center justify-center shadow-ios-md group-hover:shadow-ios-lg transition-shadow">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white mb-ios-xs">
                        I'm here to sell
                      </h3>
                      <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
                        Share your digital creations and earn money from your talent
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Login Link */}
              <div className="pt-ios-lg border-t border-ios-gray-200/50 dark:border-ios-gray-700/50 text-center">
                <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-ios-blue-500 hover:text-ios-blue-600 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Email & Password */}
          {currentStep === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-ios-md animate-ios-fade-in">
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

              <div>
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

                {formData.password && (
                  <div className="mt-ios-xs space-y-ios-xs">
                    <div className="flex items-center text-ios-caption2">
                      <span className={passwordStrength.hasMinLength ? 'text-ios-green-500' : 'text-ios-gray-400'}>
                        {passwordStrength.hasMinLength ? '✓' : '○'} At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-ios-caption2">
                      <span className={passwordStrength.hasUppercase ? 'text-ios-green-500' : 'text-ios-gray-400'}>
                        {passwordStrength.hasUppercase ? '✓' : '○'} One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-ios-caption2">
                      <span className={passwordStrength.hasNumber ? 'text-ios-green-500' : 'text-ios-gray-400'}>
                        {passwordStrength.hasNumber ? '✓' : '○'} One number
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <IOSInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-5 h-5" />}
                showPasswordToggle
                required
              />

              <div className="flex gap-ios-sm pt-ios-md">
                <IOSButton
                  type="button"
                  onClick={handlePrevStep}
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                >
                  Back
                </IOSButton>
                <IOSButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  Continue
                </IOSButton>
              </div>
            </form>
          )}

          {/* STEP 3: Profile Details */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-ios-md animate-ios-fade-in">
              <IOSInput
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={isBuyer ? "John Doe" : "Your Business Name"}
                leftIcon={<UserIcon className="w-5 h-5" />}
              />

              {/* Role-specific messaging */}
              <div className={`p-ios-md rounded-ios-lg ${
                isBuyer
                  ? 'bg-ios-blue-50 dark:bg-ios-blue-900/20 border border-ios-blue-200 dark:border-ios-blue-800'
                  : 'bg-ios-orange-50 dark:bg-ios-orange-900/20 border border-ios-orange-200 dark:border-ios-orange-800'
              }`}>
                <p className={`text-ios-footnote ${isBuyer ? 'text-ios-blue-600 dark:text-ios-blue-400' : 'text-ios-orange-600 dark:text-ios-orange-400'}`}>
                  {isBuyer
                    ? '🎉 As a buyer, you\'ll get instant access to thousands of digital products'
                    : '🚀 As a seller, you\'ll be able to upload and sell your digital products instantly'
                  }
                </p>
              </div>

              <div className="flex gap-ios-sm pt-ios-md">
                <IOSButton
                  type="button"
                  onClick={handlePrevStep}
                  variant="ghost"
                  size="lg"
                  className="flex-1"
                >
                  Back
                </IOSButton>
                <IOSButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </IOSButton>
              </div>
            </form>
          )}
        </IOSCard>
      </div>
    </div>
  );
}
