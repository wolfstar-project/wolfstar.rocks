export interface BuildInfo {
	version: string;
	commit: string;
	shortCommit: string;
	time: number;
	branch: string;
	env: Env.Canary | Env.Dev | Env.Release;
}

export enum Env {
	Canary = 'canary',
	Dev = 'dev',
	Release = 'release'
}

export enum GuildRoutes {
	Channels = 'channels',
	DisabledCommands = 'disabled-commands',
	Events = 'events',
	Messages = 'messages',
	Moderation = 'moderation',
	Roles = 'roles'
}

export enum FilterRoutes {
	Capitals = 'filter/capitals',
	Invites = 'filter/invites',
	Links = 'filter/links',
	MessageDuplication = 'filter/messages',
	NewLines = 'filter/newlines',
	Reactions = 'filter/reactions',
	Words = 'filter/words'
}



export {};

declare module 'h3' {
	interface H3EventContext {
			errorHandled: boolean;
	}
}
