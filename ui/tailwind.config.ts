import { nextui } from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|card|chip|divider|image|navbar|popover|user|ripple|spinner|avatar).js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'primary': '#007d7e',
        // 'secondary': '#00c9d0',
        'secondary': '#e6f4f1',
        'accent': '#ff8749',
      }
    },
    container: {
      center: true,
      padding: "2rem",
    },
  },
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: "#047858",
          secondary: "#000",
          success: "#22C55E",
          warning: "#B77206",
          danger: "#B74606",
        },
      },
    }
  })],
};
export default config;
