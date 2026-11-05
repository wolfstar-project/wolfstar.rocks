import type { ReadonlyGuildData } from "#server/database/settings";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
	createConfigurationFile,
	TransferableSettings,
} from "#server/utils/settings-transfer/format";
import {
	parseConfigurationFile,
	type ParsedConfiguration,
} from "#server/utils/settings-transfer/parse";
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
import legacyFile from "~~/test/fixtures/settings-transfer/legacy-v1.json";

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

		expect(file.version).toBe(2);
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
		["a version it cannot read", '{"version":3}', "version"],
	])("refuses %s", (_label, text, path) => {
		expect(issuesOf(text)[0]?.path).toBe(path);
	});

	it("reads the versions 1 and 2, and says so of another", () => {
		expect(read({ version: 1 }).settings).toStrictEqual([]);
		expect(read({ version: 2 }).settings).toStrictEqual([]);
		expect(issuesOf({ version: 3 })).toStrictEqual([
			{ path: "version", message: "Version 3 is not supported: expected 1 or 2." },
		]);
	});

	it("refuses a field it does not know, and a value of another type", () => {
		const issues = issuesOf({
			version: 2,
			extra: true,
			settings: { "modules.automod": "yes", "language": null },
		});

		expect(issues.map((issue) => issue.path)).toStrictEqual([
			"extra",
			"settings.modules.automod",
			"settings.language",
		]);
	});

	it("leaves out a setting of the bot this dashboard does not manage and says so, and ignores a removed one", () => {
		const parsed = read({
			version: 2,
			settings: {
				"join-guard.enabled": true,
				"modules.commands": false,
				"appeals.questions": ["Why?"],
				"language": "it-IT",
			},
		});

		expect(parsed.unsupported).toStrictEqual(["join-guard.enabled"]);
		expect(parsed.settings.map(({ name }) => name)).toStrictEqual(["language"]);
	});

	it("refuses a setting the bot does not have, or one that depends on the server", () => {
		const issues = issuesOf({
			version: 2,
			settings: { "music.volume": 50, "roles.admin": [ROLE] },
		});

		expect(issues.map((issue) => issue.path)).toStrictEqual([
			"settings.music.volume",
			"settings.roles.admin",
		]);
	});

	it("reads the settings of the direct messages of the moderation commands", () => {
		const parsed = read({
			version: 2,
			settings: { "moderation.direct-message": false, "moderation.display-moderator": false },
		});

		expect(getPlannedSettings(planConfigurationImport(settings(), [], parsed))).toStrictEqual({
			messagesModerationDm: false,
			messagesModeratorNameDisplay: false,
		});
	});

	it("reads the settings the bot added, and checks their values", () => {
		const parsed = read({
			version: 2,
			settings: {
				"timezone": "Europe/Rome",
				"honeypot.action": "Ban",
				"logs.message-update-style": "Separate",
				"moderation.confirm-recent": 10,
				"appeals.thread": "private",
				"appeals.cooldown-days": 30,
				"appeals.max-active": 3,
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
			appealsThread: "private",
			appealsCooldownDays: 30,
			appealsMaxActive: 3,
		});
		expect(
			issuesOf({
				version: 2,
				settings: {
					"timezone": "Mars/Olympus",
					"honeypot.action": "Mute",
					"moderation.confirm-recent": 61,
					"appeals.thread": "secret",
					"appeals.cooldown-days": 366,
					"appeals.max-active": 0,
				},
			}).map((issue) => issue.path),
		).toStrictEqual([
			"settings.timezone",
			"settings.honeypot.action",
			"settings.moderation.confirm-recent",
			"settings.appeals.thread",
			"settings.appeals.cooldown-days",
			"settings.appeals.max-active",
		]);
	});

	it("leaves the rules alone when the file has no automod section", () => {
		expect(read({ version: 2 }).rules).toBeNull();
	});

	it("refuses every rule that is wrong, with where", () => {
		const issues = issuesOf({
			version: 2,
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
			version: 2,
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
			version: 2,
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
			read({ version: 2, settings: { language: "it-IT" } }),
		);

		expect(plan.rules.remove).toHaveLength(0);
		expect(summarizeConfigurationPlan(plan, read({ version: 2 })).rules).toBeNull();
	});

	it("edits a rule of the same name in place, and removes the ones the file does not have", () => {
		const lines = rule("Lines", "Newlines", { ignoredRoles: [ROLE] });
		const old = rule("Old", "Words");
		const parsed = read({
			version: 2,
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
			version: 2,
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
			version: 2,
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
			addedRules: [],
			notices: [],
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

describe("a file of the bot before V7", () => {
	/** The file the export of the bot before V7 writes for a server that changed nothing, with the given settings. */
	const legacy = (overrides: Record<string, unknown> = {}) => ({
		...legacyFile,
		settings: { ...legacyFile.settings, ...overrides },
	});
	const valueOf = (parsed: ParsedConfiguration, name: string) =>
		parsed.settings.find((setting) => setting.name === name)?.value;
	const changesOf = (parsed: ParsedConfiguration, rules: readonly AutoModerationRule[] = []) =>
		summarizeConfigurationPlan(planConfigurationImport(settings(), rules, parsed), parsed);

	it("reads the file of a server that changed nothing with nothing to tell", () => {
		const parsed = read(legacy());

		expect(parsed.notices).toStrictEqual([]);
		expect(parsed.rules).toBeNull();
		expect(parsed.addedRules).toStrictEqual([]);
		// The bot before V7 sent no direct message by default, which V7 does: the server keeps what it had.
		const preview = changesOf(parsed);
		expect(preview.settings).toStrictEqual([
			{ name: "moderation.direct-message", before: true, after: false },
		]);
		expect(preview.rules).toBeNull();
	});

	it("gives the settings that were renamed their name in V7", () => {
		const parsed = read(
			legacy({
				"messages.moderation-dm": true,
				"messages.moderator-name-display": false,
				"events.ban-add": false,
				"events.ban-remove": true,
				"events.timeout": true,
				"events.twemoji-reactions": true,
				"disabled-commands": ["ping"],
				"language": "it-IT",
			}),
		);

		expect(parsed.notices).toStrictEqual([]);
		expect(valueOf(parsed, "moderation.direct-message")).toBe(true);
		expect(valueOf(parsed, "moderation.display-moderator")).toBe(false);
		expect(valueOf(parsed, "moderation.track-bans")).toBe(true);
		expect(valueOf(parsed, "moderation.track-timeouts")).toBe(true);
		expect(valueOf(parsed, "logs.reaction-emoji-include-twemoji")).toBe(true);
		expect(valueOf(parsed, "commands.disabled")).toStrictEqual(["ping"]);
		expect(valueOf(parsed, "language")).toBe("it-IT");
	});

	it("imports the rest of a value that cannot be converted, and says which setting to set by hand", () => {
		const tooLong = "a-command-name-that-is-far-too-long";
		const parsed = read(
			legacy({
				"messages.moderation-dm": "yes",
				"disabled-commands": ["ping", tooLong],
				"events.timeout": true,
			}),
		);

		expect(valueOf(parsed, "moderation.track-timeouts")).toBe(true);
		expect(valueOf(parsed, "moderation.direct-message")).toBeUndefined();
		expect(valueOf(parsed, "commands.disabled")).toStrictEqual(["ping"]);
		expect(parsed.notices).toMatchObject([
			{
				kind: "settingFailed",
				path: "settings.disabled-commands",
				name: tooLong,
				target: "commands.disabled",
			},
			{
				kind: "settingFailed",
				path: "settings.messages.moderation-dm",
				name: "messages.moderation-dm",
				target: "moderation.direct-message",
				reason: "Expected a boolean.",
			},
		]);
	});

	it("tells a setting V7 has nothing for only when it was changed, and the reaction filter once", () => {
		const parsed = read(
			legacy({
				"prefix": "!",
				"events.include-bots": false,
				"selfmod.reactions.enabled": true,
				"selfmod.reactions.maximum": 3,
			}),
		);

		expect(parsed.notices).toStrictEqual([
			{ kind: "noEquivalent", path: "settings.prefix", name: "prefix" },
			{
				kind: "reactionFilter",
				path: "settings.selfmod.reactions.enabled",
				name: "selfmod.reactions.enabled",
			},
		]);
	});

	it("adds the filters that were changed to the rules of the server, and leaves the others alone", () => {
		const rules = [rule("Mine", "Words")];
		const parsed = read(
			legacy({
				"selfmod.links.enabled": true,
				"selfmod.links.allowed": ["wolfstar.rocks"],
				"selfmod.links.hard-action": 6,
				"selfmod.links.hard-action-duration": 60_000,
				"no-mention-spam.enabled": true,
			}),
			rules,
		);

		expect(parsed.notices).toStrictEqual([]);
		expect(parsed.rules).toBeNull();
		expect(parsed.addedRules).toMatchObject([
			{
				name: "Links",
				type: "Links",
				enabled: true,
				hardAction: "Timeout",
				hardActionDuration: 60_000,
				options: { allowed: ["wolfstar.rocks"] },
			},
			{ name: "Mention spam", type: "MentionsCooldown", enabled: true, hardAction: "Ban" },
		]);
		expect(changesOf(parsed, rules).rules).toStrictEqual({
			mode: "add",
			created: ["Links", "Mention spam"],
			updated: [],
			moved: [],
			removed: [],
			unchanged: 1,
		});
	});

	it("edits the rule of a filter the server already has instead of making it twice", () => {
		const links = rule("Links", "Links", { enabled: false });
		const parsed = read(legacy({ "selfmod.links.enabled": true }), [links]);

		const writes = getPlannedRules(planConfigurationImport(settings(), [links], parsed));

		expect(writes.create).toStrictEqual([]);
		expect(writes.remove).toStrictEqual([]);
		expect(writes.update).toMatchObject([{ id: links.id, data: { enabled: true } }]);
	});

	it("still makes the rule of a filter when another filter cannot become one", () => {
		const parsed = read(
			legacy({
				"selfmod.invites.enabled": true,
				"selfmod.invites.ignored-guilds": ["not a server"],
				"selfmod.links.enabled": true,
				"events.timeout": true,
			}),
		);

		expect(valueOf(parsed, "moderation.track-timeouts")).toBe(true);
		expect(parsed.notices).toMatchObject([
			{
				kind: "ruleFailed",
				path: "settings.selfmod.invites.ignored-guilds",
				rule: "Invites",
			},
		]);
		expect(parsed.addedRules).toMatchObject([{ name: "Links", type: "Links", enabled: true }]);
	});

	it("keeps a rule the server gained after the file was read", () => {
		const mine = rule("Mine", "Words");
		const parsed = read(legacy({ "selfmod.links.enabled": true }), [mine]);

		const now = [mine, rule("Added since", "Words")];

		expect(changesOf(parsed, now).rules).toMatchObject({
			created: ["Links"],
			removed: [],
			unchanged: 2,
		});
	});

	it("makes no rule out of a filter the file does not have, not even a Mention spam that is off", () => {
		const mentions = rule("Mention spam", "MentionsCooldown");

		const fewSettings = read({ version: 1, settings: { "messages.moderation-dm": true } }, [
			mentions,
		]);
		expect(fewSettings.addedRules).toStrictEqual([]);
		expect(changesOf(fewSettings, [mentions]).rules).toBeNull();

		const oneFilter = read(
			{
				version: 1,
				settings: { "messages.moderation-dm": true, "selfmod.links.enabled": true },
			},
			[mentions],
		);
		expect(oneFilter.addedRules.map(({ name }) => name)).toStrictEqual(["Links"]);
		expect(changesOf(oneFilter, [mentions]).rules).toMatchObject({
			created: ["Links"],
			updated: [],
			removed: [],
		});
	});

	it("makes the rule of a filter the limits of V7 changed, and names the rule in what it tells", () => {
		const parsed = read(
			legacy({ "selfmod.capitals.enabled": true, "selfmod.capitals.maximum": 100_000 }),
		);

		expect(parsed.addedRules).toMatchObject([{ name: "Capitals", options: { maximum: 100 } }]);
		expect(parsed.notices).toMatchObject([
			{ kind: "ruleAdjusted", path: "settings.selfmod.capitals", rule: "Capitals" },
		]);
	});

	it("adds the filters to the rules of an automod section, and tells a name it already has", () => {
		const parsed = read({
			...legacy({ "selfmod.links.enabled": true, "selfmod.capitals.enabled": true }),
			automod: { rules: [{ name: "Links", type: "Links" }] },
		});

		expect(parsed.rules?.map(({ name }) => name)).toStrictEqual(["Links", "Capitals"]);
		expect(parsed.addedRules).toStrictEqual([]);
		expect(parsed.notices).toMatchObject([
			{ kind: "ruleFailed", rule: "Links", reason: 'Two rules are named "Links".' },
		]);
		expect(changesOf(parsed).rules?.mode).toBe("replace");
	});

	it("does not add a rule past the limit of the rules of a server", () => {
		const full = Array.from({ length: 25 }, (_, index) => rule(`Rule ${index}`, "Words"));

		const parsed = read(legacy({ "selfmod.links.enabled": true }), full);

		expect(parsed.addedRules).toStrictEqual([]);
		expect(parsed.notices).toMatchObject([{ kind: "ruleFailed", rule: "Links" }]);
	});

	it("still refuses a setting nobody has", () => {
		expect(issuesOf(legacy({ "no.such": true }))).toMatchObject([{ path: "settings.no.such" }]);
	});

	it("refuses a setting of the bot before V7 in a file of version 2", () => {
		expect(
			issuesOf({ version: 2, settings: { "messages.moderation-dm": true } }),
		).toMatchObject([{ path: "settings.messages.moderation-dm" }]);
	});

	it("shows what was not imported with the preview, even when nothing changes", () => {
		const parsed = read(legacy({ "prefix": "!", "messages.moderation-dm": true }));

		const preview = changesOf(parsed);

		expect(preview.isEmpty).toBe(true);
		expect(preview.notices).toStrictEqual([
			{ kind: "noEquivalent", path: "settings.prefix", name: "prefix" },
		]);
	});
});
