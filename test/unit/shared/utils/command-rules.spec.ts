import {
	applyCommandRuleEdit,
	countCommandRuleEntries,
	countEditableCommandRuleEntries,
	findCommandRule,
	getCommandRuleRevision,
	readCommandRules,
	readCommandRuleState,
	setCommandRule,
	writeCommandRule,
	type CommandRule,
} from "#shared/utils/command-rules";
import { describe, expect, it } from "vitest";

const C1 = "400000000000000001";
const R1 = "300000000000000001";
const R2 = "300000000000000002";
const C2 = "400000000000000002";
const U1 = "500000000000000001";

function rule(command: string, lists: Partial<Omit<CommandRule, "command">> = {}): CommandRule {
	return {
		command,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
		...lists,
	};
}

const noEdit = { allowedChannels: [], ignoredChannels: [], allowedRoles: [], ignoredRoles: [] };

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

describe("findCommandRule", () => {
	it("finds the rule of a command, or an empty one", () => {
		const rules = [rule("ban", { allowedRoles: [R1] })];
		expect(findCommandRule(rules, "ban").allowedRoles).toEqual([R1]);
		expect(findCommandRule(rules, "kick")).toEqual(rule("kick"));
	});
});

describe("setCommandRule", () => {
	it("puts the rule set last, as the bot does", () => {
		const rules = [rule("ban", { allowedRoles: [R1] }), rule("kick", { ignoredRoles: [R2] })];
		expect(
			setCommandRule(rules, rule("ban", { allowedRoles: [R2] })).map(
				(entry) => entry.command,
			),
		).toEqual(["kick", "ban"]);
	});

	it("drops the rule of a command when it rules nothing", () => {
		const rules = [rule("ban", { allowedRoles: [R1] })];
		expect(setCommandRule(rules, rule("ban"))).toEqual([]);
	});
});

describe("applyCommandRuleEdit", () => {
	it("keeps the member lists the dashboard does not edit", () => {
		const stored = rule("ban", { allowedRoles: [R1], allowedUsers: [U1], ignoredUsers: [U1] });
		const next = applyCommandRuleEdit(stored, { ...noEdit, ignoredChannels: [C1, C1] });
		expect(next).toEqual(
			rule("ban", { ignoredChannels: [C1], allowedUsers: [U1], ignoredUsers: [U1] }),
		);
	});
});

describe("getCommandRuleRevision", () => {
	// Computed with the bot's `getCommandRestrictionRevision`, so a revision
	// means the same on both sides.
	it("matches the bot's revision", () => {
		expect(getCommandRuleRevision(rule("ban"), false)).toBe(1_262_773_392);
		expect(getCommandRuleRevision(rule("ban"), true)).toBe(779_148_257);
		expect(getCommandRuleRevision(rule("ban", { allowedRoles: [R1] }), false)).toBe(
			2_463_052_568,
		);
	});

	it("changes with the status and with any list, members included", () => {
		const base = getCommandRuleRevision(rule("ban"), false);
		expect(getCommandRuleRevision(rule("ban", { ignoredUsers: [U1] }), false)).not.toBe(base);
		expect(getCommandRuleRevision(rule("kick"), false)).toBe(base);
	});
});

describe("readCommandRuleState", () => {
	it("reads the status, the rule and its revision", () => {
		const state = readCommandRuleState(
			{
				commandsDisabled: ["ban"],
				commandsRestrictions: [{ command: "ban", allowedRoles: [R1] }],
			},
			"ban",
		);
		expect(state).toEqual({
			command: "ban",
			enabled: false,
			rule: rule("ban", { allowedRoles: [R1] }),
			revision: getCommandRuleRevision(rule("ban", { allowedRoles: [R1] }), true),
		});
	});
});

describe("writeCommandRule", () => {
	it("disables a command once, and enables it again", () => {
		const settings = { commandsDisabled: ["kick"], commandsRestrictions: [] };
		const disabled = writeCommandRule(settings, "ban", { ...noEdit, enabled: false });
		expect(disabled.commandsDisabled).toEqual(["kick", "ban"]);
		expect(
			writeCommandRule(disabled, "ban", { ...noEdit, enabled: false }).commandsDisabled,
		).toEqual(["kick", "ban"]);
		expect(
			writeCommandRule(disabled, "ban", { ...noEdit, enabled: true }).commandsDisabled,
		).toEqual(["kick"]);
	});

	it("keeps the members and the rules of other commands", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [
				{ command: "ban", allowedRoles: [R1], allowedUsers: [U1] },
				{ command: "kick", ignoredChannels: [C2] },
			],
		};
		const { commandsRestrictions } = writeCommandRule(settings, "ban", {
			...noEdit,
			enabled: true,
			allowedChannels: [C1],
		});
		expect(commandsRestrictions).toEqual([
			rule("kick", { ignoredChannels: [C2] }),
			rule("ban", { allowedChannels: [C1], allowedUsers: [U1] }),
		]);
	});

	it("writes the older shape back as the channels each command ignores", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [{ channel: C1, commands: ["ban", "kick"] }],
		};
		const { commandsRestrictions } = writeCommandRule(settings, "ban", {
			...noEdit,
			enabled: true,
			ignoredChannels: [C1, C2],
		});
		expect(commandsRestrictions).toEqual([
			rule("kick", { ignoredChannels: [C1] }),
			rule("ban", { ignoredChannels: [C1, C2] }),
		]);
	});
});

describe("countCommandRuleEntries", () => {
	it("counts the entries of every list, members included", () => {
		const [rule] = readCommandRules([
			{
				command: "ban",
				allowedChannels: ["100000000000000001"],
				ignoredRoles: ["100000000000000002", "100000000000000003"],
				allowedUsers: ["100000000000000004"],
			},
		]);
		expect(countCommandRuleEntries(rule!)).toBe(4);
	});
});

describe("countEditableCommandRuleEntries", () => {
	it("counts the entries of the four edited lists only", () => {
		expect(
			countEditableCommandRuleEntries(
				rule("ban", { allowedChannels: [C1], ignoredRoles: [R1, R2], allowedUsers: [U1] }),
			),
		).toBe(3);
	});
});
