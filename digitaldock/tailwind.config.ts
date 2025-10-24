import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // iOS-inspired color palette
        ios: {
          blue: {
            50: '#E5F1FF',
            100: '#CCE3FF',
            200: '#99C7FF',
            300: '#66ABFF',
            400: '#338FFF',
            500: '#007AFF', // iOS primary blue
            600: '#0062CC',
            700: '#004999',
            800: '#003166',
            900: '#001933',
          },
          gray: {
            50: '#F9FAFB',
            100: '#F2F4F6',
            200: '#E5E8EB',
            300: '#D1D6DB',
            400: '#B0B8C1',
            500: '#8B95A1',
            600: '#6B7684',
            700: '#4E5968',
            800: '#333D4B',
            900: '#1C2633',
          },
          green: {
            500: '#34C759', // iOS green
            600: '#2DA84C',
          },
          red: {
            500: '#FF3B30', // iOS red
            600: '#D93026',
          },
          orange: {
            500: '#FF9500', // iOS orange
            600: '#D97E00',
          },
          yellow: {
            500: '#FFCC00', // iOS yellow
            600: '#D9AC00',
          },
          purple: {
            500: '#AF52DE', // iOS purple
            600: '#9442C2',
          },
          pink: {
            500: '#FF2D55', // iOS pink
            600: '#D92446',
          },
          teal: {
            500: '#5AC8FA', // iOS teal
            600: '#4AACD4',
          },
          indigo: {
            500: '#5856D6', // iOS indigo
            600: '#4947B4',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      fontSize: {
        // iOS typography scale
        'ios-caption2': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'ios-caption1': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'ios-footnote': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.01em' }],
        'ios-subheadline': ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'ios-callout': ['1rem', { lineHeight: '1.3125rem', letterSpacing: '0.01em' }],
        'ios-body': ['1.0625rem', { lineHeight: '1.375rem', letterSpacing: '0.01em' }],
        'ios-headline': ['1.0625rem', { lineHeight: '1.3125rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'ios-title3': ['1.25rem', { lineHeight: '1.5rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'ios-title2': ['1.375rem', { lineHeight: '1.625rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'ios-title1': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '0.01em', fontWeight: '700' }],
        'ios-large-title': ['2.125rem', { lineHeight: '2.5625rem', letterSpacing: '0.01em', fontWeight: '700' }],
      },
      borderRadius: {
        // iOS corner radius
        'ios-xs': '0.25rem',   // 4px
        'ios-sm': '0.5rem',    // 8px
        'ios': '0.625rem',     // 10px
        'ios-md': '0.75rem',   // 12px
        'ios-lg': '1rem',      // 16px
        'ios-xl': '1.25rem',   // 20px
        'ios-2xl': '1.5rem',   // 24px
        'ios-3xl': '2rem',     // 32px
      },
      boxShadow: {
        // iOS shadows
        'ios-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'ios-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'ios': '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
        'ios-md': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'ios-lg': '0 12px 32px 0 rgba(0, 0, 0, 0.15)',
        'ios-xl': '0 16px 48px 0 rgba(0, 0, 0, 0.18)',
        'ios-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'ios': '20px',
        'ios-md': '30px',
        'ios-lg': '40px',
      },
      animation: {
        'ios-fade-in': 'iosFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'ios-slide-up': 'iosSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'ios-slide-down': 'iosSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'ios-scale-in': 'iosScaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'ios-bounce': 'iosBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        iosFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        iosSlideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        iosSlideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        iosScaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        iosBounce: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      spacing: {
        'ios-xs': '0.25rem',   // 4px
        'ios-sm': '0.5rem',    // 8px
        'ios': '0.75rem',      // 12px
        'ios-md': '1rem',      // 16px
        'ios-lg': '1.5rem',    // 24px
        'ios-xl': '2rem',      // 32px
        'ios-2xl': '2.5rem',   // 40px
        'ios-3xl': '3rem',     // 48px
      },
    },
  },
  plugins: [],
};

export default config;
