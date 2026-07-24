import { describe, expect, it } from "vitest";
import { splitDiscordAppLauncherPromoTitle } from "~/utils/constants";

describe("splitDiscordAppLauncherPromoTitle", () => {
	it("puts the first word on line 1 and the rest on line 2 (positive)", () => {
		expect(splitDiscordAppLauncherPromoTitle("Magic Garden")).toEqual(["Magic", "Garden"]);
		expect(splitDiscordAppLauncherPromoTitle("Farm Merge Valley")).toEqual([
			"Farm",
			"Merge Valley",
		]);
	});

	it("keeps a single-word title on one line (positive)", () => {
		expect(splitDiscordAppLauncherPromoTitle("Wordle")).toEqual(["Wordle"]);
	});

	it("returns an empty list for blank titles (negative)", () => {
		expect(splitDiscordAppLauncherPromoTitle("")).toEqual([]);
		expect(splitDiscordAppLauncherPromoTitle("   ")).toEqual([]);
	});

	it("collapses extra whitespace between words (positive)", () => {
		expect(splitDiscordAppLauncherPromoTitle("  Watch   Together  ")).toEqual([
			"Watch",
			"Together",
		]);
	});
});
