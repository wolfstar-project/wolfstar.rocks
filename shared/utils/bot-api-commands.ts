import type { FlattenedCommand, Preconditions, WolfCommand } from "#shared/types/discord";

/**
 * Raw command payload from the WolfStar bot API (`/commands`).
 * The bot serializes Sapphire `aliases` as the singular `alias` field.
 */
export interface BotApiCommand {
	alias?: string[];
	category: string;
	description: string;
	extendedHelp: FlattenedCommand["extendedHelp"];
	guarded: boolean;
	name: string;
	permissionLevel: number;
	preconditions: Preconditions;
	subCategory?: string | null;
}

/**
 * Normalize a bot API command into the dashboard's WolfCommand shape
 * (`aliases` + non-null `subCategory`).
 */
export function normalizeBotCommand(command: BotApiCommand): WolfCommand {
	return {
		aliases: command.alias ?? [],
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

export function normalizeBotCommands(commands: BotApiCommand[]): WolfCommand[] {
	return commands.map(normalizeBotCommand);
}
