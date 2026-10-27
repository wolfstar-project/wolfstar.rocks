import { readCommandRules } from "#shared/utils/command-rules";
import { describe, expect, it } from "vitest";

const C1 = "400000000000000001";
const R1 = "300000000000000001";
const R2 = "300000000000000002";

describe("readCommandRules", () => {
	it("reads nothing from a value that is not a list", () => {
		expect(readCommandRules(null)).toEqual([]);
		expect(readCommandRules({ command: "ban" })).toEqual([]);
	});

	it("merges two entries of a command and drops duplicates", () => {
		const rules = readCommandRules([
			{ command: "ban", allowedRoles: [R1] },
			{ command: "ban", allowedRoles: [R1, R2], ignoredUsers: [] },
		]);
		expect(rules).toEqual([
			{
				command: "ban",
				allowedChannels: [],
				ignoredChannels: [],
				allowedRoles: [R1, R2],
				ignoredRoles: [],
				allowedUsers: [],
				ignoredUsers: [],
			},
		]);
	});

	it("reads the older shape as channels each command ignores", () => {
		const rules = readCommandRules([{ channel: C1, commands: ["ban", "kick"] }]);
		expect(rules.map((rule) => [rule.command, rule.ignoredChannels])).toEqual([
			["ban", [C1]],
			["kick", [C1]],
		]);
	});

	it("drops ids that are not snowflakes and fields it does not know", () => {
		const [rule] = readCommandRules([
			{ command: "ban", allowedRoles: ["nope", R1], colour: "red" },
		]);
		expect(rule?.allowedRoles).toEqual([R1]);
		expect(rule).not.toHaveProperty("colour");
	});

	it("leaves out a command whose lists are all empty", () => {
		expect(readCommandRules([{ command: "ban", allowedRoles: ["nope"] }])).toEqual([]);
	});
});
