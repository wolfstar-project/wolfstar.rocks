import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
import daisyTheme from "daisyui/functions/variables.js";
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";

/**
 * UnoCSS alongside Tailwind v4 + DaisyUI (approach 3).
 *
 * DaisyUI's UnoCSS guide wires `@ameinhardt/unocss-preset-daisy` + `presetWind4`.
 * Themes (`light` / `dark` / `midnight`) stay in `app/assets/css/main.css` via
 * `@plugin "daisyui/theme"` so both engines share the same CSS variables /
 * `data-theme` surface. Wind4 preflight reset is off — Tailwind's
 * `@import "tailwindcss"` remains the sole base reset.
 *
 * Both engines remain intentional: Daisy component classes continue to work via
 * Tailwind's `@plugin "daisyui"`, while UnoCSS adds on-demand Wind4 utilities
 * and the community Daisy preset for UnoCSS consumers.
 *
 * @see https://daisyui.com/docs/install/unocss/
 */
export default defineConfig({
	// Avoid conflicts with Daisy classes like `file-input` (preset-daisy docs).
	separators: [":"],
	content: {
		pipeline: {
			include: [
				/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
				// Composables / utils that emit class strings at runtime
				"app/**/*.{js,ts}",
				"shared/**/*.{js,ts}",
				"content/**/*.{md,yml,yaml,json}",
			],
			exclude: [
				// Preserve @unocss/nuxt defaults
				/\.(css|postcss|sass|scss|less|stylus|styl)($|\?)/,
				/\?macro=true/,
				// OG templates use a separate CSS pipeline (Satori / Takumi)
				"**/OgImage/*.takumi.vue",
			],
		},
	},
	presets: [
		// DaisyUI guide order: presetDaisy then presetWind4
		presetDaisy({
			// Theme/base tokens live in main.css; skip UnoCSS copies to reduce
			// dual-engine duplication. Component/utils rules still register for
			// on-demand UnoCSS usage (Tailwind Daisy remains the primary source).
			base: false,
			themes: false,
		}),
		presetWind4({
			preflights: {
				reset: false,
			},
		}),
	],
	theme: {
		...daisyTheme,
	},
	transformers: [transformerDirectives({ enforce: "pre" }), transformerVariantGroup()],
});
