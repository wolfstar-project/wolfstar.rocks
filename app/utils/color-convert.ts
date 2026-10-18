/** A colour as the picker holds it: hue in degrees, saturation and value in percent. */
export interface Hsv {
	h: number;
	s: number;
	v: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** `#RGB` or `#RRGGBB`, with or without the `#`, as `#RRGGBB` in capitals, or `null`. */
export function normalizeHex(input: string): string | null {
	const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(input.trim());
	const digits = match?.[1];
	if (!digits) return null;

	const full =
		digits.length === 3 ? Array.from(digits, (digit) => digit + digit).join("") : digits;
	return `#${full.toUpperCase()}`;
}

export function hexToHsv(hex: string): Hsv {
	const value = Number.parseInt((normalizeHex(hex) ?? "#000000").slice(1), 16);
	const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(
		(channel) => channel / 255,
	) as [number, number, number];
	const max = Math.max(r, g, b);
	const delta = max - Math.min(r, g, b);
	let h = 0;
	if (delta !== 0) {
		const raw =
			max === r
				? ((g - b) / delta) % 6
				: max === g
					? (b - r) / delta + 2
					: (r - g) / delta + 4;
		h = (((raw * 60) % 360) + 360) % 360;
	}
	return { h, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
}

export function hsvToHex({ h, s, v }: Hsv): string {
	const hue = ((h % 360) + 360) % 360;
	const sat = clamp(s, 0, 100) / 100;
	const val = clamp(v, 0, 100) / 100;
	const channel = (n: number) => {
		const k = (n + hue / 60) % 6;
		return val - val * sat * Math.max(0, Math.min(k, 4 - k, 1));
	};
	return `#${[channel(5), channel(3), channel(1)]
		.map((c) =>
			Math.round(c * 255)
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")
		.toUpperCase()}`;
}
