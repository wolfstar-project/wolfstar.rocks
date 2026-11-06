/**
 * Scrollbar Guardrail
 *
 * The console draws its scrollbar from the `::-webkit-scrollbar` parts: a slim
 * rounded thumb with no arrows. A browser that is given a `scrollbar-color`
 * ignores those parts and draws its own bar, arrows included, and daisyUI gives
 * the root one in `@layer base`. The reset that undoes it has to sit outside any
 * layer, or the order of the plugin's output decides whether the console's
 * scrollbar shows at all, as it did in every dialog before.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");
const mainCss = readFileSync(join(ROOT, "app/assets/css/main.css"), "utf-8");

/** The source with every `@layer name { ... }` block cut out, matched by brace depth. */
function withoutLayers(source: string): string {
	let rest = source;
	for (let start = rest.indexOf("@layer "); start !== -1; start = rest.indexOf("@layer ")) {
		const open = rest.indexOf("{", start);
		const semicolon = rest.indexOf(";", start);
		// `@layer a, b;` declares the order and has no block.
		if (semicolon !== -1 && semicolon < open) {
			rest = rest.slice(0, start) + rest.slice(semicolon + 1);
			continue;
		}
		let depth = 0;
		let end = open;
		for (; end < rest.length; end++) {
			if (rest[end] === "{") depth++;
			else if (rest[end] === "}" && --depth === 0) break;
		}
		rest = rest.slice(0, start) + rest.slice(end + 1);
	}
	return rest;
}

describe("main.css scrollbar", () => {
	it("draws the console's scrollbar from the webkit parts, with no arrows", () => {
		expect(mainCss).toMatch(/\*::-webkit-scrollbar\s*\{[^}]*width:\s*16px/u);
		expect(mainCss).toMatch(/\*::-webkit-scrollbar-button\s*\{[^}]*display:\s*none/u);
		expect(mainCss).toMatch(/\*::-webkit-scrollbar-thumb\s*\{[^}]*border-radius:\s*8px/u);
	});

	it("resets the root's scrollbar-color outside any layer, where daisyUI's cannot win", () => {
		const unlayered = withoutLayers(mainCss);

		expect(unlayered).toMatch(
			/@supports not \(-moz-appearance: none\)\s*\{\s*:root\s*\{\s*scrollbar-color:\s*auto;/u,
		);
	});

	it("leaves the colour of the scrollbar to Firefox alone", () => {
		const firefox = mainCss.match(
			/@supports \(-moz-appearance: none\)\s*\{[^}]*scrollbar-color:[^;]+;/u,
		);

		expect(firefox).not.toBeNull();
	});
});
