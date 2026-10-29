import { isSnowflake } from "#shared/utils/snowflake";

/**
 * Where and by whom a server lets one of the bot's commands run, as the bot's
 * `/commands` keeps it in `commandsRestrictions`. The dashboard only reads it:
 * the bot owns the column and its shape. Ported from the bot's
 * `readCommandRestrictions` (`commands-menu/restrictions.ts`).
 *
 * - `allowedChannels`: when it has any, the command only runs in them.
 * - `ignoredChannels`: the command does not run in them.
 * - `allowedRoles`, `allowedUsers`: when either has any, only those run it.
 * - `ignoredRoles`, `ignoredUsers`: they never run it, an allowed role or not.
 *
 * `command` is the bot's piece name; a subcommand is ruled with its parent.
 */
export interface CommandRule {
	command: string;
	allowedChannels: string[];
	ignoredChannels: string[];
	allowedRoles: string[];
	ignoredRoles: string[];
	allowedUsers: string[];
	ignoredUsers: string[];
}

const COMMAND_RULE_LISTS = [
	"allowedChannels",
	"ignoredChannels",
	"allowedRoles",
	"ignoredRoles",
	"allowedUsers",
	"ignoredUsers",
] as const satisfies readonly (keyof CommandRule)[];

function emptyRule(command: string): CommandRule {
	return {
		command,
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
	};
}

function readList(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((entry) => isSnowflake(entry)) : [];
}

function merge(into: string[], more: readonly string[]): string[] {
	return [...new Set([...into, ...more])];
}

/**
 * The command rules of a server from what `commandsRestrictions` holds. The
 * column may still hold the older `{ channel, commands }` entries, which mean
 * that each of those commands ignores the channel.
 */
export function readCommandRules(value: unknown): CommandRule[] {
	if (!Array.isArray(value)) return [];

	const rules = new Map<string, CommandRule>();
	const ruleOf = (command: string) => {
		let rule = rules.get(command);
		if (!rule) {
			rule = emptyRule(command);
			rules.set(command, rule);
		}
		return rule;
	};

	for (const entry of value as unknown[]) {
		if (typeof entry !== "object" || entry === null) continue;
		const data = entry as Record<string, unknown>;

		if (typeof data.command === "string" && data.command.length > 0) {
			const rule = ruleOf(data.command);
			for (const list of COMMAND_RULE_LISTS)
				rule[list] = merge(rule[list], readList(data[list]));
		} else if (isSnowflake(data.channel) && Array.isArray(data.commands)) {
			for (const command of data.commands) {
				if (typeof command !== "string" || command.length === 0) continue;
				const rule = ruleOf(command);
				rule.ignoredChannels = merge(rule.ignoredChannels, [data.channel]);
			}
		}
	}

	return [...rules.values()].filter((rule) =>
		COMMAND_RULE_LISTS.some((list) => rule[list].length > 0),
	);
}
