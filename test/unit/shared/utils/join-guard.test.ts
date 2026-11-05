import {
	accountAgeDays,
	accountAgeSeconds,
	JoinGuardFailureCodes,
	parseJoinGuardRequestError,
	SecondsPerDay,
	timeoutHours,
	timeoutSeconds,
	validateJoinGuardRule,
	type JoinGuardRuleInput,
} from "#shared/utils/join-guard";
import { describe, expect, it } from "vitest";

function rule(overrides: Partial<JoinGuardRuleInput> = {}): JoinGuardRuleInput {
	return {
		name: "New accounts",
		enabled: true,
		accountAgeMax: 7 * SecondsPerDay,
		defaultAvatar: false,
		generatedName: false,
		nameContains: null,
		unverifiedBot: false,
		sendToCheckpoint: true,
		roleId: null,
		directMessage: false,
		alertChannelId: null,
		hardAction: null,
		...overrides,
	};
}

describe("validateJoinGuardRule", () => {
	it("accepts a rule with a name, a condition and an action", () => {
		expect(validateJoinGuardRule(rule())).toBeNull();
		expect(
			validateJoinGuardRule(
				rule({
					accountAgeMax: null,
					defaultAvatar: true,
					sendToCheckpoint: false,
					hardAction: "Ban",
				}),
			),
		).toBeNull();
	});

	it.each([
		["an empty name", { name: "   " }, "name"],
		["a name longer than 32", { name: "x".repeat(33) }, "name"],
		[
			"no condition",
			{
				accountAgeMax: null,
				defaultAvatar: false,
				generatedName: false,
				nameContains: null,
				unverifiedBot: false,
			},
			"conditions",
		],
		["an age under a day", { accountAgeMax: SecondsPerDay - 1 }, "accountAge"],
		["an age over 9999 days", { accountAgeMax: 10_000 * SecondsPerDay }, "accountAge"],
		["an age that is not whole", { accountAgeMax: 1.5 * SecondsPerDay + 0.5 }, "accountAge"],
		["an empty name text", { nameContains: " " }, "nameContains"],
		["a name text longer than 32", { nameContains: "y".repeat(33) }, "nameContains"],
		["no action", { sendToCheckpoint: false }, "actions"],
		["a kick that also sends to the checkpoint", { hardAction: "Kick" }, "hardActionConflict"],
		[
			"a ban that also gives a role",
			{ sendToCheckpoint: false, hardAction: "Ban", roleId: "123456789012345678" },
			"hardActionConflict",
		],
	] as const)("refuses %s", (_name, overrides, problem) => {
		expect(validateJoinGuardRule(rule(overrides))).toBe(problem);
	});

	it("names the first problem in the order the editor shows them", () => {
		expect(
			validateJoinGuardRule(
				rule({ name: "", accountAgeMax: 1, sendToCheckpoint: false, hardAction: null }),
			),
		).toBe("name");
		expect(validateJoinGuardRule(rule({ accountAgeMax: 1, sendToCheckpoint: false }))).toBe(
			"accountAge",
		);
	});

	it("refuses the checkpoint while it is off only when the editor says so", () => {
		expect(validateJoinGuardRule(rule(), { checkpointOn: false })).toBe("checkpointOff");
		expect(validateJoinGuardRule(rule(), { checkpointOn: true })).toBeNull();
		expect(validateJoinGuardRule(rule())).toBeNull();
		expect(
			validateJoinGuardRule(rule({ sendToCheckpoint: false, directMessage: true }), {
				checkpointOn: false,
			}),
		).toBeNull();
	});
});

describe("the conversions of the editor", () => {
	it("reads the seconds of an account age as days, and back", () => {
		expect(accountAgeDays(7 * SecondsPerDay)).toBe(7);
		expect(accountAgeSeconds(7)).toBe(604_800);
		expect(accountAgeDays(accountAgeSeconds(9999))).toBe(9999);
	});

	it("reads the seconds of the checkpoint timeout as hours, and back, 0 for never", () => {
		expect(timeoutHours(86_400)).toBe(24);
		expect(timeoutSeconds(168)).toBe(604_800);
		expect(timeoutHours(0)).toBe(0);
		expect(timeoutSeconds(0)).toBe(0);
	});
});

describe("parseJoinGuardRequestError", () => {
	it("reads the code and the detail the bot wrote", () => {
		expect(
			parseJoinGuardRequestError("NotWaiting: The member does not wait at the checkpoint."),
		).toStrictEqual({
			code: "NotWaiting",
			detail: "The member does not wait at the checkpoint.",
		});
		expect(
			parseJoinGuardRequestError("Refused: Missing Permissions: Kick Members"),
		).toStrictEqual({
			code: "Refused",
			detail: "Missing Permissions: Kick Members",
		});
	});

	it("reads a code it does not know as unknown, with the whole text", () => {
		expect(parseJoinGuardRequestError("Exploded: Boom")).toStrictEqual({
			code: "unknown",
			detail: "Exploded: Boom",
		});
		expect(parseJoinGuardRequestError("no separator")).toStrictEqual({
			code: "unknown",
			detail: "no separator",
		});
	});

	it("knows every failure code of the bot", () => {
		for (const code of JoinGuardFailureCodes) {
			expect(parseJoinGuardRequestError(`${code}: x`).code).toBe(code);
		}
	});
});
