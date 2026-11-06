import type { APIGuild } from "discord-api-types/v10";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import { parseConfigurationFile } from "#server/utils/settings-transfer/parse";
import {
	getDefaultAutoModerationRule,
	type AutoModerationRule,
	type AutoModerationRuleData,
} from "#shared/utils/automod-rules";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD_ID = "100000000000000000";

const mocks = vi.hoisted(() => ({
	/** The rules the database has when the import is written, under the lock of the rules. */
	rulesNow: [] as AutoModerationRule[],
	submit: vi.fn(async (extra?: (tx: { orm: object }) => Promise<void>) => {
		await extra?.({ orm: {} });
	}),
	writeAutoModerationRulePlan: vi.fn(),
}));

vi.mock("#server/database", () => ({
	serializeSettings: (settings: unknown) => JSON.stringify(settings),
	writeSettingsTransaction: async () => ({
		settings: { ...getDefaultGuildSettings(), id: GUILD_ID },
		write: vi.fn(),
		submit: mocks.submit,
		[Symbol.dispose]: vi.fn(),
	}),
}));
vi.mock("#server/database/settings/automod/storage", () => ({
	writeAutoModerationRulePlan: mocks.writeAutoModerationRulePlan,
}));
vi.mock("#server/utils/automod/rules", () => ({
	writeAutoModerationRules: (_guildId: string, run: (rules: unknown[]) => unknown) =>
		run(mocks.rulesNow),
}));
vi.mock("#server/utils/honeypot/permissions", () => ({ assertHoneypotIsUsable: vi.fn() }));

import {
	applyConfigurationImport,
	ConfigurationImportStaleError,
} from "#server/utils/settings-transfer/apply";

const guild = { id: GUILD_ID } as APIGuild;

let nextId = 1;
function rule(name: string): AutoModerationRule {
	return {
		...getDefaultAutoModerationRule("Words"),
		id: String(nextId++),
		guildId: GUILD_ID,
		name,
		type: "Words",
	} as AutoModerationRule;
}

/** A file of the bot before V7 whose links filter was turned on, read against the rules of the preview. */
function readLegacyFile(rules: readonly AutoModerationRule[]) {
	const text = JSON.stringify({ version: 1, settings: { "selfmod.links.enabled": true } });
	const result = parseConfigurationFile(text, rules);
	if (!result.ok) throw new Error(JSON.stringify(result.issues));
	return result.value;
}

describe("applyConfigurationImport and the rules a file of the bot before V7 adds", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.writeAutoModerationRulePlan.mockImplementation(
			async (_orm: unknown, _guildId: string, plan: { create: AutoModerationRuleData[] }) =>
				plan.create.map((data) => ({ ...data, id: String(nextId++), guildId: GUILD_ID })),
		);
	});

	it("adds them to the rules the server has when it is written, keeping a rule added after the preview", async () => {
		const mine = rule("Mine");
		const parsed = readLegacyFile([mine]);
		const addedSince = rule("Added since");
		mocks.rulesNow = [mine, addedSince];

		const applied = await applyConfigurationImport(guild, parsed);

		expect(mocks.writeAutoModerationRulePlan).toHaveBeenCalledWith(
			{},
			GUILD_ID,
			expect.objectContaining({ remove: [], update: [] }),
			"en-US",
		);
		expect(applied.rules.map(({ name }) => name)).toStrictEqual([
			"Mine",
			"Added since",
			"Links",
		]);
	});

	it("refuses the import as a change of the server when the rules would be more than 25 by now", async () => {
		const preview = Array.from({ length: 24 }, (_, index) => rule(`Rule ${index}`));
		const parsed = readLegacyFile(preview);
		mocks.rulesNow = [...preview, rule("Added since")];

		const error = await applyConfigurationImport(guild, parsed).catch(
			(caught: unknown) => caught,
		);

		expect(error).toBeInstanceOf(ConfigurationImportStaleError);
		expect((error as ConfigurationImportStaleError).reason).toBe("ruleLimit");
		expect(mocks.submit).not.toHaveBeenCalled();
	});
});
