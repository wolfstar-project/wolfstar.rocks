import type { H3Event } from "h3";
import { CommandRuleNameSchema } from "#shared/schemas/command-rules";
import { createError } from "evlog";
import { safeParse } from "valibot";

/** The command of the path of a command rules route, by the bot's piece name. */
export function getCommandRuleParam(event: H3Event): string {
	const result = safeParse(CommandRuleNameSchema, getRouterParam(event, "command"));
	if (!result.success) {
		throw createError({
			message: "Invalid command name",
			status: 400,
			why: "The command in the path is not a command name",
			fix: "Use the command's name as commandsDisabled holds it, such as ban or warnThresholds",
		});
	}
	return result.output;
}

/**
 * Whether the bot has a command of this piece name, and whether a server may
 * rule it: `guarded` is the bot's `ProtectedCommands`.
 */
export async function findRuledCommand(
	command: string,
): Promise<{ known: boolean; guarded: boolean }> {
	const entries = (await fetchCommands()).filter(
		(entry) => (entry.command ?? entry.name) === command,
	);
	return { known: entries.length > 0, guarded: entries.some((entry) => entry.guarded) };
}
