/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        muted: '#64748b',
        'accent': '#16a34a',
        'accent-soft': '#dcfce7',
        'warn': '#f59e0b',
        'warn-soft': '#fef3c7',
        'danger': '#ef4444',
        'danger-soft': '#fee2e2',
      },
    },
  },
  plugins: [],
}
