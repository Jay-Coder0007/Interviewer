/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 1s ease-out',
        'slide-up': 'slide-up 0.8s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
        'bounce-fade': 'bounce-fade 1s ease-in-out infinite',
        'morph': 'morph 8s ease infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'bounce-fade': {
          '0%, 100%': {
            transform: 'translateY(0)',
            opacity: '0.8'
          },
          '50%': {
            transform: 'translateY(-20px)',
            opacity: '1'
          }
        },
        'morph': {
          '0%, 100%': {
            'border-radius': '60% 40% 30% 70%/60% 30% 70% 40%'
          },
          '25%': {
            'border-radius': '30% 60% 70% 40%/50% 60% 30% 60%'
          },
          '50%': {
            'border-radius': '40% 60% 30% 70%/60% 40% 60% 30%'
          },
          '75%': {
            'border-radius': '60% 40% 60% 30%/30% 60% 40% 70%'
          }
        }
      },
    },
  },
  plugins: [],
} 