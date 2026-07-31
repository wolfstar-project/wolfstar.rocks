import { presetDaisy } from "@ameinhardt/unocss-preset-daisy";
import daisyTheme from "daisyui/functions/variables.js";
import {
	defineConfig,
	presetTypography,
	presetWind4,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";
import { presetA11y } from "./uno-preset-a11y";

/**
 * UnoCSS is the sole utility engine (DaisyUI via presetDaisy + Wind4).
 * Theme color keys map to CSS variables by name — e.g. `bg-primary` → `var(--color-primary)`.
 * @see https://daisyui.com/docs/install/unocss/
 * @see https://unocss.dev/presets/wind4
 * @see https://unocss.dev/integrations/nuxt
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
			// Theme CSS vars live in app/assets/css/daisy-themes.css.
			base: true,
			// @ts-expect-error - daisyUI accepts `false` to disable built-in themes; preset types only list string[].
			themes: false,
		}),
		presetWind4({
			preflights: {
				reset: true,
				theme: true,
			},
		}),
		presetTypography(),
		presetA11y(),
	],
	theme: {
		...daisyTheme,
		colors: {
			...daisyTheme.colors,
			// Extra design tokens → utility name == CSS variable stem
			"branding-wolfstar": "var(--color-branding-wolfstar)",
			"branding-staryl": "var(--color-branding-staryl)",
			"spectrum-red": "var(--color-spectrum-red)",
			"spectrum-orange": "var(--color-spectrum-orange)",
			"spectrum-yellow": "var(--color-spectrum-yellow)",
			"spectrum-green": "var(--color-spectrum-green)",
			"spectrum-blue": "var(--color-spectrum-blue)",
			"spectrum-purple": "var(--color-spectrum-purple)",
			"boost-pink": "var(--color-boost-pink)",
		},
		font: {
			geist: "var(--font-geist)",
			whitney: '"Whitney", ui-sans-serif, system-ui, sans-serif',
		},
		// Wind4: letter-spacing utilities use theme keys under `tracking` / letterSpacing
		letterSpacing: {
			"home-ls-tight": "var(--home-ls-tight)",
			"home-ls-label": "var(--home-ls-label)",
		},
		borderRadius: {
			...daisyTheme.borderRadius,
		},
	},
	extendTheme: (theme) => {
		const t = theme as typeof theme & {
			tracking?: Record<string, string>;
			shadow?: Record<string, string>;
		};
		t.tracking = {
			...t.tracking,
			"home-ls-tight": "var(--home-ls-tight)",
			"home-ls-label": "var(--home-ls-label)",
		};
		t.shadow = {
			...t.shadow,
			glow: "var(--home-shadow-glow)",
		};
		return t;
	},
	shortcuts: {
		// Semantic aliases formerly provided via Tailwind `@utility`
		"text-muted": "text-base-content/60",
		"text-dimmed": "text-base-content/40",
		"text-toned": "text-base-content/80",
		"text-highlighted": "text-base-content",
		"text-inverted": "text-base-100",
		"bg-default": "bg-base-100",
		"bg-muted": "bg-base-200",
		"bg-elevated": "bg-base-200",
		"bg-accented": "bg-base-300",
		"border-default": "border-base-200",
		"border-muted": "border-base-300",
		"border-accented": "border-base-300",
	},
	rules: [
		// Named letter-spacing tokens (fallback if theme.tracking key shape differs)
		["tracking-home-ls-tight", { "letter-spacing": "var(--home-ls-tight)" }],
		["tracking-home-ls-label", { "letter-spacing": "var(--home-ls-label)" }],
		["shadow-glow", { "box-shadow": "var(--home-shadow-glow)" }],
		["animate-accordion-down", { animation: "var(--animate-accordion-down)" }],
		["animate-accordion-up", { animation: "var(--animate-accordion-up)" }],
	],
	transformers: [transformerDirectives({ enforce: "pre" }), transformerVariantGroup()],
});
