/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        keter: {
          // Backgrounds
          bg: '#f5f5f7',
          surface: '#ffffff',
          card: '#ffffff',
          'card-hover': '#fafafa',
          secondary: '#eeeef0',

          // Borders
          border: '#d2d2d7',
          'border-light': '#e8e8ed',

          // Text
          text: '#1d1d1f',
          'text-secondary': '#6e6e73',
          'text-muted': '#aeaeb2',

          // Accent — emerald
          accent: '#059669',
          'accent-hover': '#047857',
          'accent-light': '#d1fae5',
          'accent-muted': '#6ee7b7',

          // Semantic
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
