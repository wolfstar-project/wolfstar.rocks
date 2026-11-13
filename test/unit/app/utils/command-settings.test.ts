import type { FlattenedCommand } from "#shared/types/discord";
import { describe, expect, it } from "vitest";
import {
	commandTargetLabel,
	getCommandSettingName,
	listDisableableCommands,
} from "~/utils/command-settings";

function entry(name: string, overrides: Partial<FlattenedCommand> = {}): FlattenedCommand {
	return {
		category: "Moderation",
		description: `${name} description`,
		extendedHelp: {},
		guarded: false,
		name,
		permissionLevel: 0,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		...overrides,
	};
}

describe("getCommandSettingName", () => {
	it("names the command an entry belongs to", () => {
		expect(
			getCommandSettingName(entry("warn-thresholds list", { command: "warnThresholds" })),
		).toBe("warnThresholds");
	});

	it("falls back to the entry's name when an older bot sends no command", () => {
		expect(getCommandSettingName(entry("ban"))).toBe("ban");
	});
});

describe("listDisableableCommands", () => {
	it("folds the subcommands of a command into one entry named as the settings name it", () => {
		const commands = listDisableableCommands([
			entry("ban add", { command: "ban" }),
			entry("ban remove", { command: "ban" }),
			entry("kick", { command: "kick", description: "Kick a member" }),
			entry("warn-thresholds list", { category: "Management", command: "warnThresholds" }),
		]);

		expect(commands).toEqual([
			{
				category: "Moderation",
				description: "add, remove",
				label: "ban",
				name: "ban",
				subCategory: null,
			},
			{
				category: "Moderation",
				description: "Kick a member",
				label: "kick",
				name: "kick",
				subCategory: null,
			},
			{
				category: "Management",
				description: "list",
				label: "warn-thresholds",
				name: "warnThresholds",
				subCategory: null,
			},
		]);
	});

	it("keeps the sub-category a rule can target", () => {
		const [reasons] = listDisableableCommands([
			entry("reasons add", { command: "reasons", subCategory: "Management" }),
		]);

		expect(reasons?.subCategory).toBe("Management");
	});

	it("keeps the path after the command for nested subcommands", () => {
		const [automod] = listDisableableCommands([
			entry("automod rule show", { command: "automod" }),
			entry("automod rule list", { command: "automod" }),
		]);

		expect(automod?.description).toBe("rule show, rule list");
	});

	it("leaves out the guarded commands", () => {
		const commands = listDisableableCommands([
			entry("help", { guarded: true }),
			entry("ping", { category: "" }),
		]);

		expect(commands).toEqual([
			{
				category: "General",
				description: "ping description",
				label: "ping",
				name: "ping",
				subCategory: null,
			},
		]);
	});
});

describe("commandTargetLabel", () => {
	it.each([
		["*", "Every command"],
		["Moderation.*", "Moderation"],
		["Moderation.Management.*", "Moderation · Management"],
		["warn", "/warn"],
		["Moderation.warn", "/warn"],
	])("names %s", (target, label) => {
		expect(commandTargetLabel(target, "Every command")).toBe(label);
	});
});
