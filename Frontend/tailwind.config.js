/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (from design system)
        primary: {
          blue: '#2563eb',    // Trust, reliability
          green: '#059669',   // Success, growth  
          dark: '#1e293b',    // Text, headers
        },
        // Secondary/Accent Colors
        accent: {
          orange: '#ea580c',  // Motivation, energy
          yellow: '#d97706',  // Attention, warnings
          red: '#dc2626',     // Alerts, failures
        },
        // Custom grays following design system
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',     // Backgrounds
          200: '#e2e8f0',
          300: '#cbd5e1',     // Borders
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',     // Secondary text
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',     // Primary text
        }
      },
      fontSize: {
        // Typography scale from design system
        'xs': '0.75rem',      // 12px - caption
        'sm': '0.875rem',     // 14px - small
        'base': '1rem',       // 16px - body
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px - h4
        '2xl': '1.5rem',      // 24px - h3  
        '3xl': '1.875rem',    // 30px - h2
        '4xl': '2.25rem',     // 36px - h1
        '5xl': '3rem',        // 48px
        '6xl': '3.75rem',     // 60px
      },
      fontWeight: {
        normal: '400',        // body text
        medium: '500',        // h4
        semibold: '600',      // h2, h3
        bold: '700',          // h1
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}