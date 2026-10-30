import {
	applyCommandRuleEdit,
	countCommandRuleEntries,
	findCommandRule,
	findMatchingCommandRules,
	getCommandRuleRevision,
	getCommandRuleSpecificity,
	isCommandGroupTarget,
	isCommandRuleOnlyAllowed,
	matchesCommandRuleTarget,
	readCommandRules,
	readCommandRuleState,
	resolveCommandRules,
	setCommandRule,
	withoutEveryone,
	writeCommandRule,
	writeCommandRules,
	type CommandRule,
} from "#shared/utils/command-rules";
import { describe, expect, it } from "vitest";

const C1 = "400000000000000001";
const R1 = "300000000000000001";
const R2 = "300000000000000002";
const C2 = "400000000000000002";
const U1 = "500000000000000001";
const GUILD = "100000000000000009";
const MARKER = { format: 2 };

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

const noEdit = {
	onlyAllowed: false,
	allowedChannels: [],
	ignoredChannels: [],
	allowedRoles: [],
	ignoredRoles: [],
};

describe("readCommandRules", () => {
	it("reads nothing from a value that is not a list", () => {
		expect(readCommandRules(null, GUILD)).toEqual([]);
		expect(readCommandRules({ command: "ban" }, GUILD)).toEqual([]);
	});

	it("merges two entries of a command and drops duplicates", () => {
		const rules = readCommandRules(
			[
				{ command: "ban", allowedRoles: [R1] },
				{ command: "ban", allowedRoles: [R1, R2], ignoredUsers: [] },
				MARKER,
			],
			GUILD,
		);
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
		const rules = readCommandRules([{ channel: C1, commands: ["ban", "kick"] }], GUILD);
		expect(rules.map((rule) => [rule.command, rule.ignoredChannels])).toEqual([
			["ban", [C1]],
			["kick", [C1]],
		]);
	});

	it("drops ids that are not snowflakes and fields it does not know", () => {
		const [rule] = readCommandRules(
			[{ command: "ban", allowedRoles: ["nope", R1], colour: "red" }],
			GUILD,
		);
		expect(rule?.allowedRoles).toEqual([R1]);
		expect(rule).not.toHaveProperty("colour");
	});

	it("leaves out a command whose lists are all empty", () => {
		expect(readCommandRules([{ command: "ban", allowedRoles: ["nope"] }], GUILD)).toEqual([]);
	});

	it("reads a target that names a group like any other", () => {
		const targets = readCommandRules(
			[
				{ command: "*", ignoredChannels: [C1] },
				{ command: "Moderation.*", ignoredChannels: [C1] },
				{ command: "Moderation.Management.*", ignoredChannels: [C1] },
				MARKER,
			],
			GUILD,
		).map((entry) => entry.command);

		expect(targets).toEqual(["*", "Moderation.*", "Moderation.Management.*"]);
	});
});

describe("the stored format", () => {
	const saved = [
		{ command: "warn", allowedRoles: [R1] },
		{ command: "kick", allowedUsers: [U1] },
		{ command: "ban", ignoredRoles: [R2] },
	];

	it("reads a list saved before it as allowed meaning only these", () => {
		expect(readCommandRules(saved, GUILD)).toEqual([
			rule("warn", { allowedRoles: [R1], ignoredRoles: [GUILD] }),
			rule("kick", { allowedUsers: [U1], ignoredRoles: [GUILD] }),
			rule("ban", { ignoredRoles: [R2] }),
		]);
	});

	it("reads a list with the marker as it is, and the marker is no rule", () => {
		expect(readCommandRules([...saved, MARKER], GUILD)).toEqual([
			rule("warn", { allowedRoles: [R1] }),
			rule("kick", { allowedUsers: [U1] }),
			rule("ban", { ignoredRoles: [R2] }),
		]);
	});

	it("does not take another format for the marker", () => {
		const [warn] = readCommandRules([...saved, { format: 3 }], GUILD);
		expect(warn?.ignoredRoles).toEqual([GUILD]);
	});

	it("writes the marker with the rules, so they read back as they are", () => {
		const rules = [rule("warn", { allowedRoles: [R1] })];
		const written = writeCommandRules(rules);

		expect(written.at(-1)).toEqual(MARKER);
		expect(readCommandRules(written, GUILD)).toEqual(rules);
	});
});

describe("isCommandRuleOnlyAllowed", () => {
	it("is the rule ignoring @everyone, which is no entry of it", () => {
		const onlyThese = rule("warn", { allowedRoles: [R1], ignoredRoles: [R2, GUILD] });

		expect(isCommandRuleOnlyAllowed(onlyThese, GUILD)).toBe(true);
		expect(isCommandRuleOnlyAllowed(rule("warn", { ignoredRoles: [R2] }), GUILD)).toBe(false);
		expect(withoutEveryone(onlyThese, GUILD).ignoredRoles).toEqual([R2]);
	});
});

