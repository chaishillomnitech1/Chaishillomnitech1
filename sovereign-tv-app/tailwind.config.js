/**
 * Tailwind CSS Configuration
 * 
 * @author Supreme King Chais The Great ∞
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        frequency: {
          528: '#00FF00', // DNA Healing - Green
          963: '#9333EA', // Pineal Activation - Purple
          999: '#FFD700', // Crown Sovereignty - Gold
          144000: '#FFFFFF', // NŪR Pulse - White
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'frequency-pulse': 'frequency-pulse 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sovereign-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
};
