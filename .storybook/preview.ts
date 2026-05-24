import type { Preview } from "@storybook-vue/nuxt";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { fn } from "storybook/test";
import wolfstarDark from "./theme";

initialize();

// Stub Nuxt composables that are not available in Storybook context
// @ts-expect-error - dynamic global name
globalThis.defineOgImage = fn();

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		docs: {
			theme: wolfstarDark,
		},
	},
	decorators: [
		withThemeByDataAttribute({
			themes: {
				Light: "light",
				Dark: "dark",
			},
			defaultTheme: "Dark",
			attributeName: "data-theme",
		}),
	],
	loaders: [mswLoader],
};

export default preview;
