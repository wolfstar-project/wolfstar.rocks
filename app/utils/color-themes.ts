/**
 * Discord's colour themes: a gradient painted behind the dashboard, which its
 * surfaces let through, on a light or a dark base. The presets are Discord's
 * own; the custom theme is built from the same parts.
 */

export type ColorThemeBase = "dark" | "light";

export interface ColorThemeStop {
	color: string;
	/** Position along the gradient, in percent. */
	at: number;
}

export interface ColorTheme {
	id: string;
	base: ColorThemeBase;
	/** Gradient direction, in degrees. */
	angle: number;
	stops: readonly ColorThemeStop[];
}

/** A theme the visitor builds: up to five colours, a direction and an intensity. */
export interface CustomColorTheme {
	base: ColorThemeBase;
	colors: string[];
	angle: number;
	/** 0–100: how much of the gradient the surfaces let through. */
	intensity: number;
}

export const CUSTOM_THEME_MAX_COLORS = 5;

export const DEFAULT_CUSTOM_THEME: CustomColorTheme = {
	angle: 56,
	base: "dark",
	colors: ["#3208CB", "#1572B8", "#7B6BCC"],
	intensity: 56,
};

// The intensity Discord's presets are made at.
const PRESET_INTENSITY = 50;

const stops = (...pairs: [string, number][]): ColorThemeStop[] =>
	pairs.map(([color, at]) => ({ at, color }));

export const COLOR_THEMES: readonly ColorTheme[] = [
	{
		angle: 180,
		base: "light",
		id: "mint-apple",
		stops: stops(["#56B69F", 6.15], ["#63BC61", 48.7], ["#9ECA67", 93.07]),
	},
	{
		angle: 180,
		base: "light",
		id: "citrus-sherbert",
		stops: stops(["#F3B336", 31.1], ["#EE8558", 67.09]),
	},
	{
		angle: 148.71,
		base: "light",
		id: "retro-raincloud",
		stops: stops(["#3A7CA1", 5.64], ["#7F7EB9", 26.38], ["#7F7EB9", 49.92], ["#3A7CA1", 73.12]),
	},
	{
		angle: 38.08,
		base: "light",
		id: "hanami",
		stops: stops(["#EFAAB3", 3.56], ["#EFD696", 35.49], ["#A6DAA2", 68.78]),
	},
	{
		angle: 154.19,
		base: "light",
		id: "sunrise",
		stops: stops(["#9F4175", 8.62], ["#C49064", 48.07], ["#A6953D", 76.04]),
	},
	{
		angle: 180.14,
		base: "light",
		id: "candyfloss",
		stops: stops(["#F4ABB8", 8.5], ["#B1C2FC", 94.28]),
	},
	{
		angle: 179.52,
		base: "light",
		id: "lofi-vibes",
		stops: stops(["#A4C0F7", 7.08], ["#A9E4E8", 34.94], ["#B0E2B8", 65.12], ["#CFDFA2", 96.23]),
	},
	{
		angle: 38.99,
		base: "light",
		id: "desert-khaki",
		stops: stops(["#E7DBD0", 12.92], ["#DFD0B2", 32.92], ["#E0D6A3", 52.11]),
	},
	{
		angle: 141.68,
		base: "dark",
		id: "sunset",
		stops: stops(["#48288C", 27.57], ["#DB7F4B", 71.25]),
	},
	{
		angle: 128.92,
		base: "dark",
		id: "chroma-glow",
		stops: stops(
			["#0EB5BF", 3.94],
			["#4C0CE0", 26.1],
			["#A308A7", 39.82],
			["#9A53FF", 56.89],
			["#218BE0", 76.45],
		),
	},
	{
		angle: 162.27,
		base: "dark",
		id: "forest",
		stops: stops(
			["#142215", 11.2],
			["#2D4D39", 29.93],
			["#454C32", 48.64],
			["#5A7C58", 67.85],
			["#A98E4B", 83.54],
		),
	},
	{
		angle: 64.92,
		base: "dark",
		id: "crimson-moon",
		stops: stops(["#950909", 16.17], ["#000000", 72]),
	},
	{
		angle: 48.17,
		base: "dark",
		id: "midnight-blurple",
		stops: stops(["#5348CA", 11.21], ["#140730", 61.92]),
	},
	{
		angle: 170.82,
		base: "dark",
		id: "mars",
		stops: stops(["#895240", 14.61], ["#8F4343", 74.62]),
	},
	{ angle: 180, base: "dark", id: "dusk", stops: stops(["#665069", 12.84], ["#91A3D1", 85.99]) },
	{
		angle: 179.14,
		base: "dark",
		id: "under-the-sea",
		stops: stops(["#647962", 1.91], ["#588575", 48.99], ["#6A8482", 96.35]),
	},
	{
		angle: 148.71,
		base: "dark",
		id: "retro-storm",
		stops: stops(["#3A7CA1", 5.64], ["#58579A", 26.38], ["#58579A", 49.92], ["#3A7CA1", 73.12]),
	},
	{
		angle: 180,
		base: "dark",
		id: "neon-nights",
		stops: stops(["#01A89E", 0], ["#7D60BA", 50], ["#B43898", 100]),
	},
	{
		angle: 161.03,
		base: "dark",
		id: "strawberry-lemonade",
		stops: stops(["#AF1A6C", 18.79], ["#C26B20", 49.76], ["#E7A525", 80.72]),
	},
	{
		angle: 239.16,
		base: "dark",
		id: "aurora",
		stops: stops(
			["#062053", 10.39],
			["#191FBB", 26.87],
			["#13929A", 48.31],
			["#218573", 64.98],
			["#051A81", 92.5],
		),
	},
	{
		angle: 69.98,
		base: "dark",
		id: "sepia",
		stops: stops(["#857664", 14.14], ["#5B4421", 60.35]),
	},
	{
		angle: 47.61,
		base: "dark",
		id: "blurple-twilight",
		stops: stops(["#2C3FE7", 11.18], ["#261D83", 64.54]),
	},
	{ angle: 180, base: "light", id: "memory-lane", stops: stops(["#7289DA", 4], ["#4E5D94", 96]) },
];

