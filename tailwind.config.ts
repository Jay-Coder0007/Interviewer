import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'bounce-fade': 'bounce-fade 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'morph': {
          '0%': { 'border-radius': '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { 'border-radius': '30% 60% 70% 40%/50% 60% 30% 60%' },
          '100%': { 'border-radius': '60% 40% 30% 70%/60% 30% 70% 40%' },
        },
        'bounce-fade': {
          '0%, 100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateY(-25%)',
            opacity: '0.5',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
