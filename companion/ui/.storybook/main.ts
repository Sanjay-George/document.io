import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    viteFinal: async (cfg) => {
        cfg.resolve = cfg.resolve ?? {};
        cfg.resolve.alias = {
            ...(cfg.resolve.alias ?? {}),
            '@': path.resolve(dirname, '../src'),
        };
        return cfg;
    },
};

export default config;
