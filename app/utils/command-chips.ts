const GUILD_ONLY_PRECONDITIONS = new Set([
	"Administrator",
	"DJ",
	"GuildOnly",
	"Moderator",
	"NewsOnly",
	"NSFW",
	"TextOnly",
]);

/** The permission levels a chip names: staff, moderators and administrators. */
export type CommandPermissionChip = "staff" | "moderator" | "administrator";

const PERMISSION_CHIPS: Partial<Record<number, CommandPermissionChip>> = {
	4: "staff",
	5: "moderator",
	6: "administrator",
};

export function commandPermissionChip(command: FlattenedCommand): CommandPermissionChip | null {
	return PERMISSION_CHIPS[command.permissionLevel] ?? null;
}

export function isGuildOnlyCommand(command: FlattenedCommand): boolean {
	return command.preconditions.entries
		.flatMap((preconditionEntry) => preconditionEntry.entries)
		.filter(Boolean)
		.some((entry) => GUILD_ONLY_PRECONDITIONS.has(entry.name));
}

/**
 * Whether `CommandChips` renders anything for a command. The details panel asks
 * the same question to decide if it is empty, so the two cannot disagree.
 */
export function hasCommandChips(command: FlattenedCommand): boolean {
	return (
		commandPermissionChip(command) !== null || isGuildOnlyCommand(command) || command.guarded
	);
}
