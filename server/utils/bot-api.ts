import type { H3Event } from "h3";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createError } from "evlog";

const DEFAULT_AUTH_COOKIE = "SAPPHIRE_AUTH";

export interface SapphireAuthPayload {
	expires: number;
	id: string;
	refresh: string;
	token: string;
}

function getBotAuthCookieName(): string {
	return process.env.NUXT_BOT_API_AUTH_COOKIE || DEFAULT_AUTH_COOKIE;
}

function getBotOauthSecret(): string {
	const secret =
		process.env.NUXT_BOT_API_OAUTH_SECRET || useRuntimeConfig().discord.clientSecret || "";
	if (!secret) {
		throw createError({
			message: "Bot API OAuth secret is not configured",
			status: 500,
			why: "Neither NUXT_BOT_API_OAUTH_SECRET nor NUXT_OAUTH_DISCORD_CLIENT_SECRET is set",
			fix: "Set the Discord OAuth client secret shared with the WolfStar bot API",
		});
	}
	return secret;
}

/**
 * Encrypt a sapphire-plugin-api auth payload (aes-256-cbc), matching
 * `@sapphire/plugin-api` Auth.encrypt so api.wolfstar.rocks accepts the cookie.
 */
export function encryptSapphireAuth(data: SapphireAuthPayload, secret: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", secret, iv);
	return `${cipher.update(JSON.stringify(data), "utf8", "base64") + cipher.final("base64")}.${iv.toString("base64")}`;
}

/**
 * Decrypt a sapphire-plugin-api auth token. Returns null when expired or invalid.
 */
export function decryptSapphireAuth(token: string, secret: string): SapphireAuthPayload | null {
	const [data, iv] = token.split(".");
	if (!data || !iv) {
		return null;
	}
	try {
		const decipher = createDecipheriv("aes-256-cbc", secret, Buffer.from(iv, "base64"));
		const parsed = JSON.parse(
			decipher.update(data, "base64", "utf8") + decipher.final("utf8"),
		) as SapphireAuthPayload;
		return parsed.expires >= Date.now() ? parsed : null;
	} catch {
		return null;
	}
}

async function buildBotAuthCookie(event: H3Event): Promise<string> {
	const session = await getUserSession(event);
	const userId = session?.user?.id;
	if (!userId) {
		throw createError({
			message: "Unauthorized",
			status: 401,
			why: "No authenticated session is available for the bot API request",
			fix: "Sign in with Discord and retry",
		});
	}

	const tokens = await refreshSessionTokens(event);
	if (!tokens?.access_token) {
		throw createError({
			message: "Unauthorized",
			status: 401,
			why: "Discord access token could not be resolved for the current session",
			fix: "Sign out and sign in again to refresh Discord OAuth tokens",
		});
	}

	return encryptSapphireAuth(
		{
			expires: Date.now() + 60 * 60 * 1000,
			id: userId,
			refresh: "",
			token: tokens.access_token,
		},
		getBotOauthSecret(),
	);
}

/**
 * Build outbound Cookie header for sapphire-plugin-api when a Discord session exists.
 * Returns an empty object when the user is anonymous (public bot routes).
 */
export async function getOptionalBotAuthHeaders(event: H3Event): Promise<Record<string, string>> {
	const session = await getUserSession(event);
	if (!session?.user?.id) {
		return {};
	}
	try {
		const cookieValue = await buildBotAuthCookie(event);
		return { Cookie: `${getBotAuthCookieName()}=${cookieValue}` };
	} catch {
		return {};
	}
}
