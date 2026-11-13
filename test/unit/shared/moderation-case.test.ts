import {
	discordMessageUrl,
	moderationCaseExpiresAt,
	parseModerationCaseExtra,
} from "#shared/utils/moderation-case";
import { describe, expect, it } from "vitest";

describe("parseModerationCaseExtra", () => {
	it("reads the roles a muted member had", () => {
		expect(
			parseModerationCaseExtra(["111111111111111111", "222222222222222222"]),
		).toStrictEqual({
			kind: "roles",
			roleIds: ["111111111111111111", "222222222222222222"],
		});
	});

	it("drops what is not a role id, and an empty list", () => {
		expect(parseModerationCaseExtra(["111111111111111111", 42, "nope"])).toStrictEqual({
			kind: "roles",
			roleIds: ["111111111111111111"],
		});
		expect(parseModerationCaseExtra([])).toBeNull();
	});

	it("reads the role a role case added or removed", () => {
		expect(parseModerationCaseExtra({ role: "333333333333333333" })).toStrictEqual({
			kind: "role",
			roleId: "333333333333333333",
		});
	});

	it("reads the nickname a member had, or that they had none", () => {
		expect(parseModerationCaseExtra({ oldName: "Old" })).toStrictEqual({
			kind: "nickname",
			previous: "Old",
		});
		expect(parseModerationCaseExtra({ oldName: null })).toStrictEqual({
			kind: "nickname",
			previous: null,
		});
	});

	it("reads anything else as nothing", () => {
		expect(parseModerationCaseExtra(null)).toBeNull();
		expect(parseModerationCaseExtra("text")).toBeNull();
		expect(parseModerationCaseExtra({ role: "not-a-snowflake" })).toBeNull();
		expect(parseModerationCaseExtra({ oldName: 3 })).toBeNull();
		expect(parseModerationCaseExtra({})).toBeNull();
	});
});

describe("discordMessageUrl", () => {
	it("links the message in its server and channel", () => {
		expect(discordMessageUrl("1", { channelId: "2", messageId: "3" })).toBe(
			"https://discord.com/channels/1/2/3",
		);
	});
});

describe("moderationCaseExpiresAt", () => {
	it("adds the duration, stored in seconds, to the creation", () => {
		expect(moderationCaseExpiresAt("2026-05-15T00:00:00.000Z", 3600)?.toISOString()).toBe(
			"2026-05-15T01:00:00.000Z",
		);
	});

	it("has no end for a case that is not temporary, or has no date", () => {
		expect(moderationCaseExpiresAt("2026-05-15T00:00:00.000Z", 0)).toBeNull();
		expect(moderationCaseExpiresAt(null, 60)).toBeNull();
		expect(moderationCaseExpiresAt("not a date", 60)).toBeNull();
	});
});
