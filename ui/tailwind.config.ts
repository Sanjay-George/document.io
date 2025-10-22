import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'primary': '#0075A0',
        'danger': "#CE291A",
        'secondary': '#e6f4f1',
        'accent': '#ff8749',
      }
    },
    container: {
      center: true,
      padding: "2rem",
    },
  },
  plugins: [heroui({
    themes: {
      // light: {
      //   colors: {
      //     primary: "#0075A0",
      //     secondary: "#000",
      //     success: "#22C55E",
      //     warning: "#B77206",
      //     danger: "#CE291A",
      //   },
      // },
    }
  })],
};
export default config;
