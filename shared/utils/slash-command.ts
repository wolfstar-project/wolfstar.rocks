import type { SlashCommandDefinition, SlashCommandInvocation } from "#shared/types/slash-command";
import type { SlashCommandDisplayInput } from "#shared/utils/format-slash-command-display-name";

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
