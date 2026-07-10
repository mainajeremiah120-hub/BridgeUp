/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0F2F5',
        card: '#FFFFFF',
        border: '#DADDE1',
        primary: {
          DEFAULT: '#1877F2',
          hover: '#166FE5',
        },
        accent: {
          teal: '#1877F2',
          purple: '#1877F2',
        },
        text: {
          primary: '#050505',
          secondary: '#65676B',
          muted: '#8A8D91',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
