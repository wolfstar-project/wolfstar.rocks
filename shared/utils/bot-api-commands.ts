import type { BotApiCommand } from "#shared/types/bot-api";
import type { WolfCommand } from "#shared/types/discord";

/**
 * Normalize a bot API command into the dashboard's WolfCommand shape
 * (`aliases` + non-null `subCategory`).
 */
export function normalizeBotCommand(command: BotApiCommand & { aliases?: string[] }): WolfCommand {
	return {
		aliases: command.alias ?? command.aliases ?? [],
		category: command.category,
		description: command.description,
		extendedHelp: command.extendedHelp,
		guarded: command.guarded,
		name: command.name,
		permissionLevel: command.permissionLevel,
		preconditions: command.preconditions,
		subCategory: command.subCategory ?? "",
	};
}

export function normalizeBotCommands(
	commands: Array<BotApiCommand & { aliases?: string[] }>,
): WolfCommand[] {
	return commands.map(normalizeBotCommand);
}
