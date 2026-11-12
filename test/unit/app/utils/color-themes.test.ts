import { describe, expect, it } from "vitest";
import {
	COLOR_THEMES,
	colorThemeGradient,
	colorThemeVars,
	customColorTheme,
	DEFAULT_CUSTOM_THEME,
} from "~/utils/color-themes";
import fixture from "~~/test/fixtures/discord-color-themes.json";

type Rgb = [number, number, number];

function parseRgb(value: string): Rgb {
	const [r = 0, g = 0, b = 0] = value.match(/\d+/g)?.map(Number) ?? [];
	return [r, g, b];
}

// `hsl(h s% l%)`, as the theme variables write it, in 8-bit channels.
function hslToRgb(value: string): Rgb {
	const [h = 0, s = 0, l = 0] = value.match(/[\d.]+/g)?.map(Number) ?? [];
	const sat = s / 100;
	const light = l / 100;
	const chroma = (1 - Math.abs(2 * light - 1)) * sat;
	const channel = (n: number) => {
		const k = (n + h / 30) % 12;
		return Math.round(255 * (light - (chroma / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
	};
	return [channel(0), channel(8), channel(4)];
}

/** The largest difference between two colours' 8-bit channels. */
function channelDistance(a: Rgb, b: Rgb): number {
	return Math.max(...a.map((value, index) => Math.abs(value - (b[index] ?? 0))));
}

describe("the colour themes, against what Discord sets for each", () => {
	it("has every preset Discord has, and no other", () => {
		expect(COLOR_THEMES.map((theme) => theme.id).toSorted()).toStrictEqual(
			fixture.themes.map((theme) => theme.id).toSorted(),
		);
	});

	for (const reference of fixture.themes) {
		describe(`${reference.name}`, () => {
			const theme = COLOR_THEMES.find((candidate) => candidate.id === reference.id)!;
			const vars = colorThemeVars(theme);

			it("paints the same gradient, on the same base", () => {
				expect(colorThemeGradient(theme)).toBe(reference.gradient);
				expect(theme.base).toBe(reference.dataTheme === "light" ? "light" : "dark");
			});

			it("lets through as much, and mixes in as much tint", () => {
				expect(vars["--ct-mix"]).toBe(Number(reference.mix).toFixed(2));
				expect(vars["--ct-base-amount"]).toBe(reference.baseAmount);
				expect(vars["--ct-text-amount"]).toBe(reference.textAmount);
			});

			it("tints with the colour Discord works out", () => {
				const base = theme.base === "dark" ? reference.baseDark : reference.baseLight;
				expect(
					channelDistance(hslToRgb(vars["--ct-base"]), parseRgb(base)),
				).toBeLessThanOrEqual(1);
			});

			it("tints the text with the colour Discord works out", () => {
				const text = theme.base === "dark" ? reference.textDark : reference.textLight;
				expect(
					channelDistance(hslToRgb(vars["--ct-text"]), parseRgb(text)),
				).toBeLessThanOrEqual(4);
			});
		});
	}
});

describe("colorThemeVars intensity", () => {
	const dark = customColorTheme({ ...DEFAULT_CUSTOM_THEME, base: "dark" });
	const light = customColorTheme({ ...DEFAULT_CUSTOM_THEME, base: "light" });

	// What Discord's custom theme editor sets while its intensity slider moves.
	it.each([
		[0, "1.00", "100%", "30%"],
		[25, "0.82", "90%", "25%"],
		[56, "0.61", "77.6%", "18.8%"],
		[100, "0.30", "60%", "10%"],
	])("at %i, as Discord does", (intensity, mix, darkAmount, lightAmount) => {
		expect(colorThemeVars(dark, intensity)["--ct-mix"]).toBe(mix);
		expect(colorThemeVars(dark, intensity)["--ct-base-amount"]).toBe(darkAmount);
		expect(colorThemeVars(light, intensity)["--ct-base-amount"]).toBe(lightAmount);
	});

	it("keeps an intensity inside 0 to 100", () => {
		expect(colorThemeVars(dark, 400)["--ct-mix"]).toBe("0.30");
		expect(colorThemeVars(dark, -20)["--ct-mix"]).toBe("1.00");
	});

	it("starts the custom theme where Discord's editor does", () => {
		expect(DEFAULT_CUSTOM_THEME).toStrictEqual({
			angle: 56,
			base: "dark",
			colors: ["#3208CB", "#1572B8", "#7B6BCC"],
			intensity: 56,
		});
		expect(colorThemeGradient(dark)).toBe(
			"linear-gradient(56deg, #3208CB 0%, #1572B8 50%, #7B6BCC 100%)",
		);
	});
});
