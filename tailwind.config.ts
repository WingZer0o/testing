import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#13131a',
        'bg-tertiary': '#1a1a24',
        'bg-sidebar': '#0d0d14',
        'accent-green': '#00d4aa',
        'accent-red': '#ff4d6d',
        'accent-blue': '#4d9eff',
        'text-primary': '#e8e8f0',
        'text-secondary': '#8888aa',
        'text-muted': '#44445a',
        'border-dark': '#1e1e2e',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
