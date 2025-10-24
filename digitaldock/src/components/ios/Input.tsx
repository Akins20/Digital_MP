/**
 * iOS-style Input Component
 * Rounded inputs with iOS styling
 */

import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface IOSInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const IOSInput = forwardRef<HTMLInputElement, IOSInputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, showPasswordToggle, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine if we should show the password toggle
    const isPasswordInput = type === 'password' && showPasswordToggle;
    const inputType = isPasswordInput && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-ios-footnote font-medium text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-ios-sm top-1/2 -translate-y-1/2 text-ios-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-ios-md py-ios
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || isPasswordInput ? 'pr-10' : ''}
              text-ios-body
              bg-ios-gray-50 dark:bg-ios-gray-800
              border-2 ${error ? 'border-ios-red-500' : 'border-transparent'}
              rounded-ios-lg
              focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500
              transition-all duration-200
              placeholder:text-ios-gray-400
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
          {isPasswordInput && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-ios-sm top-1/2 -translate-y-1/2 text-ios-gray-400 hover:text-ios-gray-600 dark:hover:text-ios-gray-300 transition-colors active:scale-95"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
          {rightIcon && !isPasswordInput && (
            <div className="absolute right-ios-sm top-1/2 -translate-y-1/2 text-ios-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-ios-xs text-ios-caption1 text-ios-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-ios-xs text-ios-caption1 text-ios-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

IOSInput.displayName = 'IOSInput';

export default IOSInput;
