/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Dark surfaces
        surface: {
          DEFAULT: '#0d1117',
          50:  '#161b22',
          100: '#1c2333',
          200: '#21262d',
          300: '#2d333b',
          400: '#373e47',
          500: '#444c56',
        },
        // Risk colors
        safe:      '#10b981',
        negotiate: '#f59e0b',
        avoid:     '#ef4444',
        // Severity
        severity: {
          low:    '#06b6d4',
          medium: '#f59e0b',
          high:   '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':
          'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'glow-indigo':
          'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(99,102,241,0.25)',
        'glow-md': '0 0 30px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 60px rgba(99,102,241,0.4)',
        'glass':   '0 8px 32px rgba(0,0,0,0.4)',
        'card':    '0 4px 24px rgba(0,0,0,0.3)',
        'safe':    '0 0 20px rgba(16,185,129,0.3)',
        'negotiate':'0 0 20px rgba(245,158,11,0.3)',
        'avoid':   '0 0 20px rgba(239,68,68,0.3)',
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease forwards',
        'slide-up':      'slideUp 0.5s ease forwards',
        'slide-in-right':'slideInRight 0.4s ease forwards',
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'spin-slow':     'spin 3s linear infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'progress':      'progress 2s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'scan-line':     'scanLine 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        progress: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-42px)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(42px)', opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
