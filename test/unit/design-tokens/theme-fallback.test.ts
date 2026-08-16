/**
 * No-JavaScript Theme Fallback Guardrail
 *
 * @nuxtjs/color-mode applies `data-theme` (and the matching class) from an inline
 * script, so with JavaScript disabled the html element carries no theme at all.
 * Anything keyed on `[data-theme]` then falls back to whatever bare declarations
 * happen to be in the stylesheet, which is how light and dark values ended up
 * mixed on the same page (wolfstar-project/wolfstar.rocks#234).
 *
 * These checks keep that fallback coherent: a single DaisyUI default theme, and
 * theme-conditional CSS expressed through the `theme-light`/`theme-dark` variants
 * that also resolve the attribute-less state from `prefers-color-scheme`.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");

const mainCss = readFileSync(join(ROOT, "app/assets/css/main.css"), "utf-8");
const utilitiesCss = readFileSync(join(ROOT, "app/assets/css/utilities.css"), "utf-8");

/** Body of a `@custom-variant <name> { ... }` block, matched by brace depth. */
function readCustomVariant(source: string, name: string): string | undefined {
	const start = source.indexOf(`@custom-variant ${name} {`);
	if (start === -1) {
		return undefined;
	}

	let depth = 0;
	for (let i = source.indexOf("{", start); i < source.length; i++) {
		if (source[i] === "{") {
			depth++;
		} else if (source[i] === "}") {
			depth--;
			if (depth === 0) {
				return source.slice(start, i + 1);
			}
		}
	}

	return undefined;
}

describe("no-JavaScript theme fallback", () => {
	it("declares exactly one DaisyUI default theme", () => {
		// Two `default: true` themes both emit `:where(:root)`, so the last one wins
		// for every element without a `data-theme` attribute — including the
		// no-JavaScript render, where it contradicts the `:root` --ui-* values.
		const defaults = [...mainCss.matchAll(/@plugin\s+"daisyui\/theme"\s*\{([^}]*)\}/g)].filter(
			(match) => /\bdefault:\s*true\s*;/.test(match[1] ?? ""),
		);

		expect(defaults).toHaveLength(1);
		expect(defaults[0]?.[1]).toMatch(/\bname:\s*"light"\s*;/);
	});

	it("keeps a dark theme reachable through prefers-color-scheme", () => {
		const dark = mainCss.match(/@plugin\s+"daisyui\/theme"\s*\{[^}]*name:\s*"dark"[^}]*\}/);

		expect(dark?.[0]).toMatch(/\bprefersdark:\s*true\s*;/);
	});

	for (const name of ["theme-light", "theme-dark", "dark"]) {
		it(`the \`${name}\` variant resolves the attribute-less state from the system preference`, () => {
			const variant = readCustomVariant(mainCss, name);

			expect(variant, `@custom-variant ${name} is not declared in main.css`).toBeDefined();
			expect(variant).toContain("prefers-color-scheme");
			expect(variant).toContain(":root:not([data-theme])");
		});
	}

	it("keeps the `dark` variant identical to `theme-dark`", () => {
		// Custom variants cannot alias each other, so Tailwind's own `dark:` variant
		// repeats the theme-dark rules and has to be kept in sync by hand.
		const themeDark = readCustomVariant(mainCss, "theme-dark")?.replace("theme-dark", "dark");

		expect(readCustomVariant(mainCss, "dark")).toBe(themeDark);
	});

	it("expresses theme-conditional utilities through the variants", () => {
		// A bare `[data-theme="..."]` selector never matches without JavaScript, so
		// theme-conditional declarations must go through the variants above.
		const violations = utilitiesCss
			.split("\n")
			.map((line, index) => ({ line, number: index + 1 }))
			.filter(({ line }) => /\[data-theme[\]=]/.test(line))
			.map(
				({ line, number }) =>
					`app/assets/css/utilities.css:${number} — ${line.trim()} — use @variant theme-light/theme-dark instead.`,
			);

		expect(violations).toEqual([]);
	});
});
