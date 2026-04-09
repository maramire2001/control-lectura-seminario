import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          50: '#fdfbfa',
          100: '#fbf5ed',
          200: '#f6ebd4',
          300: '#efdab3',
          400: '#e6c288',
          500: '#dfaf66',
          600: '#d29649',
          700: '#af773a',
          800: '#8e6035',
          900: '#734f2f',
          950: '#402a16',
        },
      },
    },
  },
  plugins: [],
};
export default config;
