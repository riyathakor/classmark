/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1e40af',
        },
        surface: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        muted: '#64748b',
        danger: '#dc2626',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
};