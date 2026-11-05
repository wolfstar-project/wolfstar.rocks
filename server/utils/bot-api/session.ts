import { createCipheriv, randomBytes } from "node:crypto";
import { instrumentBotApiCall } from "#server/utils/sentry-metrics";
import { createError } from "evlog";
import { $fetch as ofetch } from "ofetch";

/**
 * The session the bot's API reads from its cookie: its `AuthData`
 * (`projects/bot/src/lib/api/Auth.ts` in wolfstar-project/wolfstar, V7).
 */
export interface BotSessionData {
	/** The Discord ID of the user. */
	id: string;
	/** When the session ends, in milliseconds: the API refuses it after that. */
	expires: number;
	refresh: string;
	token: string;
}

/** How long a session minted for one call lives: enough for the call, not for a replay. */
const SESSION_LIFETIME = 60_000;

/**
 * Encrypts a session as the bot's `Auth#encrypt` does: the JSON with
 * aes-256-cbc, the secret as the key, a random IV, and the two in base64 joined
 * by a dot, `<ciphertext>.<iv>`. The bot decrypts it with the same secret.
 *
 * @param secret The bot's `OAUTH_SECRET`: 32 characters, the key itself.
 */
export function encryptBotSession(data: BotSessionData, secret: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", secret, iv);
	const encrypted =
		cipher.update(JSON.stringify(data), "utf8", "base64") + cipher.final("base64");
	return `${encrypted}.${iv.toString("base64")}`;
}

/**
 * The cookie a call to the bot's API carries for a user. The routes of the
 * appeals read only the ID, so the session carries no Discord token: the
 * member's own stays with the dashboard. The value is URI-encoded, as the
 * API's cookie store writes and reads it.
 */
function botSessionCookie(userId: string): string {
	const { botApiOauthSecret, botApiOauthCookie } = useRuntimeConfig();
	if (!botApiOauthSecret) {
		throw createError({
			message: "Appeals cannot be sent from the website right now",
			status: 503,
			why: "The bridge to the bot's API has no secret: NUXT_BOT_API_OAUTH_SECRET is not set",
			fix: "Set NUXT_BOT_API_OAUTH_SECRET to the bot's OAUTH_SECRET (and NUXT_BOT_API_OAUTH_COOKIE to its OAUTH_COOKIE)",
		});
	}

	const value = encryptBotSession(
		{ id: userId, token: "", refresh: "", expires: Date.now() + SESSION_LIFETIME },
		botApiOauthSecret,
	);
	return `${botApiOauthCookie}=${encodeURIComponent(value)}`;
}

/**
 * Calls the bot's own API as a user, server to server, with a session minted
 * for this call. An error of the API is thrown as `$fetch` throws it, with its
 * status and body, for the route to answer with.
 *
 * @param userId The Discord ID of the user the call is made for.
 * @param path The path of the API, from its root: `/appeals/<guild>`.
 */
export function botApiFetch<T>(
	userId: string,
	path: string,
	init: { method?: "GET" | "POST"; body?: Record<string, unknown> } = {},
): Promise<T> {
	const {
		public: { apiBaseUrl },
	} = useRuntimeConfig();
	const cookie = botSessionCookie(userId);

	const url = `${apiBaseUrl}${path}`;
	const headers = { "Content-Type": "application/json", "Cookie": cookie };
	// ofetch's own `$fetch`, as `server/plugins/fetch-cache.ts` uses: Nitro's
	// is typed for the app's own routes, and this URL is not one of them.
	return instrumentBotApiCall(path.split("/")[1] ?? path, () =>
		ofetch<T>(url, {
			method: init.method ?? "GET",
			...(init.body === undefined ? {} : { body: init.body }),
			headers,
		}),
	);
}
