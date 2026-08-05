/**
 * Full-bleed sections inside the width-constrained UMain use:
 *
 *   width: 100vw;
 *   margin-inline: calc(50% - 50vw);
 *
 * That pattern is slightly wider than the layout whenever a vertical
 * scrollbar / scrollbar-gutter is present. Horizontal page scroll is
 * prevented by `overflow-x: clip` on `.app-layout` — keep that guard.
 *
 * Note: clipping on `html` is ineffective here because DaisyUI sets
 * `overflow` on `:root:not(span)` with higher specificity.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");
const LAYOUT = join(ROOT, "app/layouts/default.vue");

describe("app-layout overflow-x clip guards 100vw full-bleed", () => {
	it("keeps overflow-x: clip on .app-layout in the default layout", () => {
		const source = readFileSync(LAYOUT, "utf8");
		const appLayoutRule = source.match(/\.app-layout\s*\{[^}]*\}/);

		expect(appLayoutRule?.[0]).toBeDefined();
		expect(appLayoutRule?.[0]).toMatch(/overflow-x\s*:\s*clip\b/);
	});
});