export function findColorTheme(id: string | null | undefined): ColorTheme | undefined {
	return id ? COLOR_THEMES.find((theme) => theme.id === id) : undefined;
}

/** The custom theme as a theme like the presets: its colours spread evenly. */
export function customColorTheme(custom: CustomColorTheme): ColorTheme {
	const colors = custom.colors.length > 0 ? custom.colors : DEFAULT_CUSTOM_THEME.colors;
	return {
		angle: custom.angle,
		base: custom.base,
		id: "custom",
		stops: colors.map((color, index) => ({
			at: colors.length === 1 ? 0 : (100 * index) / (colors.length - 1),
			color,
		})),
	};
}

export function colorThemeGradient(theme: ColorTheme): string {
	const parts = theme.stops.map((stop) => `${stop.color} ${stop.at}%`).join(", ");
	return `linear-gradient(${theme.angle}deg, ${parts})`;
}

/** The swatch of a theme in the picker: its gradient, dimmed as Discord shows it. */
export function colorThemeSwatch(theme: ColorTheme): string {
	return `linear-gradient(rgb(0 0 0 / 0.4), rgb(0 0 0 / 0.4)), ${colorThemeGradient(theme)}`;
}

function rgb(hex: string): [number, number, number] {
	const value = Number.parseInt(hex.slice(1, 7), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** The hue (degrees) and saturation (percent) of a colour, as HSL gives them. */
function hueAndSaturation(hex: string): { hue: number; saturation: number } {
	const [r, g, b] = rgb(hex).map((channel) => channel / 255) as [number, number, number];
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;
	if (delta === 0) return { hue: 0, saturation: 0 };

	const lightness = (max + min) / 2;
	const raw =
		max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
	return {
		hue: (((raw * 60) % 360) + 360) % 360,
		saturation: (delta / (1 - Math.abs(2 * lightness - 1))) * 100,
	};
}

/** How bright a colour is to the eye (relative luminance, 0–1). */
function luminance(hex: string): number {
	const [r, g, b] = rgb(hex).map((channel) => {
		const value = channel / 255;
		return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

/**
 * The CSS custom properties a theme sets on the page, worked out as Discord
 * does (checked against its 23 presets, `test/unit/app/utils/color-themes.test.ts`):
 *
 * - the gradient, and `--ct-mix`, how much of the surfaces' veil is left over
 *   it: 1 with no intensity, 0.3 at the full 100;
 * - the tint surfaces are mixed with, `--ct-base`: on a dark base the hue of the
 *   darkest colour at 5% lightness, on a light base the hue of the lightest at
 *   90% (fully saturated, unless that colour is a grey), taking
 *   `--ct-base-amount` of the mix (dark: 100 − 0.4·intensity, light:
 *   30 − 0.2·intensity);
 * - the text colour the interface's text is tinted with, `--ct-text`, from the
 *   same two colours, taking 30% (dark) or 40% (light).
 */
export function colorThemeVars(theme: ColorTheme, intensity = PRESET_INTENSITY) {
	const colors = theme.stops.map((stop) => stop.color);
	const first = colors[0] ?? "#000000";
	const ranked = colors.toSorted((a, b) => luminance(a) - luminance(b));
	const darkest = hueAndSaturation(ranked[0] ?? first);
	const lightest = hueAndSaturation(ranked.at(-1) ?? first);
	const level = Math.min(100, Math.max(0, intensity));
	const dark = theme.base === "dark";

	return {
		"--ct-base": dark
			? `hsl(${round(darkest.hue)} ${darkest.saturation === 0 ? 0 : 100}% 5%)`
			: `hsl(${round(lightest.hue)} ${lightest.saturation === 0 ? 0 : 100}% 90%)`,
		"--ct-base-amount": `${round(dark ? 100 - 0.4 * level : 30 - 0.2 * level, 1)}%`,
		"--ct-gradient": colorThemeGradient(theme),
		"--ct-mix": round(1 - 0.7 * (level / 100)).toFixed(2),
		"--ct-text": dark
			? `hsl(${round(darkest.hue)} ${round(darkest.saturation)}% 95%)`
			: `hsl(${round(lightest.hue)} ${round(lightest.saturation)}% 3%)`,
		"--ct-text-amount": dark ? "30%" : "40%",
	};
}
