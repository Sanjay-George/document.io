import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ["../components/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-a11y"],
    framework: {
        name: "@storybook/nextjs-vite",
        options: {},
    },
    viteFinal: async (cfg) => {
        cfg.resolve = cfg.resolve ?? {};
        cfg.resolve.alias = {
            ...(cfg.resolve.alias ?? {}),
            "@": path.resolve(dirname, ".."),
        };
        return cfg;
    },
};

export default config;
