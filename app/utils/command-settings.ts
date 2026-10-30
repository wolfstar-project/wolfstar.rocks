import { isCommandGroupTarget } from "#shared/utils/command-rules";

/**
 * A command as the settings that turn it off see it: `commandsDisabled`, the
 * restrictions and the permission nodes always name a whole command, never one
 * of its subcommands.
 */
export interface DisableableCommand {
	/** The name the settings use, the bot's piece name: `ban`, `warnThresholds`. */
	name: string;
	/** What a member types: `ban`, `warn-thresholds`. */
	label: string;
	/** The command's description, or the names of its subcommands: `add, remove`. */
	description: string;
	category: string;
	/** The second directory of its file, which a rule can target. */
	subCategory: string | null;
}

/**
 * The name the settings use for the command an entry of `GET /commands`
 * belongs to. The bot lists every subcommand as an entry of its own and names
 * its command in `command`; an older bot does not send it, and then the entry
 * is the command.
 */
export function getCommandSettingName(entry: Pick<FlattenedCommand, "command" | "name">): string {
	return entry.command ?? entry.name;
}

/** One entry per command that a server can turn off, in the order of `entries`. */
export function listDisableableCommands(
	entries: readonly FlattenedCommand[],
): DisableableCommand[] {
	const groups = new Map<string, FlattenedCommand[]>();
	for (const entry of entries) {
		if (entry.guarded) continue;
		const name = getCommandSettingName(entry);
		const group = groups.get(name);
		if (group) group.push(entry);
		else groups.set(name, [entry]);
	}

	return [...groups].flatMap(([name, group]) => {
		const [first] = group;
		if (!first) return [];
		const [label = first.name] = first.name.split(" ");
		const hasSubcommands = group.length > 1 || first.name.includes(" ");
		return [
			{
				category: first.category || "General",
				description: hasSubcommands
					? group.map((entry) => entry.name.slice(label.length + 1)).join(", ")
					: first.description,
				label,
				name,
				subCategory: first.subCategory ?? null,
			},
		];
	});
}

/**
 * The target of a rule, or of `commandsDisabled`, as the dashboard names it:
 * `/warn`, `Moderation`, `Moderation · Management`, and `every` for `*`.
 */
export function commandTargetLabel(target: string, every: string): string {
	if (target === "*") return every;
	const parts = target.split(".");
	return isCommandGroupTarget(target)
		? parts.slice(0, -1).join(" · ")
		: `/${parts.at(-1) ?? target}`;
}
