import { parse } from "valibot";
import { describe, expect, it } from "vitest";
import { ModulesSettingsSchema } from "../../../../shared/schemas/modules";
import {
	countEnabledModules,
	GUILD_MODULES,
	guildModulePath,
} from "../../../../shared/utils/guild-modules";

describe("guild modules registry", () => {
	it("lists every selfmod module once with a unique key and slug", () => {
		const keys = GUILD_MODULES.map((module) => module.key);
		const slugs = GUILD_MODULES.map((module) => module.slug);

		expect(new Set(keys).size).toBe(GUILD_MODULES.length);
		expect(new Set(slugs).size).toBe(GUILD_MODULES.length);
		expect(keys.every((key) => key.startsWith("selfmod") && key.endsWith("Enabled"))).toBe(
			true,
		);
	});

	it("counts only modules whose flag is exactly true", () => {
		expect(countEnabledModules(undefined)).toBe(0);
		expect(countEnabledModules({})).toBe(0);
		expect(
			countEnabledModules({
				selfmodCapitalsEnabled: null,
				selfmodFilterEnabled: true,
				selfmodInvitesEnabled: false,
				selfmodLinksEnabled: true,
			}),
		).toBe(2);
	});

	it("builds the moderation filter path for a module", () => {
		expect(guildModulePath("123456789012345678", "word")).toBe(
			"/guilds/123456789012345678/manage/moderation/word",
		);
	});

	it("schema accepts every module flag and defaults missing ones to false", () => {
		const parsed = parse(ModulesSettingsSchema, { selfmodFilterEnabled: true });

		expect(parsed.selfmodFilterEnabled).toBe(true);
		for (const module of GUILD_MODULES) {
			expect(module.key in parsed).toBe(true);
		}
		expect(parsed.selfmodReactionsEnabled).toBe(false);
	});
});
