import type { FlattenedCommand, Preconditions } from "#shared/types/discord";

/**
 * Payload encrypted into the sapphire-plugin-api `SAPPHIRE_AUTH` cookie.
 */
export interface SapphireAuthPayload {
	expires: number;
	id: string;
	refresh: string;
	token: string;
}

/**
 * Raw command payload from the WolfStar bot API (`/commands`).
 * The bot serializes Sapphire `aliases` as the singular `alias` field.
 */
export interface BotApiCommand {
	alias?: string[];
	category: string;
	description: string;
	extendedHelp: FlattenedCommand["extendedHelp"];
	guarded: boolean;
	name: string;
	permissionLevel: number;
	preconditions: Preconditions;
	subCategory?: string | null;
}
