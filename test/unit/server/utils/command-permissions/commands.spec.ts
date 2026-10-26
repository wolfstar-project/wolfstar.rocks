import type { WolfCommand } from "#shared/types/discord";
import { matchRegisteredCommands } from "#server/utils/command-permissions/commands";
import { describe, expect, it } from "vitest";

function entry(name: string, overrides: Partial<WolfCommand> = {}): WolfCommand {
	return {
		alias: [],
		category: "Moderation",
		description: `${name} description`,
		extendedHelp: {},
		guarded: false,
		name,
		permissionLevel: 5,
		preconditions: { entries: [], mode: 0, runCondition: 0 },
		subCategory: "General",
		...overrides,
	};
}

describe("matchRegisteredCommands", () => {
	const bot = [
		entry("ban add", { command: "ban" }),
		entry("ban remove", { command: "ban" }),
		entry("warn-thresholds list", { command: "warnThresholds", category: "Management" }),
		entry("ping", { category: "General" }),
	];
	const discord = [
		{ id: "600000000000000001", name: "ban" },
		{ id: "600000000000000002", name: "warn-thresholds" },
		{ id: "600000000000000009", name: "retired" },
	];

	it("gives one entry per Discord command, its subcommands folded in", () => {
		const commands = matchRegisteredCommands(bot, discord);
		expect(commands.filter((command) => command.name === "ban")).toEqual([
			{
				id: "600000000000000001",
				name: "ban",
				command: "ban",
				category: "Moderation",
				description: "ban add description",
			},
		]);
		expect(commands.find((command) => command.name === "warn-thresholds")?.command).toBe(
			"warnThresholds",
		);
	});

	it("marks a bot command Discord does not have", () => {
		expect(
			matchRegisteredCommands(bot, discord).find((command) => command.name === "ping")?.id,
		).toBeNull();
	});

	it("leaves out a Discord command the bot does not list", () => {
		expect(
			matchRegisteredCommands(bot, discord).some((command) => command.name === "retired"),
		).toBe(false);
	});
});
