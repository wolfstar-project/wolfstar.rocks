import type { FlattenedCommand, Preconditions } from "#shared/types/discord";

/**
 * Payload encrypted into the sapphire-plugin-api `SAPPHIRE_AUTH` cookie.
 */
export interface BotApiAuthPayload {
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

export interface BotApiAuthSessionInput {
	accessToken?: string | null;
	cookieName?: string;
	/** Token lifetime for the sapphire cookie. Defaults to 1 hour. */
	expiresInMs?: number;
	secret: string;
	userId?: string | null;
}
