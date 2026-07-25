import type {
	SlashCommandDefinition,
	SlashCommandDisplayInput,
	SlashCommandDisplayParts,
	SlashCommandGroupedSubcommand,
	SlashCommandInvocation,
} from "../types/chat-input-command";

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

export function validateSlashCommandDefinition(definition: SlashCommandDefinition): void {
	const hasSubcommands =
		definition.subcommands !== undefined && definition.subcommands.length > 0;
	const hasGroups =
		definition.subcommandGroups !== undefined && definition.subcommandGroups.length > 0;
	const hasOptions = definition.options !== undefined && definition.options.length > 0;

	if ((hasSubcommands || hasGroups) && hasOptions) {
		throw new Error("commands with subcommands cannot have top-level options");
	}

	for (const group of definition.subcommandGroups ?? []) {
		if (group.subcommands.length === 0) {
			throw new Error(
				`subcommand group "${group.name}" must contain at least one subcommand`,
			);
		}
	}
}

export function toSlashCommandDisplayInput(
	invocation: SlashCommandInvocation,
): Pick<SlashCommandDisplayInput, "commandName" | "subcommand" | "subcommandGroup"> {
	return {
		commandName: invocation.name,
		subcommand: invocation.subcommand,
		subcommandGroup: invocation.subcommandGroup,
	};
}
