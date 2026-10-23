import type { ReadonlyGuildData } from "#server/database/settings";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
	createConfigurationFile,
	TransferableSettings,
} from "#server/utils/settings-transfer/format";
import { parseConfigurationFile } from "#server/utils/settings-transfer/parse";
import {
	findOversizedRuleLists,
	getPlannedRules,
	getPlannedSettings,
	planConfigurationImport,
	summarizeConfigurationPlan,
} from "#server/utils/settings-transfer/plan";
import {
	getDefaultAutoModerationRule,
	type AutoModerationRule,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import { describe, expect, it } from "vitest";

const GUILD_ID = "123456789012345678";
const ROLE = "234567890123456789";

function settings(overrides: Record<string, unknown> = {}) {
	return {
		...getDefaultGuildSettings(),
		id: GUILD_ID,
		...overrides,
	} as unknown as ReadonlyGuildData;
}

let nextId = 1;
function rule(
	name: string,
	type: AutoModerationRuleType = "Newlines",
	overrides: Partial<AutoModerationRule> = {},
): AutoModerationRule {
	return {
		...getDefaultAutoModerationRule(type),
		...overrides,
		id: String(nextId++),
		guildId: GUILD_ID,
		name,
		type,
	} as AutoModerationRule;
}

function read(file: unknown, rules: readonly AutoModerationRule[] = []) {
	const result = parseConfigurationFile(JSON.stringify(file), rules);
	if (!result.ok) throw new Error(JSON.stringify(result.issues));
	return result.value;
}

function issuesOf(file: unknown, rules: readonly AutoModerationRule[] = []) {
	const result = parseConfigurationFile(
		typeof file === "string" ? file : JSON.stringify(file),
		rules,
	);
	return result.ok ? [] : result.issues;
}

describe("createConfigurationFile", () => {
	it("holds the settings that do not depend on the server, by the bot's names, and the rules without what is the server's", () => {
		const file = createConfigurationFile(
			settings({
				language: "it-IT",
				modulesAutomod: false,
				modulesLogs: false,
				rolesAdmin: [ROLE],
			}),
			[rule("Too many lines", "Newlines", { ignoredRoles: [ROLE] })],
			new Date("2026-10-18T10:00:00.000Z"),
		);

		expect(file.version).toBe(1);
		expect(file.exportedAt).toBe("2026-10-18T10:00:00.000Z");
		expect(file.settings.language).toBe("it-IT");
		expect(file.settings["modules.automod"]).toBe(false);
		expect(file.settings["modules.logs"]).toBe(false);
		expect(Object.keys(file.settings)).toHaveLength(TransferableSettings.length);
		// A role names something of the server, so it stays out:
		expect(JSON.stringify(file)).not.toContain(ROLE);
		expect(file.automod.rules[0]).not.toHaveProperty("id");
		expect(file.automod.rules[0]).not.toHaveProperty("ignoredRoles");
		expect(file.automod.rules[0]?.name).toBe("Too many lines");
	});
});

describe("parseConfigurationFile", () => {
	it("reads the file it wrote, as it is", () => {
		const rules = [rule("Too many lines")];
		const file = createConfigurationFile(settings({ commandsDisabled: ["ban"] }), rules);

		const parsed = read(file, rules);

		expect(parsed.unsupported).toStrictEqual([]);
		expect(
			parsed.settings.find(({ name }) => name === "commands.disabled")?.value,
		).toStrictEqual(["ban"]);
		expect(parsed.rules).toHaveLength(1);
	});

	it.each([
		["text that is not JSON", "{", ""],
		["something that is not an object", "[]", ""],
		["a file without a version", "{}", "version"],
		["a version it cannot read", '{"version":2}', "version"],
	])("refuses %s", (_label, text, path) => {
		expect(issuesOf(text)[0]?.path).toBe(path);
	});

	it("refuses a field it does not know, and a value of another type", () => {
		const issues = issuesOf({
			version: 1,
			extra: true,
			settings: { "modules.automod": "yes", "language": null },
		});

		expect(issues.map((issue) => issue.path)).toStrictEqual([
			"extra",
			"settings.modules.automod",
			"settings.language",
		]);
	});

	it("leaves out a setting this dashboard does not manage and says so, and ignores a removed one", () => {
		const parsed = read({
			version: 1,
			settings: { "music.volume": 50, "modules.commands": false, "language": "it-IT" },
		});

		expect(parsed.unsupported).toStrictEqual(["music.volume"]);
		expect(parsed.settings.map(({ name }) => name)).toStrictEqual(["language"]);
	});

	it("reads the settings the bot added, and checks their values", () => {
		const parsed = read({
			version: 1,
			settings: {
				"timezone": "Europe/Rome",
				"honeypot.action": "Ban",
				"logs.message-update-style": "Separate",
				"moderation.confirm-recent": 10,
				"appeals.questions": ["Why?", "Why?", " "],
			},
		});

		expect(parsed.unsupported).toStrictEqual([]);
		expect(
			Object.fromEntries(parsed.settings.map(({ key, value }) => [key, value])),
		).toStrictEqual({
			timezone: "Europe/Rome",
			honeypotAction: "Ban",
			logsMessageUpdateStyle: "Separate",
			moderationConfirmRecentMinutes: 10,
			// The bot drops the copies only, and trims when it opens a form:
			appealsQuestions: ["Why?", " "],
		});
		expect(
			issuesOf({
				version: 1,
				settings: {
					"timezone": "Mars/Olympus",
					"honeypot.action": "Mute",
					"moderation.confirm-recent": 61,
					"appeals.questions": "Why?",
				},
			}).map((issue) => issue.path),
		).toStrictEqual([
			"settings.timezone",
			"settings.honeypot.action",
			"settings.moderation.confirm-recent",
			"settings.appeals.questions",
		]);
	});

	it("imports the appeal questions it exports, however long, as the bot does", () => {
		const questions = ["x".repeat(1001), "1", "2", "3", "4", "5"];
		const parsed = read(createConfigurationFile(settings({ appealsQuestions: questions }), []));

		expect(parsed.settings.find(({ key }) => key === "appealsQuestions")?.value).toStrictEqual(
			questions,
		);
	});

	it("leaves the rules alone when the file has no automod section", () => {
		expect(read({ version: 1 }).rules).toBeNull();
	});

	it("refuses every rule that is wrong, with where", () => {
		const issues = issuesOf({
			version: 1,
			automod: {
				rules: [
					{ name: "123", type: "Newlines" },
					{ name: "Fine", type: "Nope" },
					{ name: "Many", type: "Newlines", options: { maximum: 5000 } },
					{ name: "Lines", type: "Newlines", options: { maximum: 5 } },
					{ name: "lines", type: "Newlines" },
					{ name: "Odd", type: "Newlines", id: "1" },
				],
			},
		});

		expect(issues.map((issue) => issue.path)).toStrictEqual([
			"automod.rules[0].name",
			"automod.rules[1].type",
			"automod.rules[2].options.maximum",
			"automod.rules[4]",
			"automod.rules[5].id",
		]);
	});

	it("gives a rule the default of what the file leaves out", () => {
		const parsed = read({
			version: 1,
			automod: { rules: [{ name: "Lines", type: "Newlines" }] },
		});

		expect(parsed.rules?.[0]).toMatchObject({
			enabled: getDefaultAutoModerationRule("Newlines").enabled,
			options: getDefaultAutoModerationRule("Newlines").options,
		});
	});
});

describe("planConfigurationImport", () => {
	it("writes only the settings whose value differs", () => {
		const parsed = read({
			version: 1,
			settings: { "language": "en-US", "modules.automod": false, "reports.notify": true },
		});

		const plan = planConfigurationImport(settings(), [], parsed);

		expect(plan.settings.map(({ name }) => name)).toStrictEqual(["modules.automod"]);
		expect(getPlannedSettings(plan)).toStrictEqual({ modulesAutomod: false });
		expect(plan.isEmpty).toBe(false);
	});

	it("is empty when the server already is as the file says", () => {
		const rules = [rule("Lines")];
		const parsed = read(createConfigurationFile(settings(), rules), rules);

		const plan = planConfigurationImport(settings(), rules, parsed);

		expect(plan.isEmpty).toBe(true);
		expect(plan.rules.unchanged).toBe(1);
	});

	it("leaves the rules alone without an automod section", () => {
		const plan = planConfigurationImport(
			settings(),
			[rule("Lines")],
			read({ version: 1, settings: { language: "it-IT" } }),
		);

		expect(plan.rules.remove).toHaveLength(0);
		expect(summarizeConfigurationPlan(plan, read({ version: 1 })).rules).toBeNull();
	});

	it("edits a rule of the same name in place, and removes the ones the file does not have", () => {
		const lines = rule("Lines", "Newlines", { ignoredRoles: [ROLE] });
		const old = rule("Old", "Words");
		const parsed = read({
			version: 1,
			automod: { rules: [{ name: "lines", type: "Newlines", enabled: false }] },
		});

		const plan = planConfigurationImport(settings(), [lines, old], parsed);
		const writes = getPlannedRules(plan);

		expect(writes.remove).toStrictEqual([old.id]);
		expect(writes.create).toHaveLength(0);
		expect(writes.update).toStrictEqual([
			{ id: lines.id, data: { name: "lines", enabled: false } },
		]);
		// It is edited with the fields that differ and nothing else, so its exempt roles stay:
		expect(Object.keys(writes.update[0]?.data ?? {})).not.toContain("ignoredRoles");
	});

	it("makes a rule of another type again, and creates one the server has not", () => {
		const parsed = read({
			version: 1,
			automod: {
				rules: [
					{ name: "Lines", type: "Characters" },
					{ name: "Fresh", type: "Zalgo" },
				],
			},
		});
		const lines = rule("Lines", "Newlines");

		const plan = planConfigurationImport(settings(), [lines], parsed);
		const writes = getPlannedRules(plan);

		expect(writes.remove).toStrictEqual([lines.id]);
		expect(writes.create.map(({ name }) => name)).toStrictEqual(["Lines", "Fresh"]);
		expect(summarizeConfigurationPlan(plan, parsed).rules).toMatchObject({
			created: ["Lines", "Fresh"],
			moved: [],
			removed: ["Lines"],
		});
	});

	it("makes the rules of a type again, with their exempt roles, to keep the order of the file", () => {
		const first = rule("First", "Newlines", { ignoredRoles: [ROLE] });
		const second = rule("Second", "Newlines");
		const parsed = read({
			version: 1,
			automod: {
				rules: [
					{ name: "Second", type: "Newlines" },
					{ name: "First", type: "Newlines" },
				],
			},
		});

		const plan = planConfigurationImport(settings(), [first, second], parsed);
		const writes = getPlannedRules(plan);

		// `Second` stays, since nothing is before it in the file; `First` is after it now, so it is made again:
		expect(writes.remove).toStrictEqual([first.id]);
		expect(writes.create).toHaveLength(1);
		expect(writes.create[0]).toMatchObject({ name: "First", ignoredRoles: [ROLE] });
		expect(summarizeConfigurationPlan(plan, parsed).rules).toMatchObject({
			created: [],
			moved: ["First"],
			removed: [],
		});
	});
});

describe("findOversizedRuleLists", () => {
	it("finds a list that is longer than the limit and than the one the rule has", () => {
		const words = Array.from({ length: 201 }, (_, index) => `word${index}`);
		const parsed = {
			settings: [],
			unsupported: [],
			rules: [
				{
					...getDefaultAutoModerationRule("Words"),
					name: "Words",
					options: { words },
				},
			],
		} as unknown as Parameters<typeof findOversizedRuleLists>[1];

		expect(findOversizedRuleLists([], parsed)).toStrictEqual([
			{ rule: "Words", option: "words" },
		]);
		expect(
			findOversizedRuleLists([rule("Words", "Words", { options: { words } })], parsed),
		).toStrictEqual([]);
	});
});
