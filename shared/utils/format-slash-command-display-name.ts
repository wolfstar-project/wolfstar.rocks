type SlashCommandNameOnly = {
	commandName: string;
	subcommand?: undefined;
	subcommandGroup?: undefined;
};

type SlashCommandDirectSubcommand = {
	commandName: string;
	subcommand: string;
	subcommandGroup?: undefined;
};

type SlashCommandGroupedSubcommand = {
	commandName: string;
	subcommandGroup: string;
	subcommand: string;
};

export type SlashCommandDisplayParts =
	| SlashCommandNameOnly
	| SlashCommandDirectSubcommand
	| SlashCommandGroupedSubcommand;

export type SlashCommandDisplayInput = {
	commandName: string;
	subcommand?: string;
	subcommandGroup?: string;
	subcommandSubgroup?: string;
};

function formatSlashCommandSegment(segment: string): string {
	return segment.replace(/^\//, "").replaceAll("-", " ");
}

export function validateSlashCommandDisplayParts(
	input: SlashCommandDisplayInput,
): SlashCommandDisplayParts {
	if (!input.commandName.trim()) {
		throw new Error("commandName is required");
	}

	if (input.subcommandSubgroup !== undefined && input.subcommandSubgroup.length > 0) {
		throw new Error("subcommand groups cannot be nested");
	}

	const hasSubcommandGroup =
		input.subcommandGroup !== undefined && input.subcommandGroup.length > 0;
	const hasSubcommand = input.subcommand !== undefined && input.subcommand.length > 0;

	if (hasSubcommandGroup && !hasSubcommand) {
		throw new Error("subcommand is required when subcommandGroup is set");
	}

	if (!hasSubcommandGroup && !hasSubcommand) {
		return { commandName: input.commandName };
	}

	if (!hasSubcommandGroup && hasSubcommand) {
		return {
			commandName: input.commandName,
			subcommand: input.subcommand!,
		};
	}

	const result: SlashCommandGroupedSubcommand = {
		commandName: input.commandName,
		subcommandGroup: input.subcommandGroup!,
		subcommand: input.subcommand!,
	};
	return result;
}

export function formatSlashCommandDisplayName(input: SlashCommandDisplayInput): string {
	const parts = validateSlashCommandDisplayParts(input);
	const segments = [parts.commandName];

	if ("subcommandGroup" in parts && parts.subcommandGroup !== undefined) {
		segments.push(parts.subcommandGroup);
	}

	if ("subcommand" in parts && parts.subcommand !== undefined) {
		segments.push(parts.subcommand);
	}

	return segments.map(formatSlashCommandSegment).join(" ");
}
