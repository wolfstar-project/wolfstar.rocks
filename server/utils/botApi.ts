import type { BotApiAuthPayload, BotApiAuthSessionInput } from "#shared/types/botApi";
import type { H3Event } from "h3";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { refreshSessionTokens } from "#server/utils/oauth-tokens";
import { createError } from "evlog";
import { $fetch, FetchError } from "ofetch";

export const DEFAULT_BOT_API_AUTH_COOKIE = "SAPPHIRE_AUTH";

type BotHttpMethod = "GET" | "PATCH" | "POST" | "PUT" | "DELETE";

interface FetchBotApiOptions {
	body?: Record<string, unknown> | unknown[] | string | null;
	method?: BotHttpMethod;
	query?: Record<string, unknown>;
	/** When false, skip sapphire auth cookie (public bot routes). Default true. */
	auth?: boolean;
}

export function getBotApiAuthCookieName(): string {
	return process.env.NUXT_BOT_API_AUTH_COOKIE || DEFAULT_BOT_API_AUTH_COOKIE;
}

/**
 * Encrypt a sapphire-plugin-api auth payload (aes-256-cbc), matching
 * `@sapphire/plugin-api` Auth.encrypt so api.wolfstar.rocks accepts the cookie.
 * The secret is the Discord OAuth client secret (`NUXT_OAUTH_DISCORD_CLIENT_SECRET`).
 */
export function encryptBotApiAuth(data: BotApiAuthPayload, secret: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-cbc", secret, iv);
	return `${cipher.update(JSON.stringify(data), "utf8", "base64") + cipher.final("base64")}.${iv.toString("base64")}`;
}

/**
 * Decrypt a sapphire-plugin-api auth token. Returns null when expired or invalid.
 */
export function decryptBotApiAuth(token: string, secret: string): BotApiAuthPayload | null {
	const [data, iv] = token.split(".");
	if (!data || !iv) {
		return null;
	}
	try {
		const decipher = createDecipheriv("aes-256-cbc", secret, Buffer.from(iv, "base64"));
		const parsed = JSON.parse(
			decipher.update(data, "base64", "utf8") + decipher.final("utf8"),
		) as BotApiAuthPayload;
		return parsed.expires >= Date.now() ? parsed : null;
	} catch {
		return null;
	}
}

/**
 * Build outbound Cookie headers for sapphire-plugin-api when session credentials exist.
 * Returns an empty object when the user/token/secret is missing.
 */
export function getOptionalBotApiAuthHeaders(
	input: BotApiAuthSessionInput,
): Record<string, string> {
	const { accessToken, secret, userId } = input;
	if (!userId || !accessToken || !secret) {
		return {};
	}

	const cookieValue = encryptBotApiAuth(
		{
			expires: Date.now() + (input.expiresInMs ?? 60 * 60 * 1000),
			id: userId,
			refresh: "",
			token: accessToken,
		},
		secret,
	);

	return {
		Cookie: `${input.cookieName ?? getBotApiAuthCookieName()}=${cookieValue}`,
	};
}

function getBotApiBaseUrl(): string {
	const {
		public: { apiBaseUrl },
	} = useRuntimeConfig();
	if (!apiBaseUrl) {
		throw createError({
			message: "Bot API base URL is not configured",
			status: 500,
			why: "NUXT_PUBLIC_API_BASE_URL is missing",
			fix: "Set NUXT_PUBLIC_API_BASE_URL to the WolfStar bot API origin (e.g. http://localhost:8282)",
		});
	}
	return apiBaseUrl.replace(/\/$/, "");
}

function getBotOauthSecret(): string {
	const secret = useRuntimeConfig().discord?.clientSecret || "";
	if (!secret) {
		throw createError({
			message: "Bot API OAuth secret is not configured",
			status: 500,
			why: "NUXT_OAUTH_DISCORD_CLIENT_SECRET is not set",
			fix: "Set the Discord OAuth client secret shared with the WolfStar bot API",
		});
	}
	return secret;
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

	return encryptBotApiAuth(
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
		return { Cookie: `${getBotApiAuthCookieName()}=${cookieValue}` };
	} catch {
		return {};
	}
}

/** Bot API paths that do not require a sapphire auth cookie. */
export function isPublicBotApiPath(path: string): boolean {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return normalized === "/commands" || normalized === "/languages";
}

function toErrorCause(error: unknown): Error | undefined {
	return error instanceof Error ? error : undefined;
}

function mapBotFetchError(error: unknown, path: string): never {
	if (error instanceof FetchError) {
		const status = error.statusCode ?? error.response?.status ?? 502;
		const payload = error.data as { error?: string; message?: string } | string | undefined;
		const message =
			(typeof payload === "object" && payload !== null
				? (payload.error ?? payload.message)
				: typeof payload === "string"
					? payload
					: undefined) ||
			error.message ||
			"Bot API request failed";

		throw createError({
			message,
			status,
			why: `The internal bot API rejected ${path}`,
			fix: "Retry the request; if it persists, check bot API availability and auth cookies",
			cause: toErrorCause(error),
		});
	}

	throw createError({
		message: "Bot API request failed",
		status: 502,
		why: `Unexpected error calling ${path} on the internal bot API`,
		cause: toErrorCause(error),
	});
}

/**
 * Call the WolfStar bot API (`NUXT_PUBLIC_API_BASE_URL`).
 * Authenticated routes receive a sapphire-compatible `SAPPHIRE_AUTH` cookie
 * built from the current better-auth Discord session.
 */
export async function fetchBotApi<T = unknown>(
	event: H3Event,
	path: string,
	options: FetchBotApiOptions = {},
): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const url = `${getBotApiBaseUrl()}${normalizedPath}`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (options.auth !== false) {
		const cookieValue = await buildBotAuthCookie(event);
		headers.Cookie = `${getBotApiAuthCookieName()}=${cookieValue}`;
	}

	try {
		return await $fetch<T>(url, {
			body: options.body,
			headers,
			method: options.method,
			query: options.query,
		});
	} catch (error) {
		mapBotFetchError(error, normalizedPath);
	}
}
