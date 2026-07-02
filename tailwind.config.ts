import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1e3a5f',
          600: '#1a3352',
          700: '#152b45',
          800: '#0f2238',
          900: '#0a1929',
        },
        gov: {
          blue: '#1e3a5f',
          gold: '#c4a35a',
          gray: '#f8f9fa',
          border: '#e5e7eb',
          text: '#1f2937',
          muted: '#6b7280',
        },
      },
    },
  },
  plugins: [],
}

export default config
