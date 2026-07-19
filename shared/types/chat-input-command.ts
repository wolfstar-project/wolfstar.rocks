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

export type SlashCommandGroupedSubcommand = {
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
