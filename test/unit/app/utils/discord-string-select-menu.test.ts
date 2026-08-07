import { describe, expect, it } from "vitest";
import {
	resolveStringSelectMenuPlacement,
	STRING_SELECT_MENU_PANEL_MAX_HEIGHT,
} from "~/utils/constants";

describe("resolveStringSelectMenuPlacement", () => {
	const viewport = 800;

	it("defaults to above for zero-sized / unlaid-out triggers", () => {
		expect(resolveStringSelectMenuPlacement({ top: 0, bottom: 0, height: 0 }, viewport)).toBe(
			"above",
		);
	});

	it("opens above when there is enough room above the trigger", () => {
		expect(
			resolveStringSelectMenuPlacement({ top: 400, bottom: 436, height: 36 }, viewport),
		).toBe("above");
	});

	it("opens above near the composer when space below is tight", () => {
		const top = viewport - 80;
		expect(
			resolveStringSelectMenuPlacement({ top, bottom: top + 36, height: 36 }, viewport),
		).toBe("above");
	});

	it("flips below when above is too tight and below has room", () => {
		expect(
			resolveStringSelectMenuPlacement({ top: 40, bottom: 76, height: 36 }, viewport),
		).toBe("below");
	});

	it("stays above when both sides are tight", () => {
		const panel = STRING_SELECT_MENU_PANEL_MAX_HEIGHT;
		expect(
			resolveStringSelectMenuPlacement(
				{ top: panel - 20, bottom: panel + 16, height: 36 },
				panel + 40,
			),
		).toBe("above");
	});
});
