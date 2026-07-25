import type { Preview } from "@storybook/nextjs-vite";
import "./preview.css";
import "../app/hub.css";

const preview: Preview = {
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "hub",
            values: [{ name: "hub", value: "#F6F4F0" }],
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="hub-scope" style={{ minHeight: "auto", background: "transparent", padding: 8 }}>
                <Story />
            </div>
        ),
    ],
    tags: ["autodocs"],
};

export default preview;
