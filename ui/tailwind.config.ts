import { nextui } from '@nextui-org/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|card|chip|image|modal|navbar|table|popover|user|ripple|spinner|checkbox|spacer|avatar).js"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
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
