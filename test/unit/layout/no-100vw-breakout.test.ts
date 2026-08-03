/**
 * Guardrail against the classic full-bleed breakout that causes horizontal
 * page scroll when a vertical scrollbar is present:
 *
 *   width: 100vw;
 *   margin-inline: calc(50% - 50vw);
 *
 * Prefer full-width block layout (or a non-vw technique) for edge-to-edge bands.
 */

import { globSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");

const VW_BREAKOUT_RE =
	/(?:width|max-width)\s*:\s*100vw\b|margin-inline\s*:\s*calc\(\s*50%\s*-\s*50vw\s*\)/;

describe("no 100vw full-bleed breakout", () => {
	const files = [
		...globSync("app/pages/**/*.vue", { cwd: ROOT }),
		...globSync("app/components/**/*.vue", { cwd: ROOT }),
		...globSync("app/layouts/**/*.vue", { cwd: ROOT }),
	]
		.map((file) => relative(ROOT, join(ROOT, file)).replaceAll("\\", "/"))
		.sort();

	it("scans marketing/layout Vue files", () => {
		expect(files.length).toBeGreaterThan(0);
	});

	it.each(files)("%s does not use a 100vw breakout", (relPath) => {
		const source = readFileSync(join(ROOT, relPath), "utf8");
		const styleBlocks = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(
			(match) => match[1] ?? "",
		);

		for (const block of styleBlocks) {
			expect(block).not.toMatch(VW_BREAKOUT_RE);
		}
	});
});
