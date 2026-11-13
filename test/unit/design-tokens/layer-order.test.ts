/**
 * Token Layer Guardrail
 *
 * Cascade layers are ordered `theme`, `base`, `components`, `utilities`, and a
 * later layer wins whatever the specificity. A token whose light value sits in
 * `@layer base` while its dark value sits in `@layer theme` is therefore light in
 * every theme: the dark block is written but never applies. That is how the
 * showcase's Discord chrome and the form fields turned light on the dark theme.
 *
 * Every token the theme blocks redefine keeps its default in `@layer theme` too.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");
const mainCss = readFileSync(join(ROOT, "app/assets/css/main.css"), "utf-8");

/** The bodies of every top-level `@layer <name> { ... }` block, matched by brace depth. */
function readLayers(source: string, name: string): string[] {
	const bodies: string[] = [];
	const opener = `@layer ${name} {`;
	let start = source.indexOf(opener);
	while (start !== -1) {
		let depth = 0;
		for (let i = source.indexOf("{", start); i < source.length; i++) {
			if (source[i] === "{") depth++;
			else if (source[i] === "}" && --depth === 0) {
				bodies.push(source.slice(start, i + 1));
				break;
			}
		}
		start = source.indexOf(opener, start + opener.length);
	}
	return bodies;
}

function declaredTokens(blocks: readonly string[]): Set<string> {
	const tokens = new Set<string>();
	for (const block of blocks) {
		const withoutComments = block.replaceAll(/\/\*[\s\S]*?\*\//g, "");
		for (const match of withoutComments.matchAll(/(--[\w-]+)\s*:/g)) tokens.add(match[1]!);
	}
	return tokens;
}

describe("main.css token layers", () => {
	it("declares no token in both the base and the theme layer", () => {
		const base = declaredTokens(readLayers(mainCss, "base"));
		const theme = declaredTokens(readLayers(mainCss, "theme"));
		const shadowed = [...theme].filter((token) => base.has(token)).toSorted();

		expect(shadowed).toEqual([]);
	});
});