describe("the targets of a rule", () => {
	const warn = { name: "warn", category: "Moderation", subCategory: null };
	const reasons = { name: "reasons", category: "Moderation", subCategory: "Management" };

	it("tells a group from a command", () => {
		expect(["*", "Moderation.*", "Moderation.Management.*"].map(isCommandGroupTarget)).toEqual([
			true,
			true,
			true,
		]);
		expect(["warn", "Moderation.warn"].map(isCommandGroupTarget)).toEqual([false, false]);
	});

	it("ranks a command over a sub-category over a category over every command", () => {
		expect(
			[
				"warn",
				"Moderation.warn",
				"Moderation.Management.warn",
				"Moderation.Management.*",
				"Moderation.*",
				"*",
			].map(getCommandRuleSpecificity),
		).toEqual([3, 3, 3, 2, 1, 0]);
	});

	it.each([
		["*", true],
		["Moderation.*", true],
		["Tools.*", false],
		["warn", true],
		["WARN", true],
		["ban", false],
		["Moderation.warn", true],
		["Tools.warn", false],
		["Moderation.Management.*", false],
		["Moderation.Management.warn", false],
		["Moderation.Management.warn.extra", false],
	])("matches %s against a command without a sub-category: %s", (target, expected) => {
		expect(matchesCommandRuleTarget(target, warn)).toBe(expected);
	});

	it.each([
		["Moderation.Management.*", true],
		["Moderation.Tools.*", false],
		["Tools.Management.*", false],
		["Moderation.Management.reasons", true],
	])("matches %s against a command with a sub-category: %s", (target, expected) => {
		expect(matchesCommandRuleTarget(target, reasons)).toBe(expected);
	});

	it("honours a command that was renamed, as the bot does", () => {
		const settings = { name: "settings", category: "Management", subCategory: null };
		expect(matchesCommandRuleTarget("conf", settings)).toBe(true);
	});

	it("lists the rules that match a command, the most specific first", () => {
		const rules = ["*", "warn", "Moderation.*", "Tools.*"].map((target) =>
			rule(target, { ignoredRoles: [R1] }),
		);

		expect(findMatchingCommandRules(rules, warn).map((entry) => entry.command)).toEqual([
			"warn",
			"Moderation.*",
			"*",
		]);
	});
});

describe("resolveCommandRules", () => {
	it("lets the most specific rule decide for a role", () => {
		// Newcomers ignored on the category but allowed on the command run it.
		const resolved = resolveCommandRules([
			rule("Moderation.*", { ignoredRoles: [R1, R2] }),
			rule("warn", { allowedRoles: [R1] }),
		]);

		expect(resolved).toEqual([
			rule("warn", { allowedRoles: [R1] }),
			rule("Moderation.*", { ignoredRoles: [R2] }),
		]);
	});

	it("lets the most specific rule decide for a member", () => {
		const resolved = resolveCommandRules([
			rule("*", { allowedUsers: [U1] }),
			rule("Moderation.*", { ignoredUsers: [U1] }),
		]);

		expect(resolved).toEqual([rule("Moderation.*", { ignoredUsers: [U1] })]);
	});

	it("keeps an ignored channel of any rule", () => {
		const resolved = resolveCommandRules([
			rule("warn", { ignoredChannels: [C1] }),
			rule("Moderation.*", { ignoredChannels: [C2] }),
		]);

		expect(resolved.flatMap((entry) => entry.ignoredChannels)).toEqual([C1, C2]);
	});

	it("keeps only the allowed channels of the most specific rule that has some", () => {
		const resolved = resolveCommandRules([
			rule("*", { allowedChannels: [C2] }),
			rule("Moderation.*", { allowedChannels: [C1] }),
			rule("warn", { ignoredRoles: [R1] }),
		]);

		expect(resolved).toEqual([
			rule("warn", { ignoredRoles: [R1] }),
			rule("Moderation.*", { allowedChannels: [C1] }),
		]);
	});

	it("takes ignored before allowed within a rule, as the bot does", () => {
		expect(
			resolveCommandRules([rule("warn", { allowedRoles: [R1], ignoredRoles: [R1] })]),
		).toEqual([rule("warn", { ignoredRoles: [R1] })]);
	});

	it("keeps @everyone of a broader rule until a more specific one lists it", () => {
		const resolved = resolveCommandRules([
			rule("Moderation.*", { ignoredRoles: [GUILD] }),
			rule("warn", { allowedRoles: [R1] }),
		]);

		expect(resolved.map((entry) => entry.command)).toEqual(["warn", "Moderation.*"]);
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
		const next = applyCommandRuleEdit(stored, { ...noEdit, ignoredChannels: [C1, C1] }, GUILD);
		expect(next).toEqual(
			rule("ban", { ignoredChannels: [C1], allowedUsers: [U1], ignoredUsers: [U1] }),
		);
	});

	it("stores the status as @everyone, whatever the picked roles hold", () => {
		const stored = rule("ban");
		const picked = { ...noEdit, ignoredRoles: [R1, GUILD] };

		expect(
			applyCommandRuleEdit(stored, { ...picked, onlyAllowed: true }, GUILD).ignoredRoles,
		).toEqual([R1, GUILD]);
		expect(applyCommandRuleEdit(stored, picked, GUILD).ignoredRoles).toEqual([R1]);
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
				commandsRestrictions: [{ command: "ban", allowedRoles: [R1] }, MARKER],
			},
			"ban",
			GUILD,
		);
		expect(state).toEqual({
			command: "ban",
			enabled: false,
			onlyAllowed: false,
			rule: rule("ban", { allowedRoles: [R1] }),
			revision: getCommandRuleRevision(rule("ban", { allowedRoles: [R1] }), true),
		});
	});

	it("gives @everyone as the status, with the revision of what is stored", () => {
		const state = readCommandRuleState(
			{
				commandsDisabled: [],
				commandsRestrictions: [{ command: "ban", allowedRoles: [R1] }],
			},
			"ban",
			GUILD,
		);
		expect(state).toMatchObject({
			onlyAllowed: true,
			rule: rule("ban", { allowedRoles: [R1] }),
			revision: getCommandRuleRevision(
				rule("ban", { allowedRoles: [R1], ignoredRoles: [GUILD] }),
				false,
			),
		});
	});
});

