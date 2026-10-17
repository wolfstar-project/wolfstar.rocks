/**
 * How Discord paints a member's name and nameplate, ported from its web client
 * so the dashboard draws the account the way Discord does. Discord's own
 * fonts are its assets; the open-source typefaces they come from stand in.
 */

/** A member's display name style, as the user object carries it (`display_name_styles`). */
export interface DisplayNameStyles {
	font_id: number;
	effect_id: number;
	/** RGB colours as integers, most often one. */
	colors: number[];
}

/** The effects Discord offers, by id. */
export const DisplayNameEffect = {
	Gradient: 2,
	Glow: 6,
	Gummy: 8,
	Neon: 3,
	Pop: 5,
	Prism: 7,
	Solid: 1,
	Toon: 4,
} as const;

/**
 * The typeface for each of Discord's font ids. Neo Castel and Sinistre have no
 * free source to self-host, so the closest Google fonts stand in for them.
 */
export const DISPLAY_NAME_FONTS: Readonly<
	Record<number, { family: string; letterSpacing?: string }>
> = {
	1: { family: "Bangers" },
	2: { family: "BioRhyme" },
	3: { family: "Cherry Bomb One", letterSpacing: "0.04em" },
	4: { family: "Chicle" },
	6: { family: "MuseoModerno", letterSpacing: "0.01em" },
	7: { family: "Pirata One", letterSpacing: "0.02em" },
	8: { family: "Pixelify Sans", letterSpacing: "0.02em" },
	10: { family: "Grenze Gotisch", letterSpacing: "0.01em" },
	12: { family: "Zilla Slab", letterSpacing: "0.03em" },
	13: { family: "Playpen Sans" },
	14: { family: "Orbitron", letterSpacing: "0.03em" },
	15: { family: "New Rocker" },
	16: { family: "Kalam" },
};

/** The surfaces a styled name sits on, which its colours must stay readable against. */
export const DISPLAY_NAME_BACKGROUNDS = {
	dark: "#1e1f22",
	light: "#fbfbfb",
	toon: "#333333",
} as const;

/** A nameplate's palette: the colour Discord tints it with, per theme. */
export const NAMEPLATE_PALETTES: Readonly<Record<string, { dark: string; light: string }>> = {
	berry: { dark: "#893A99", light: "#B11FCF" },
	black: { dark: "#000000", light: "#000000" },
	bubble_gum: { dark: "#DC3E97", light: "#F957B3" },
	clover: { dark: "#047B20", light: "#63CD5A" },
	cobalt: { dark: "#0131C2", light: "#4278FF" },
	crimson: { dark: "#900007", light: "#E7040F" },
	forest: { dark: "#2D5401", light: "#6AA624" },
	lemon: { dark: "#F6CD12", light: "#FED400" },
	sky: { dark: "#0080B7", light: "#56CCFF" },
	teal: { dark: "#086460", light: "#7DEED7" },
	violet: { dark: "#730BC8", light: "#972FED" },
	white: { dark: "#FFFFFF", light: "#FFFFFF" },
};

/**
 * The gradient Discord lays under a nameplate on the account panel: its
 * palette at 10% on the left, 40% (30% in light themes) on the right.
 */
export function nameplateBackground(palette: string, theme: "dark" | "light"): string | null {
	const colours = NAMEPLATE_PALETTES[palette];
	if (!colours) return null;
	const colour = theme === "light" ? colours.light : colours.dark;
	return `linear-gradient(90deg, ${colour}1A 0%, ${colour}${theme === "light" ? "4D" : "66"} 100%)`;
}

/**
 * The nameplate fades to 30% under the avatar and the name, and is whole from
 * 50px past them, so the name stays readable.
 */
export function nameplateMask(nameWidth: number): string {
	const start = Math.max(0, nameWidth - 5);
	return `linear-gradient(to right, rgba(0, 0, 0, 0.3) ${start}px, rgba(0, 0, 0, 1) ${start + 50}px)`;
}

