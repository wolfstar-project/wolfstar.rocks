import type { Preview } from "@storybook-vue/nuxt";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import { fn } from "storybook/test";
import { handlers } from "~/storybook/mocks/handlers";
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
		msw: {
			handlers,
		},
	},
	decorators: [
		// Nuxt UI components (tooltips, overlays, toasts) require the providers
		// that `<UApp>` installs. The real app wraps everything in `<UApp>` via
		// app.vue, but stories bypass it, so components like UTooltip throw
		// "Injection TooltipProviderContext not found". Wrap every story in
		// `<UApp>` to supply that context.
		() => ({ template: "<UApp><story /></UApp>" }),
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
