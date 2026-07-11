export interface SlashCommandOption {
	name: string;
	value?: string;
	description?: string;
	focused?: boolean;
	required?: boolean;
}

export interface SlashCommandDefinitionSubcommand {
	name: string;
	description?: string;
	options?: SlashCommandOption[];
}

export interface SlashCommandDefinitionGroup {
	name: string;
	description?: string;
	subcommands: SlashCommandDefinitionSubcommand[];
}

export interface SlashCommandDefinition {
	name: string;
	description?: string;
	subcommands?: SlashCommandDefinitionSubcommand[];
	subcommandGroups?: SlashCommandDefinitionGroup[];
	options?: SlashCommandOption[];
}

export interface SlashCommandInvocation {
	name: string;
	subcommand?: string;
	subcommandGroup?: string;
	options?: SlashCommandOption[];
}