describe("writeCommandRule", () => {
	it("disables a command once, and enables it again", () => {
		const settings = { commandsDisabled: ["kick"], commandsRestrictions: [] };
		const disabled = writeCommandRule(settings, "ban", { ...noEdit, enabled: false }, GUILD);
		expect(disabled.commandsDisabled).toEqual(["kick", "ban"]);
		expect(
			writeCommandRule(disabled, "ban", { ...noEdit, enabled: false }, GUILD)
				.commandsDisabled,
		).toEqual(["kick", "ban"]);
		expect(
			writeCommandRule(disabled, "ban", { ...noEdit, enabled: true }, GUILD).commandsDisabled,
		).toEqual(["kick"]);
	});

	it("keeps the members and the rules of other commands", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [
				{ command: "ban", allowedRoles: [R1], allowedUsers: [U1] },
				{ command: "kick", ignoredChannels: [C2] },
				MARKER,
			],
		};
		const { commandsRestrictions } = writeCommandRule(
			settings,
			"ban",
			{ ...noEdit, enabled: true, allowedChannels: [C1] },
			GUILD,
		);
		expect(commandsRestrictions).toEqual([
			rule("kick", { ignoredChannels: [C2] }),
			rule("ban", { allowedChannels: [C1], allowedUsers: [U1] }),
			MARKER,
		]);
	});

	it("keeps the rules of a group, which the dashboard does not edit", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [{ command: "Moderation.*", ignoredRoles: [R1] }, MARKER],
		};
		const { commandsRestrictions } = writeCommandRule(
			settings,
			"ban",
			{ ...noEdit, enabled: true, ignoredRoles: [R2] },
			GUILD,
		);
		expect(commandsRestrictions).toEqual([
			rule("Moderation.*", { ignoredRoles: [R1] }),
			rule("ban", { ignoredRoles: [R2] }),
			MARKER,
		]);
	});

	it("writes a list of the old format with the marker, keeping what it meant", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [{ command: "kick", allowedRoles: [R1] }],
		};
		const { commandsRestrictions } = writeCommandRule(
			settings,
			"ban",
			{ ...noEdit, enabled: true, ignoredChannels: [C1] },
			GUILD,
		);
		expect(commandsRestrictions).toEqual([
			rule("kick", { allowedRoles: [R1], ignoredRoles: [GUILD] }),
			rule("ban", { ignoredChannels: [C1] }),
			MARKER,
		]);
		expect(readCommandRules(commandsRestrictions, GUILD)[0]?.ignoredRoles).toEqual([GUILD]);
	});

	it("writes the older shape back as the channels each command ignores", () => {
		const settings = {
			commandsDisabled: [],
			commandsRestrictions: [{ channel: C1, commands: ["ban", "kick"] }],
		};
		const { commandsRestrictions } = writeCommandRule(
			settings,
			"ban",
			{ ...noEdit, enabled: true, ignoredChannels: [C1, C2] },
			GUILD,
		);
		expect(commandsRestrictions).toEqual([
			rule("kick", { ignoredChannels: [C1] }),
			rule("ban", { ignoredChannels: [C1, C2] }),
			MARKER,
		]);
	});
});

describe("countCommandRuleEntries", () => {
	it("counts the entries of every list, members included", () => {
		expect(
			countCommandRuleEntries(
				[
					rule("ban", { allowedChannels: [C1], ignoredRoles: [R1, R2] }),
					rule("Moderation.*", { allowedUsers: [U1] }),
				],
				GUILD,
			),
		).toBe(4);
	});

	it("does not take @everyone for an entry, but a rule of only that still counts", () => {
		expect(
			countCommandRuleEntries(
				[rule("ban", { allowedRoles: [R1], ignoredRoles: [GUILD] })],
				GUILD,
			),
		).toBe(1);
		expect(countCommandRuleEntries([rule("ban", { ignoredRoles: [GUILD] })], GUILD)).toBe(1);
	});
});
