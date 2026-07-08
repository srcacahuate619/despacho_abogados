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
          blue: '#996515',
          gold: '#8B6508',
          gray: '#111827',
          border: '#374151',
          text: '#f9fafb',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
}

export default config
