import type { BotApiAuthPayload, BotApiAuthSessionInput } from "#shared/types/botApi";
import type { H3Event } from "h3";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createError } from "evlog";
import { $fetch, FetchError } from "ofetch";

export const DEFAULT_BOT_API_AUTH_COOKIE = "SAPPHIRE_AUTH";

type BotHttpMethod = "GET" | "PATCH" | "POST" | "PUT" | "DELETE";

interface FetchBotApiOptions {
	body?: Record<string, unknown> | unknown[] | string | null;
	method?: BotHttpMethod;
	query?: Record<string, unknown>;
	/**
	 * When true (default for non-public paths historically), requires a browser
	 * sapphire/better-auth cookie on the bot origin. Nuxt is clientOnly for auth,
	 * so server-side calls must not synthesize cookies — pass `auth: false` for
	 * public routes, or call the bot from the browser via `$api`.
	 */
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
 * Build outbound Cookie headers for sapphire-plugin-api when credentials exist.
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

/** Bot API paths that do not require auth cookies. */
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
 * Auth is owned by the bot (Better Auth / sapphire cookies on that origin);
 * Nuxt does not synthesize session cookies in clientOnly mode.
 */
export async function fetchBotApi<T = unknown>(
	_event: H3Event,
	path: string,
	options: FetchBotApiOptions = {},
): Promise<T> {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	if (options.auth !== false && !isPublicBotApiPath(normalizedPath)) {
		throw createError({
			message: "Unauthorized",
			status: 401,
			why: "Authenticated bot API calls must run in the browser against the bot origin",
			fix: "Use `$api` on the client after signing in via the bot Better Auth server",
		});
	}

	const url = `${getBotApiBaseUrl()}${normalizedPath}`;
	try {
		return await $fetch<T>(url, {
			body: options.body,
			headers: {
				"Content-Type": "application/json",
			},
			method: options.method,
			query: options.query,
		});
	} catch (error) {
		mapBotFetchError(error, normalizedPath);
	}
}
