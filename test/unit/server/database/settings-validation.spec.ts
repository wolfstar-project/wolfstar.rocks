import { Columns } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
	BOT_ONLY_SETTINGS,
	MAXIMUM_SETTING_LIST_LENGTH,
	parseSettingsChanges,
} from "#server/database/settings/validation";
import { describe, expect, it } from "vitest";

const CHANNEL = "123456789012345678";
const ROLE = "234567890123456789";

describe("parseSettingsChanges", () => {
	it("accepts a value of each kind and returns it as the change", () => {
		const result = parseSettingsChanges([
			["language", "fr-FR"],
			["modulesAutomod", false],
			["logsMemberAdd", CHANNEL],
			["rolesAdmin", [ROLE]],
			["commandsDisabled", ["ban", "kick"]],
		]);

		expect(result.errors).toBeUndefined();
		expect(result.data).toStrictEqual({
			language: "fr-FR",
			modulesAutomod: false,
			logsMemberAdd: CHANNEL,
			rolesAdmin: [ROLE],
			commandsDisabled: ["ban", "kick"],
		});
	});

	it("refuses a key the schema does not have, including V6 names", () => {
		const result = parseSettingsChanges([
			["prefix", "!"],
			["channelsLogsMemberAdd", CHANNEL],
			["id", CHANNEL],
		]);

		expect(result.data).toBeUndefined();
		expect(result.errors).toHaveLength(3);
		expect(result.errors?.[0]).toMatch(/^prefix: /);
	});

	it("refuses a value that is not of its key's type", () => {
		const result = parseSettingsChanges([
			["modulesAutomod", "yes"],
			["logsMemberAdd", "not-a-snowflake"],
			["rolesAdmin", ROLE],
			["rolesModerator", [ROLE, "oops"]],
			["language", "<script>"],
		]);

		expect(result.errors).toHaveLength(5);
	});

	// A snowflake is converted with `BigInt()` at the storage boundary, which
	// throws on anything that is not a number.
	it("never lets a non-numeric id reach the BIGINT columns", () => {
		for (const value of ["1e5", "0x10", " 123456789012345678", "123"]) {
			expect(parseSettingsChanges([["moderationChannel", value]]).errors).toHaveLength(1);
		}
	});

	it("resets a key to its default on null", () => {
		const result = parseSettingsChanges([
			["moderationChannel", null],
			["rolesAdmin", null],
			["reportsNotify", null],
		]);

		expect(result.data).toStrictEqual({
			moderationChannel: null,
			rolesAdmin: [],
			reportsNotify: true,
		});
		// A reset must not hand out the shared default array.
		expect(result.data?.rolesAdmin).not.toBe(getDefaultGuildSettings().rolesAdmin);
	});

	it("drops duplicates from id lists", () => {
		const result = parseSettingsChanges([["logsIgnoreAll", [CHANNEL, CHANNEL]]]);
		expect(result.data).toStrictEqual({ logsIgnoreAll: [CHANNEL] });
	});

	it("caps list settings", () => {
		const tooMany = Array.from({ length: MAXIMUM_SETTING_LIST_LENGTH + 1 }, (_, index) =>
			String(100_000_000_000_000_000n + BigInt(index)),
		);
		expect(parseSettingsChanges([["rolesPublic", tooMany]]).errors).toHaveLength(1);
	});

	it("validates the shape of permission nodes and unique role sets", () => {
		const valid = parseSettingsChanges([
			["permissionsRoles", [{ id: ROLE, allow: ["ban"], deny: [] }]],
			["rolesUniqueRoleSets", [{ name: "Colors", roles: [ROLE] }]],
		]);
		expect(valid.errors).toBeUndefined();

		const invalid = parseSettingsChanges([
			["permissionsUsers", [{ id: "nope", allow: [], deny: [] }]],
			["rolesUniqueRoleSets", [{ name: "", roles: [ROLE] }]],
		]);
		expect(invalid.errors).toHaveLength(2);
	});

	it("keeps a dashboard access entry with its empty lists", () => {
		const entry = { id: ROLE, allow: [], deny: [], dashboard: "allow" };
		const parsed = parseSettingsChanges([["permissionsRoles", [entry]]]);
		expect(parsed.errors).toBeUndefined();
		expect(parsed.data?.permissionsRoles).toEqual([entry]);
	});

	it("refuses a dashboard access entry that is neither allow nor deny", () => {
		const parsed = parseSettingsChanges([
			["permissionsUsers", [{ id: ROLE, allow: [], deny: [], dashboard: "maybe" }]],
		]);
		expect(parsed.errors).toHaveLength(1);
	});

	it("refuses an entry that mixes a dashboard rule with commands", () => {
		const parsed = parseSettingsChanges([
			["permissionsRoles", [{ id: ROLE, allow: ["settings"], deny: [], dashboard: "allow" }]],
		]);
		expect(parsed.errors).toHaveLength(1);
		expect(parsed.errors?.[0]).toMatch(/dashboard/i);
	});

	// Guards the fallback in `validatorFor`: a column added to `Columns`
	// without a validator must be refused, not written unchecked.
	it("has a validator for every stored key", () => {
		const defaults = getDefaultGuildSettings() as Record<string, unknown>;
		for (const key of Object.keys(Columns)) {
			if (BOT_ONLY_SETTINGS.has(key)) continue;
			const result = parseSettingsChanges([[key, defaults[key]]]);
			// `null` defaults reset rather than validate, which is also fine.
			expect(result.errors).toBeUndefined();
		}
	});

	it("refuses the settings only the bot edits, a reset included", () => {
		expect([...BOT_ONLY_SETTINGS]).toContain("updatesChannel");
		for (const key of BOT_ONLY_SETTINGS) {
			for (const value of [[], null, CHANNEL]) {
				expect(parseSettingsChanges([[key, value]]).errors).toStrictEqual([
					`${key}: This setting cannot be changed from the dashboard.`,
				]);
			}
		}
	});

	it("reads a command response trimmed, and an empty one as the bot's own line", () => {
		expect(
			parseSettingsChanges([
				["messagesResponseBan", "  {user} was banned for {reason}.  "],
				["messagesResponseKick", "   "],
				["messagesResponseMute", null],
			]).data,
		).toStrictEqual({
			messagesResponseBan: "{user} was banned for {reason}.",
			messagesResponseKick: null,
			messagesResponseMute: null,
		});
	});

	it("refuses a command response longer than the bot takes", () => {
		const result = parseSettingsChanges([["messagesResponseUnban", "a".repeat(201)]]);
		expect(result.errors).toStrictEqual([
			"messagesResponseUnban: Expected a text of at most 200 characters.",
		]);
		expect(parseSettingsChanges([["messagesResponseUnban", 4]]).errors).toHaveLength(1);
	});

	it("takes at most 25 lockdown channels", () => {
		const channels = Array.from({ length: 26 }, (_, index) =>
			String(100_000_000_000_000_000n + BigInt(index)),
		);
		expect(
			parseSettingsChanges([["moderationLockdownChannels", channels.slice(0, 25)]]).data,
		).toStrictEqual({ moderationLockdownChannels: channels.slice(0, 25) });
		expect(
			parseSettingsChanges([["moderationLockdownChannels", channels]]).errors,
		).toStrictEqual(["moderationLockdownChannels: Expected at most 25 IDs."]);
		// The same channel twice is one channel:
		expect(
			parseSettingsChanges([["moderationLockdownChannels", [CHANNEL, CHANNEL]]]).data,
		).toStrictEqual({ moderationLockdownChannels: [CHANNEL] });
	});

	it("reads the appeal settings the forms came with", () => {
		expect(
			parseSettingsChanges([
				["appealsThread", "private"],
				["appealsCooldownDays", 365],
				["appealsMaxActive", 10],
				["appealsManagerRoles", [ROLE, ROLE]],
				["appealsAnonymous", true],
				["appealsBlockOnDenial", true],
			]).data,
		).toStrictEqual({
			appealsThread: "private",
			appealsCooldownDays: 365,
			appealsMaxActive: 10,
			appealsManagerRoles: [ROLE],
			appealsAnonymous: true,
			appealsBlockOnDenial: true,
		});
		expect(
			parseSettingsChanges([
				["appealsThread", "secret"],
				["appealsCooldownDays", 366],
				["appealsMaxActive", 0],
			]).errors,
		).toStrictEqual([
			"appealsThread: Expected one of none, public, private.",
			"appealsCooldownDays: Expected a whole number from 0 to 365.",
			"appealsMaxActive: Expected a whole number from 1 to 10.",
		]);
	});

	// The questions became the first form of the guild; the column stays
	// unread until the bot drops it.
	it("no longer knows the appeal questions", () => {
		expect(parseSettingsChanges([["appealsQuestions", ["Why?"]]]).errors).toHaveLength(1);
	});

	it("switches the new honeypot and warning threshold options", () => {
		expect(
			parseSettingsChanges([
				["moderationDefaultWarnThresholds", false],
				["honeypotForwardMessage", true],
				["honeypotTimeoutFirst", true],
				["honeypotRecentDelete", true],
				["honeypotChaosName", true],
				["honeypotEnsureDeletion", true],
			]).data,
		).toStrictEqual({
			moderationDefaultWarnThresholds: false,
			honeypotForwardMessage: true,
			honeypotTimeoutFirst: true,
			honeypotRecentDelete: true,
			honeypotChaosName: true,
			honeypotEnsureDeletion: true,
		});
		expect(parseSettingsChanges([["honeypotChaosName", "yes"]]).errors).toHaveLength(1);
	});
});

