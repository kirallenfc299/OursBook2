import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Responsive breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      // OursBook design tokens - Dynamic theme colors
      colors: {
        // Dynamic theme colors using CSS variables
        theme: {
          primary: 'var(--color-primary)',
          'primary-dark': 'var(--color-primary-dark)',
          'primary-light': 'var(--color-primary-light)',
          secondary: 'var(--color-secondary)',
          'secondary-dark': 'var(--color-secondary-dark)',
          accent: 'var(--color-accent)',
          'accent-dark': 'var(--color-accent-dark)',
          black: 'var(--color-black)',
          'dark-gray': 'var(--color-dark-gray)',
          'medium-gray': 'var(--color-medium-gray)',
          'light-gray': 'var(--color-light-gray)',
          white: 'var(--color-white)',
        },
        // Keep oursbook colors as fallback
        oursbook: {
          primary: '#6366F1',
          'primary-dark': '#4F46E5',
          'primary-light': '#818CF8',
          secondary: '#F59E0B',
          'secondary-dark': '#D97706',
          black: '#000000',
          'dark-gray': '#141414',
          'medium-gray': '#2F2F2F',
          'light-gray': '#B3B3B3',
          white: '#FFFFFF',
          accent: '#10B981',
          'accent-dark': '#059669',
        },
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        dark: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e4e4e4',
          300: '#d1d1d1',
          400: '#b4b4b4',
          500: '#9a9a9a',
          600: '#818181',
          700: '#6a6a6a',
          800: '#5a5a5a',
          900: '#4a4a4a',
          950: '#141414',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        oursbook: ['Inter', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Ubuntu', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-up': 'scaleUp 0.2s ease-out',
        'carousel-scroll': 'carouselScroll 0.5s ease-in-out',
        'card-expand': 'cardExpand 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'card-collapse': 'cardCollapse 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'auth-float': 'authFloat 6s ease-in-out infinite',
        'auth-glow': 'authGlow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        carouselScroll: {
          '0%': { transform: 'translateX(var(--scroll-from))' },
          '100%': { transform: 'translateX(var(--scroll-to))' },
        },
        cardExpand: {
          '0%': { 
            transform: 'scale(1) translateY(0)',
            zIndex: '1'
          },
          '100%': { 
            transform: 'scale(1.25) translateY(-10px)',
            zIndex: '50'
          },
        },
        cardCollapse: {
          '0%': { 
            transform: 'scale(1.25) translateY(-10px)',
            zIndex: '50'
          },
          '100%': { 
            transform: 'scale(1) translateY(0)',
            zIndex: '1'
          },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)'
          },
        },
        bounce: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0,0,0)',
          },
          '40%, 43%': {
            transform: 'translate3d(0, -30px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -15px, 0)',
          },
          '90%': {
            transform: 'translate3d(0, -4px, 0)',
          },
        },
        authFloat: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.7'
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(180deg)',
            opacity: '1'
          },
        },
        authGlow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            transform: 'scale(1)'
          },
          '100%': { 
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)',
            transform: 'scale(1.05)'
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'oursbook': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'expanded': '0 16px 40px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'oursbook': '8px',
      },
      zIndex: {
        'modal': '1000',
        'dropdown': '100',
        'expanded-card': '40',
        'indicators': '10',
      }
    },
  },
  plugins: [],
}

export default config