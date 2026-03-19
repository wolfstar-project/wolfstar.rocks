import type { RouteLocationNormalizedGeneric } from "vue-router";
import { describe, expect, it } from "vitest";
import { isSameGuildManageArea } from "~/composables/useUnsavedChanges";

function makeRoute(path: string) {
	return { path } as RouteLocationNormalizedGeneric;
}

describe("isSameGuildManageArea()", () => {
	it("should allow navigation within the same guild manage area", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/channels"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBeTruthy();
	});

	it("should allow navigation between different settings tabs", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/moderation"),
				makeRoute("/guilds/123456789012345678/manage/channels"),
			),
		).toBeTruthy();
	});

	it("should block navigation when switching guilds", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/987654321098765432/manage"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBeFalsy();
	});

	it("should block navigation when leaving guild manage area", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBeFalsy();
	});

	it("should block navigation to completely different page", () => {
		expect(
			isSameGuildManageArea(makeRoute("/"), makeRoute("/guilds/123456789012345678/manage")),
		).toBeFalsy();
	});

	it("should block navigation from manage to guild list", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBeFalsy();
	});

	it("should allow navigation from manage to a filter sub-path", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/filter/links"),
				makeRoute("/guilds/123456789012345678/manage"),
			),
		).toBeTruthy();
	});

	it("should allow navigation between filter sub-paths of the same guild", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/filter/words"),
				makeRoute("/guilds/123456789012345678/manage/filter/capitals"),
			),
		).toBeTruthy();
	});

	it("should allow navigation from a filter sub-path to a top-level section", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/123456789012345678/manage/channels"),
				makeRoute("/guilds/123456789012345678/manage/filter/invites"),
			),
		).toBeTruthy();
	});

	it("should block navigation between filter sub-paths of different guilds", () => {
		expect(
			isSameGuildManageArea(
				makeRoute("/guilds/987654321098765432/manage/filter/links"),
				makeRoute("/guilds/123456789012345678/manage/filter/links"),
			),
		).toBeFalsy();
	});
});
