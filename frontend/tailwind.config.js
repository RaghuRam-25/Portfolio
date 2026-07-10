/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: { bg: '#FAFAFA', surface: '#FFFFFF', textPrimary: '#1D1D1F', textSecondary: '#6E6E73', border: '#E5E5E7' },
        dark: { bg: '#030303', surface: '#0A0A0C', textPrimary: '#F5F5F7', textSecondary: '#8E8E93', border: '#1F1F23' },
        accent: { blue: '#0071E3', purple: '#6366F1' }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'premium-light': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'premium-dark': '0 4px 30px rgba(0, 0, 0, 0.4)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      // নতুন অ্যানিমেশনগুলো এখানে যোগ করছি
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-15px)' } },
        fadeInLeft: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInRight: { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        float: 'float 5s ease-in-out infinite',
        fadeInLeft: 'fadeInLeft 1s ease-out forwards',
        slideUp: 'slideUp 0.8s ease-out forwards',
        fadeInRight: 'fadeInRight 1s ease-out forwards'
      }
    },
  },
  plugins: [],
}