describe("the join guard settings", () => {
	it("are written from the dashboard as the bot takes them", () => {
		const result = parseSettingsChanges([
			["joinGuardEnabled", true],
			["joinGuardCheckpointTimeout", 0],
			["joinGuardMinimumTrust", 3],
			["joinGuardDirectMessageContent", "  Verify on the site, {server}.  "],
			["joinGuardPendingRole", ROLE],
			["joinGuardCheckpointChannel", CHANNEL],
			["joinGuardAllowedUsers", ["345678901234567890", "345678901234567890"]],
		]);

		expect(result.errors).toBeUndefined();
		expect(result.data).toStrictEqual({
			joinGuardEnabled: true,
			joinGuardCheckpointTimeout: 0,
			joinGuardMinimumTrust: 3,
			joinGuardDirectMessageContent: "Verify on the site, {server}.",
			joinGuardPendingRole: ROLE,
			joinGuardCheckpointChannel: CHANNEL,
			joinGuardAllowedUsers: ["345678901234567890"],
		});
	});

	it("take a checkpoint timeout of 0, or of one hour to a week", () => {
		for (const seconds of [0, 3600, 604_800]) {
			expect(
				parseSettingsChanges([["joinGuardCheckpointTimeout", seconds]]).errors,
			).toBeUndefined();
		}
		for (const seconds of [1, 3599, 604_801, 3600.5, "3600"]) {
			expect(
				parseSettingsChanges([["joinGuardCheckpointTimeout", seconds]]).errors,
			).toStrictEqual([
				"joinGuardCheckpointTimeout: Expected 0 or a whole number of seconds from 3600 to 604800.",
			]);
		}
	});

	it("take a minimum trust of 1 to 3, and a direct message of 500 characters at most", () => {
		expect(parseSettingsChanges([["joinGuardMinimumTrust", 0]]).errors).toHaveLength(1);
		expect(parseSettingsChanges([["joinGuardMinimumTrust", 4]]).errors).toHaveLength(1);
		expect(
			parseSettingsChanges([["joinGuardDirectMessageContent", "a".repeat(501)]]).errors,
		).toHaveLength(1);
	});

	it("leave the message of the checkpoint's button to the bot", () => {
		expect(BOT_ONLY_SETTINGS.has("joinGuardCheckpointMessage")).toBe(true);
		expect(
			parseSettingsChanges([["joinGuardCheckpointMessage", CHANNEL]]).errors,
		).toStrictEqual([
			"joinGuardCheckpointMessage: This setting cannot be changed from the dashboard.",
		]);
	});
});
