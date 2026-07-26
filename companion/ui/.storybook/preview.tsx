import type { Preview } from '@storybook/react-vite';
import './tailwind.css';

const preview: Preview = {
    parameters: {
        layout: 'centered',
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="font-dio-ui text-dio-primary">
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
};

export default preview;
