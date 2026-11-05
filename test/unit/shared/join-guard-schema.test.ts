import {
	JoinGuardModeratorRequestBodySchema,
	JoinGuardQueueQuerySchema,
	JoinGuardRuleFieldsSchema,
	JoinGuardRuleInputSchema,
	JoinGuardRulePatchSchema,
	JoinGuardVerifyBodySchema,
} from "#shared/schemas/join-guard";
import { safeParse } from "valibot";
import { describe, expect, it } from "vitest";

const ROLE = "234567890123456789";

describe("JoinGuardRuleFieldsSchema", () => {
	it("fills what a body leaves out with the bot's defaults, and trims the texts", () => {
		const result = safeParse(JoinGuardRuleFieldsSchema, {
			name: "  Raid  ",
			defaultAvatar: true,
			nameContains: " free nitro ",
			roleId: ROLE,
		});

		expect(result.success).toBe(true);
		expect(result.output).toStrictEqual({
			name: "Raid",
			enabled: true,
			accountAgeMax: null,
			defaultAvatar: true,
			generatedName: false,
			nameContains: "free nitro",
			unverifiedBot: false,
			sendToCheckpoint: false,
			roleId: ROLE,
			directMessage: false,
			alertChannelId: null,
			hardAction: null,
		});
	});

	it.each([
		["no name", {}],
		["a role that is no Discord ID", { name: "a", roleId: "role" }],
		["a hard action the bot does not have", { name: "a", hardAction: "Mute" }],
		["an age that is text", { name: "a", accountAgeMax: "7" }],
	])("refuses %s", (_name, body) => {
		expect(safeParse(JoinGuardRuleFieldsSchema, body).success).toBe(false);
	});
});

describe("JoinGuardRuleInputSchema", () => {
	it("refuses a rule the bot could not run, with its problem as the message", () => {
		const result = safeParse(JoinGuardRuleInputSchema, { name: "Empty" });

		expect(result.success).toBe(false);
		expect(result.issues?.[0]?.message).toBe("conditions");
	});

	it("accepts a whole rule", () => {
		expect(
			safeParse(JoinGuardRuleInputSchema, {
				name: "Bots",
				unverifiedBot: true,
				hardAction: "Kick",
			}).success,
		).toBe(true);
	});
});

describe("JoinGuardRulePatchSchema", () => {
	it("takes only the fields that change", () => {
		const result = safeParse(JoinGuardRulePatchSchema, { enabled: false });
		expect(result.output).toStrictEqual({ enabled: false });
	});

	it("refuses a field of the wrong type", () => {
		expect(safeParse(JoinGuardRulePatchSchema, { enabled: "no" }).success).toBe(false);
	});
});

describe("JoinGuardQueueQuerySchema", () => {
	it("reads every status by default, and a cursor", () => {
		expect(safeParse(JoinGuardQueueQuerySchema, {}).output).toStrictEqual({ status: "all" });
		expect(
			safeParse(JoinGuardQueueQuerySchema, { status: "Waiting", cursor: "42" }).output,
		).toStrictEqual({
			status: "Waiting",
			cursor: "42",
		});
	});

	it.each([
		["a status the queue does not filter on", { status: "Left" }],
		["a cursor that is not a row ID", { cursor: "-1" }],
	])("refuses %s", (_name, query) => {
		expect(safeParse(JoinGuardQueueQuerySchema, query).success).toBe(false);
	});
});

describe("JoinGuardModeratorRequestBodySchema", () => {
	it("reads each kind with what it needs", () => {
		expect(safeParse(JoinGuardModeratorRequestBodySchema, { kind: "PostButton" }).success).toBe(
			true,
		);
		expect(
			safeParse(JoinGuardModeratorRequestBodySchema, { kind: "Verify", checkpointId: "5" })
				.output,
		).toStrictEqual({ kind: "Verify", checkpointId: "5" });
		expect(
			safeParse(JoinGuardModeratorRequestBodySchema, {
				kind: "Kick",
				checkpointId: "5",
				reason: "  raid  ",
			}).output,
		).toStrictEqual({ kind: "Kick", checkpointId: "5", reason: "raid" });
	});

	it.each([
		["a pass, which is the page's", { kind: "Pass" }],
		["a verify with no row", { kind: "Verify" }],
		["a reason longer than 500", { kind: "Kick", checkpointId: "5", reason: "x".repeat(501) }],
	])("refuses %s", (_name, body) => {
		expect(safeParse(JoinGuardModeratorRequestBodySchema, body).success).toBe(false);
	});
});

describe("JoinGuardVerifyBodySchema", () => {
	it("takes a Turnstile token or none", () => {
		expect(safeParse(JoinGuardVerifyBodySchema, {}).success).toBe(true);
		expect(safeParse(JoinGuardVerifyBodySchema, { turnstileToken: "token" }).success).toBe(
			true,
		);
		expect(
			safeParse(JoinGuardVerifyBodySchema, { turnstileToken: "x".repeat(2049) }).success,
		).toBe(false);
	});
});
