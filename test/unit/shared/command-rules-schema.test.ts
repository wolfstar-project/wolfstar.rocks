import { CommandRuleNameSchema, CommandRulePutSchema } from "#shared/schemas/command-rules";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

const C1 = "400000000000000001";

const body = {
	revision: 1_262_773_392,
	enabled: true,
	onlyAllowed: false,
	allowedChannels: [C1],
	ignoredChannels: [],
	allowedRoles: [],
	ignoredRoles: [],
	allowedUsers: [],
	ignoredUsers: [],
};

describe("CommandRulePutSchema", () => {
	it("accepts a save", () => {
		expect(safeParse(CommandRulePutSchema, body).success).toBe(true);
	});

	it("refuses an id that is not a snowflake", () => {
		expect(safeParse(CommandRulePutSchema, { ...body, allowedRoles: ["role"] }).success).toBe(
			false,
		);
	});

	it("refuses a revision past 32 bits or a missing list", () => {
		expect(safeParse(CommandRulePutSchema, { ...body, revision: 2 ** 32 }).success).toBe(false);
		const { ignoredRoles: _, ...missing } = body;
		expect(safeParse(CommandRulePutSchema, missing).success).toBe(false);
		const { ignoredUsers: __, ...noMembers } = body;
		expect(safeParse(CommandRulePutSchema, noMembers).success).toBe(false);
	});

	it("takes the members, by snowflake", () => {
		expect(
			safeParse(CommandRulePutSchema, { ...body, allowedUsers: ["500000000000000001"] })
				.success,
		).toBe(true);
		expect(safeParse(CommandRulePutSchema, { ...body, ignoredUsers: ["stella"] }).success).toBe(
			false,
		);
	});
});

describe("CommandRuleNameSchema", () => {
	it("takes the bot's piece names", () => {
		expect(safeParse(CommandRuleNameSchema, "warnThresholds").success).toBe(true);
		expect(safeParse(CommandRuleNameSchema, "ban add").success).toBe(false);
		expect(safeParse(CommandRuleNameSchema, "").success).toBe(false);
	});

	it("takes every command, but not a category, which only /commands sets", () => {
		expect(safeParse(CommandRuleNameSchema, "*").success).toBe(true);
		expect(safeParse(CommandRuleNameSchema, "Moderation.*").success).toBe(false);
		expect(safeParse(CommandRuleNameSchema, "**").success).toBe(false);
	});
});
