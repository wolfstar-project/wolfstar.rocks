import { describe, expect, it } from "vitest";
import {
	DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT,
	DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX,
	resolveDiscordAppLauncherSheetSnap,
	shouldShowDiscordAppLauncherViewMore,
} from "~/utils/constants";

describe("resolveDiscordAppLauncherSheetSnap", () => {
	it("expands half → full when dragged up past the distance threshold (positive)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "half",
				deltaY: -DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX,
				velocityY: 0,
			}),
		).toBe("full");
	});

	it("stays half when the upward drag is too small (negative)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "half",
				deltaY: -(DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX - 1),
				velocityY: 0,
			}),
		).toBe("half");
	});

	it("expands half → full on a fast upward flick (positive)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "half",
				deltaY: -10,
				velocityY: -0.5,
			}),
		).toBe("full");
	});

	it("collapses full → half when dragged down past the threshold (positive)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "full",
				deltaY: DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX,
				velocityY: 0,
			}),
		).toBe("half");
	});

	it("never dismisses from full — only collapses to half (negative)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "full",
				deltaY: 400,
				velocityY: 2,
			}),
		).toBe("half");
	});

	it("stays full when the downward drag is too small (negative)", () => {
		expect(
			resolveDiscordAppLauncherSheetSnap({
				current: "full",
				deltaY: DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX - 1,
				velocityY: 0,
			}),
		).toBe("full");
	});
});

describe("shouldShowDiscordAppLauncherViewMore", () => {
	it("shows View More only when total exceeds the visible preview (positive)", () => {
		expect(
			shouldShowDiscordAppLauncherViewMore(5, DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT),
		).toBe(true);
	});

	it("hides View More when the preview already shows every entry (negative)", () => {
		expect(
			shouldShowDiscordAppLauncherViewMore(4, DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT),
		).toBe(false);
		expect(
			shouldShowDiscordAppLauncherViewMore(3, DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT),
		).toBe(false);
	});
});
