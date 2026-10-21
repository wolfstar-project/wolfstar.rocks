import { describe, expect, it } from "vitest";
import { countEnabledModules, GUILD_MODULES } from "../../../../shared/utils/guild-modules";

describe("guild modules registry", () => {
	it("lists the modules of the V7 Modules table the dashboard shows, once", () => {
		const keys = GUILD_MODULES.map((module) => module.key);
		const sections = GUILD_MODULES.map((module) => module.section);

		expect(keys.toSorted()).toStrictEqual([
			"modulesAutomod",
			"modulesModeration",
			"modulesRoles",
		]);
		expect(new Set(sections).size).toBe(GUILD_MODULES.length);
	});

	it("leaves Commands and Logs out: the bot dropped them, they are sections, not modules", () => {
		const keys: readonly string[] = GUILD_MODULES.map((module) => module.key);

		expect(keys).not.toContain("modulesCommands");
		expect(keys).not.toContain("modulesLogs");
		expect(GUILD_MODULES.map((module) => module.section)).not.toContain("commands");
	});

	it("counts only modules whose flag is exactly true", () => {
		expect(countEnabledModules(undefined)).toBe(0);
		expect(countEnabledModules({})).toBe(0);
		// Files and audit rows written before can still carry `modulesLogs`; it is not a module.
		const settings = {
			modulesAutomod: true,
			modulesLogs: true,
			modulesRoles: true,
		};

		expect(countEnabledModules(settings)).toBe(2);
	});
});
