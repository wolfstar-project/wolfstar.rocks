import { Columns } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
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

	// Guards the fallback in `validatorFor`: a column added to `Columns`
	// without a validator must be refused, not written unchecked.
	it("has a validator for every stored key", () => {
		const defaults = getDefaultGuildSettings() as Record<string, unknown>;
		for (const key of Object.keys(Columns)) {
			const result = parseSettingsChanges([[key, defaults[key]]]);
			// `null` defaults reset rather than validate, which is also fine.
			expect(result.errors).toBeUndefined();
		}
	});
});
