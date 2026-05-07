/**
 * Design Token Guardrail
 *
 * Prevents regressions where hardcoded color literals creep into .vue files.
 * Scans <template> and <style> blocks for forbidden patterns. Hex literals in
 * CSS variable declarations (--foo: #hex) are allowed as an explicit opt-in.
 *
 * Allow-listed files are exempt from all checks (see ALLOW_LIST below).
 */

import { readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { sync as glob } from "fast-glob";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "../../..");

/** Exact file paths fully exempt from the token guardrail. */
const ALLOW_LIST = new Set([
	// Satori/Takumi requires resolved static colors (no var() support)
	"app/components/OgImage/Page.takumi.vue",
	// Discord-domain components maintain Discord brand fidelity with scoped vars
	"app/components/discord/message.vue",
	"app/components/discord/embed.vue",
	"app/components/discord/mention.vue",
	"app/components/discord/reaction.vue",
]);

/** Tailwind color palette names that map to raw colors (not semantic tokens). */
const PALETTE_COLORS = [
	"gray",
	"slate",
	"zinc",
	"stone",
	"neutral",
	"red",
	"orange",
	"amber",
	"yellow",
	"lime",
	"green",
	"emerald",
	"teal",
	"cyan",
	"sky",
	"blue",
	"indigo",
	"violet",
	"purple",
	"fuchsia",
	"pink",
	"rose",
];

const PALETTE_PREFIXES = ["text", "bg", "border", "ring", "from", "to", "via", "fill", "stroke"];

const TAILWIND_RAW_COLOR_RE = new RegExp(
	`\\b(${PALETTE_PREFIXES.join("|")})-(?:${PALETTE_COLORS.join("|")})-\\d{2,3}\\b`,
);

/** Hex color literal in a CSS declaration value (excluding CSS custom property declarations). */
const HEX_IN_STYLE_RE = /:\s*[^;{}]*#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i;

/** oklch/rgb/rgba literals in <style> blocks (not in custom property declarations). */
// Note: allowances for var()-based patterns are handled inline in the test loop.

function extractBlocks(source: string): { templates: string[]; styles: string[] } {
	const templates: string[] = [];
	const styles: string[] = [];

	const templateRe = /<template(?:\s[^>]*)?>[\s\S]*?<\/template>/gi;
	const styleRe = /<style(?:\s[^>]*)?>[\s\S]*?<\/style>/gi;

	for (const match of source.matchAll(templateRe)) {
		templates.push(match[0]);
	}
	for (const match of source.matchAll(styleRe)) {
		styles.push(match[0]);
	}

	return { templates, styles };
}

const files = glob(["app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"], {
	cwd: ROOT,
	ignore: ["**/*.unused.vue"],
});

describe("design-token guardrail: no hardcoded colors in .vue files", () => {
	for (const file of files) {
		const relPath = relative(ROOT, join(ROOT, file));

		if (ALLOW_LIST.has(relPath)) {
			continue;
		}

		const source = readFileSync(join(ROOT, file), "utf-8");
		const { templates, styles } = extractBlocks(source);

		it(`${relPath} — no raw Tailwind palette classes in <template>`, () => {
			for (const block of templates) {
				const lines = block.split("\n");
				for (const [i, line] of lines.entries()) {
					const match = line.match(TAILWIND_RAW_COLOR_RE);
					if (match) {
						expect.fail(
							`${relPath}:${i + 1} — raw Tailwind color class "${match[0]}" found. Use a semantic token (text-primary, bg-success, etc.) instead.`,
						);
					}
				}
			}
		});

		it(`${relPath} — no hex literals in <style>`, () => {
			for (const block of styles) {
				const lines = block.split("\n");
				for (const [i, line] of lines.entries()) {
					const isCssVarDecl = /^\s*--[\w-]+\s*:/.test(line);
					if (isCssVarDecl) continue;

					if (HEX_IN_STYLE_RE.test(line)) {
						expect.fail(
							`${relPath}:${i + 1} — hardcoded hex color in <style>: "${line.trim()}". Use a CSS custom property or semantic token instead.`,
						);
					}
				}
			}
		});

		it(`${relPath} — no inline oklch/rgb/rgba in <style> (outside CSS var declarations)`, () => {
			for (const block of styles) {
				const lines = block.split("\n");
				for (const [i, line] of lines.entries()) {
					const isCssVarDecl = /^\s*--[\w-]+\s*:/.test(line);
					if (isCssVarDecl) continue;

					// Allow color functions that reference CSS variables (semantic usage)
					const hasColorFunc = /\b(?:rgb|rgba|oklch|hsl|hsla)\s*\(/.test(line);
					if (!hasColorFunc) continue;

					// Allowed: uses var() inside the color function (semantic token reference)
					const hasVarInside = /\b(?:rgb|rgba|oklch|hsl|hsla)\s*\([^)]*var\(/.test(line);
					if (hasVarInside) continue;

					// Allowed: oklch relative-color syntax: oklch(from var(...)...)
					const isRelativeColor = /oklch\s*\(\s*from\s+var\(/.test(line);
					if (isRelativeColor) continue;

					// Allowed: pure neutrals — oklch with zero chroma (achromatic grays)
					const isZeroChromaNeutral = /oklch\(\s*\d+(?:\.\d+)?%?\s+0\s+\d/.test(line);
					if (isZeroChromaNeutral) continue;

					expect.fail(
						`${relPath}:${i + 1} — inline color function in <style>: "${line.trim()}". Use a CSS custom property or semantic token instead.`,
					);
				}
			}
		});
	}
});
