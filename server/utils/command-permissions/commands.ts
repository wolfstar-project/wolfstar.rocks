import type { WolfCommand } from "#shared/types/discord";

/** One of the bot's commands, with the id Discord registered it under in this environment. */
export interface RegisteredCommand {
	/** `null` when Discord has no such command here: it cannot be edited. */
	id: string | null;
	/** The name Discord shows, `warn-thresholds`. */
	name: string;
	/** The bot's piece name, `warnThresholds`, which its command rules use. */
	command: string;
	category: string;
	description: string;
}

/**
 * The bot's commands matched to Discord's by their top-level name. The bot
 * lists each subcommand on its own (`ban add`), so they fold into their command.
 * Discord's commands the bot does not list are left out: they are not WolfStar's
 * to edit here.
 */
export function matchRegisteredCommands(
	botCommands: readonly WolfCommand[],
	discordCommands: readonly { id: string; name: string }[],
): RegisteredCommand[] {
	const ids = new Map(discordCommands.map((command) => [command.name, command.id]));
	const commands = new Map<string, RegisteredCommand>();
	for (const entry of botCommands) {
		const name = entry.name.split(" ")[0] ?? entry.name;
		if (commands.has(name)) continue;
		commands.set(name, {
			id: ids.get(name) ?? null,
			name,
			command: entry.command ?? name,
			category: entry.category,
			description: entry.description,
		});
	}
	return [...commands.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
