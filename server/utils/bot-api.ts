import type { H3Event } from "h3";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createError } from "evlog";
import { $fetch, FetchError } from "ofetch";

const DEFAULT_AUTH_COOKIE = "SAPPHIRE_AUTH";

export interface SapphireAuthPayload {
	expires: number;
	id: string;
	refresh: string;
	token: string;
}

type BotHttpMethod = "GET" | "PATCH" | "POST" | "PUT" | "DELETE";

interface FetchBotApiOptions {
	body?: Record<string, unknown> | unknown[] | string | null;
	method?: BotHttpMethod;
	query?: Record<string, unknown>;
	/** When false, skip sapphire auth cookie (public bot routes). Default true. */
	auth?: boolean;
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
			fix: "Set NUXT_PUBLIC_API_BASE_URL to the WolfStar bot API origin (e.g. https://api.wolfstar.rocks)",
		});
	}
	return apiBaseUrl.replace(/\/$/, "");
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
export async function getOptionalBotAuthHeaders(
	event: H3Event,
): Promise<Record<string, string>> {
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
 * Call the internal WolfStar bot API (`api.wolfstar.rocks` by default).
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
		headers.Cookie = `${getBotAuthCookieName()}=${cookieValue}`;
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
