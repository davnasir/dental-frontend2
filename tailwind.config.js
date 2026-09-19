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
        brand: {
          blue: '#14357B',
          teal: '#2299D6',
          navy: '#0A2255',
          light: '#D6E8F7',
          white: '#FFFFFF',
        },
        teal: {
          50: '#EDF7FC',
          100: '#D6E8F7',
          200: '#A8D4F0',
          300: '#6BB8E4',
          400: '#3CA0D9',
          500: '#2299D6',
          600: '#1A7DB3',
          700: '#146190',
          800: '#0F4A6E',
          900: '#0A334D',
          950: '#061F2E',
        },
        cyan: {
          50: '#EDF7FC',
          100: '#D6E8F7',
          200: '#A8D4F0',
          300: '#6BB8E4',
          400: '#3CA0D9',
          500: '#2299D6',
          600: '#1A7DB3',
          700: '#146190',
          800: '#0F4A6E',
          900: '#0A334D',
          950: '#061F2E',
        },
        dark: {
          bg: '#D6E8F7',
          card: '#FFFFFF',
          elevated: '#F0F7FD',
          border: '#B8D8EE',
          text: '#0A2255',
          muted: '#5A7A9A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        bengali: ['Noto Sans Bengali', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 25px -5px rgba(34, 153, 214, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(34, 153, 214, 0.35)',
        'card-soft': '0 10px 30px -10px rgba(10, 34, 85, 0.08)',
        'card-hover': '0 20px 40px -15px rgba(34, 153, 214, 0.15)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
