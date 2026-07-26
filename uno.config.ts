import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
import daisyTheme from "daisyui/functions/variables.js";
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";
import { presetA11y } from "./uno-preset-a11y";

/**
 * UnoCSS + Wind4 alongside Tailwind's Daisy `@plugin` (themes stay in main.css).
 * Preflight reset stays off so Tailwind remains the sole base layer.
 * @see https://daisyui.com/docs/install/unocss/
 */
export default defineConfig({
	// Avoid conflicts with Daisy classes like `file-input` (preset-daisy docs).
	separators: [":"],
	content: {
		pipeline: {
			include: [
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
				"app/**/*.{js,ts}",
				"shared/**/*.{js,ts}",
				"content/**/*.{md,yml,yaml,json}",
			],
			exclude: [
				/\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/,
				/\?macro=true/,
				"**/OgImage/*.takumi.vue",
			],
		},
	},
	presets: [
		presetDaisy({
			// Tokens already come from main.css `@plugin "daisyui/theme"`.
			base: false,
			themes: false,
		}),
		presetWind4({
			preflights: {
				reset: false,
			},
		}),
		presetA11y(),
	],
	theme: {
		...daisyTheme,
	},
	transformers: [transformerDirectives({ enforce: "pre" }), transformerVariantGroup()],
});
