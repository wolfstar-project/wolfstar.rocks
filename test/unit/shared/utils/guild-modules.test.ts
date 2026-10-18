import { describe, expect, it } from "vitest";
import { countEnabledModules, GUILD_MODULES } from "../../../../shared/utils/guild-modules";

describe("guild modules registry", () => {
	it("lists the modules of the V7 Modules table the dashboard shows, once", () => {
		const keys = GUILD_MODULES.map((module) => module.key);
		const sections = GUILD_MODULES.map((module) => module.section);

		expect(keys.toSorted()).toStrictEqual([
			"modulesAutomod",
			"modulesLogs",
			"modulesModeration",
			"modulesRoles",
		]);
		expect(new Set(sections).size).toBe(GUILD_MODULES.length);
	});

	it("leaves Commands out: it is a section, not a module", () => {
		expect(GUILD_MODULES.map((module) => module.key)).not.toContain("modulesCommands");
		expect(GUILD_MODULES.map((module) => module.section)).not.toContain("commands");
	});

	it("counts only modules whose flag is exactly true", () => {
		expect(countEnabledModules(undefined)).toBe(0);
		expect(countEnabledModules({})).toBe(0);
		// Whole settings carry `modulesCommands` too; it is not a module here.
		const settings = {
			modulesAutomod: true,
			modulesCommands: true,
			modulesLogs: false,
			modulesRoles: true,
		};

		expect(countEnabledModules(settings)).toBe(2);
	});
});