interface Hsl {
	h: number;
	s: number;
	l: number;
}

export function intToHex(value: number): string {
	return `#${(value & 0xFFFFFF).toString(16).padStart(6, "0")}`;
}

function hexToRgb(hex: string): [number, number, number] {
	const value = Number.parseInt(hex.slice(1, 7), 16);
	return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
	return `#${[r, g, b].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex: string): Hsl {
	const [r, g, b] = hexToRgb(hex).map((part) => part / 255) as [number, number, number];
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return { h: 0, l, s: 0 };
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h: number;
	if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
	else if (max === g) h = (b - r) / d + 2;
	else h = (r - g) / d + 4;
	return { h: h * 60, l, s };
}

function hslToHex({ h, s, l }: Hsl): string {
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

function relativeLuminance(hex: string): number {
	const [r, g, b] = hexToRgb(hex).map((part) => {
		const c = part / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	}) as [number, number, number];
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
	const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].toSorted(
		(x, y) => y - x,
	) as [number, number];
	return (light + 0.05) / (dark + 0.05);
}

/**
 * Moves a colour's lightness away from the background until the two reach
 * the contrast Discord asks of a name (3:1), keeping its hue.
 */
export function ensureContrast(colour: string, background: string, ratio = 3): string {
	if (contrastRatio(colour, background) >= ratio) return colour;
	const hsl = hexToHsl(colour);
	const lighten = relativeLuminance(background) < 0.5;
	let candidate = colour;
	for (let step = 1; step <= 20; step++) {
		const l = lighten ? Math.min(1, hsl.l + step * 0.05) : Math.max(0, hsl.l - step * 0.05);
		candidate = hslToHex({ ...hsl, l });
		if (contrastRatio(candidate, background) >= ratio) break;
	}
	return candidate;
}

/** The shades Discord derives from a style's first colour for its effects. */
export function displayNameShades(colour: string) {
	const hsl = hexToHsl(colour);
	const at = (l: number, s = hsl.s) => hslToHex({ h: hsl.h, l, s });
	return {
		dark2: at(Math.max(0, 0.2 * hsl.l)),
		light1: at(Math.min(1, 1.2 * hsl.l)),
		light2: at(Math.min(1, 1.6 * hsl.l)),
		main: colour,
		neonStroke: at(Math.min(0.6, hsl.l + 0.1), Math.min(1, 1.2 * hsl.s)),
		toonStroke: at(Math.max(0.12, 0.4 * hsl.l)),
	};
}

/**
 * The CSS custom properties an effect reads, from the style's colours (already
 * brought to a readable contrast). `nameLength` sizes the prism's cycle.
 */
export function displayNameStyleVars(
	effect: number,
	colours: readonly string[],
	nameLength: number,
): Record<string, string> {
	const first = colours[0];
	if (!first) return {};
	if (effect === DisplayNameEffect.Gradient || effect === DisplayNameEffect.Glow) {
		const stops =
			colours.length === 1
				? `${first}, ${first}`
				: colours.map((c, i) => `${c} ${10 + (80 * i) / (colours.length - 1)}%`).join(", ");
		return { "--dns-gradient-stops": stops, "--dns-main": first };
	}
	if (effect === DisplayNameEffect.Prism) {
		const stops = Array.from(
			{ length: colours.length + 1 },
			(_, i) => `${colours[i % colours.length]} ${((100 * i) / colours.length).toFixed(3)}%`,
		).join(", ");
		return {
			"--dns-main": first,
			"--dns-prism-cycle": `max(${nameLength}ch, 38px)`,
			"--dns-prism-stops": stops,
		};
	}
	const shades = displayNameShades(first);
	return {
		"--dns-dark-2": shades.dark2,
		"--dns-light-1": shades.light1,
		"--dns-light-2": shades.light2,
		"--dns-main": shades.main,
		"--dns-neon-stroke": shades.neonStroke,
		"--dns-toon-stroke": shades.toonStroke,
	};
}
