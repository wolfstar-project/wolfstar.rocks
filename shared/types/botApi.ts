/**
 * Payload encrypted into the sapphire-plugin-api `SAPPHIRE_AUTH` cookie.
 */
export interface BotApiAuthPayload {
	expires: number;
	id: string;
	refresh: string;
	token: string;
}

export interface BotApiAuthSessionInput {
	accessToken?: string | null;
	cookieName?: string;
	/** Token lifetime for the sapphire cookie. Defaults to 1 hour. */
	expiresInMs?: number;
	secret: string;
	userId?: string | null;
}
