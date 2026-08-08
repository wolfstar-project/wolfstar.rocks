import { describe, expect, it, vi } from "vitest";
import { extractShortcuts } from "~/composables/defineShortcuts";

describe("extractShortcuts()", () => {
	it("should collect kbds + onSelect handlers from flat items", () => {
		const openSearch = vi.fn();
		const save = vi.fn();

		const shortcuts = extractShortcuts([
			{ kbds: ["meta", "k"], onSelect: openSearch },
			{ kbds: ["meta", "s"], onClick: save },
			{},
		]);

		expect(Object.keys(shortcuts)).toEqual(["meta_k", "meta_s"]);
		shortcuts.meta_k?.();
		shortcuts.meta_s?.();
		expect(openSearch).toHaveBeenCalledOnce();
		expect(save).toHaveBeenCalledOnce();
	});

	it("should traverse nested children and items", () => {
		const nested = vi.fn();
		const shortcuts = extractShortcuts([
			{
				children: [[{ kbds: ["g", "h"], onSelect: nested }]],
			},
			{
				items: [{ kbds: ["escape"], onClick: nested }],
			},
		]);

		expect(shortcuts["g_h"]).toBeTypeOf("function");
		expect(shortcuts.escape).toBeTypeOf("function");
	});

	it("should honor a custom separator", () => {
		const handler = vi.fn();
		const shortcuts = extractShortcuts([{ kbds: ["meta", "k"], onSelect: handler }], "-");
		expect(shortcuts["meta-k"]).toBe(handler);
	});
});
