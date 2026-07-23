import { create } from "storybook/theming";

export default create({
	base: "dark",

	// Brand
	brandTitle: "WolfStar",
	brandUrl: "https://wolfstar.rocks",
	brandImage: "/logo-white.svg",
	brandTarget: "_self",

	// Primary colors — oklch(58% 0.233 277.117) ≈ Discord blurple
	colorPrimary: "#5865f2",
	colorSecondary: "#6977a4",

	// App chrome — mapped from the dark DaisyUI theme tokens
	// base-100: oklch(25% 0.016 252), base-200: oklch(23% 0.014 253)
	appBg: "#1b1d2b",
	appContentBg: "#1e2030",
	appHoverBg: "#23253a",
	appPreviewBg: "#1e2030",
	appBorderColor: "#2e3050",
	appBorderRadius: 8,

	// Typography
	fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
	fontCode: '"JetBrains Mono", ui-monospace, monospace',

	// Text — base-content: oklch(90% 0 0) ≈ #e4e4e4
	textColor: "#e4e4e4",
	textInverseColor: "#1e2030",
	textMutedColor: "#9098b8",

	// Toolbar / sidebar
	barTextColor: "#9098b8",
	barHoverColor: "#e4e4e4",
	barSelectedColor: "#5865f2",
	barBg: "#171921",

	// Buttons
	buttonBg: "#23253a",
	buttonBorder: "#2e3050",

	// Boolean toggle
	booleanBg: "#23253a",
	booleanSelectedBg: "#5865f2",

	// Inputs
	inputBg: "#23253a",
	inputBorder: "#2e3050",
	inputTextColor: "#e4e4e4",
	inputBorderRadius: 8,
});
