import { describe, expect, it } from "vitest";
import { countEnabledModules, GUILD_MODULES } from "../../../../shared/utils/guild-modules";

describe("guild modules registry", () => {
	it("lists every module of the V7 Modules table once", () => {
		const keys = GUILD_MODULES.map((module) => module.key);
		const sections = GUILD_MODULES.map((module) => module.section);

		expect(keys.toSorted()).toStrictEqual([
			"modulesAutomod",
			"modulesCommands",
			"modulesLogs",
			"modulesModeration",
			"modulesRoles",
		]);
		expect(new Set(sections).size).toBe(GUILD_MODULES.length);
	});

	it("counts only modules whose flag is exactly true", () => {
		expect(countEnabledModules(undefined)).toBe(0);
		expect(countEnabledModules({})).toBe(0);
		expect(
			countEnabledModules({
				modulesAutomod: true,
				modulesCommands: null,
				modulesLogs: false,
				modulesRoles: true,
			}),
		).toBe(2);
	});
});
