import { describe, expect, it } from "vitest";
import {
	countEnabledModules,
	GUILD_MODULES,
	MODULE_SWITCH_KEYS,
} from "../../../../shared/utils/guild-modules";

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

	// `logs` is the switch of the Events, whose section is `channels`; the Logs
	// section is the records of what happened.
	it("switches the Events with `logs`, and leaves Commands and Logs out", () => {
		const keys: readonly string[] = GUILD_MODULES.map((module) => module.key);
		const sections: readonly string[] = GUILD_MODULES.map((module) => module.section);

		expect(GUILD_MODULES.find((module) => module.key === "modulesLogs")?.section).toBe(
			"channels",
		);
		expect(keys).not.toContain("modulesCommands");
		expect(sections).not.toContain("commands");
		expect(sections).not.toContain("logs");
	});

	it("counts only modules whose flag is exactly true", () => {
		expect(countEnabledModules(undefined)).toBe(0);
		expect(countEnabledModules({})).toBe(0);
		// Files and audit rows written before can still carry `modulesCommands`; it is not a module.
		const settings = {
			modulesAutomod: true,
			modulesCommands: true,
			modulesRoles: true,
		};

		expect(countEnabledModules(settings)).toBe(2);
	});

	// The appeals have no flag in `Modules`, but a switch of their own that the
	// dashboard shows with the others.
	it("counts the switch of the appeals with the module flags", () => {
		expect(MODULE_SWITCH_KEYS).toStrictEqual([
			"modulesAutomod",
			"modulesModeration",
			"modulesRoles",
			"modulesLogs",
			"appealsEnabled",
		]);
		expect(countEnabledModules({ appealsEnabled: true, modulesModeration: true })).toBe(2);
	});
});
