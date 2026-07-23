import { isSafeRedirectPath } from "#shared/utils/redirect";
import { withQuery } from "ufo";

/** sessionStorage key for the post-login redirect during the sapphire bot OAuth bridge. */
export const BOT_OAUTH_NEXT_STORAGE_KEY = "wolfstar:bot-oauth-next";

/** Discord scopes for the sapphire-plugin-api OAuth cookie (includes `identify` explicitly). */
export const BOT_OAUTH_SCOPES = "identify guilds guilds.members.read email";

const BOT_OAUTH_STATE_PREFIX = "ws_next.";

export type BotOauthPrompt = "none" | "consent";

/** True when Discord `state` belongs to the sapphire bot OAuth bridge (not Better Auth). */
export function isBotOauthState(state: string | null | undefined): boolean {
	return typeof state === "string" && state.startsWith(BOT_OAUTH_STATE_PREFIX);
}

/** Encode the post-login path into Discord's `state` so it survives the authorize hop. */
export function encodeBotOauthState(next: string): string {
	const safeNext = isSafeRedirectPath(next) ? next : "/";
	return `${BOT_OAUTH_STATE_PREFIX}${encodeURIComponent(safeNext)}`;
}

/** Decode a bot-oauth Discord `state` value back into a safe local path. */
export function decodeBotOauthState(state: string | null | undefined): string | null {
	if (!isBotOauthState(state)) {
		return null;
	}
	try {
		const next = decodeURIComponent(state.slice(BOT_OAUTH_STATE_PREFIX.length));
		return isSafeRedirectPath(next) ? next : null;
	} catch {
		return null;
	}
}

/** Authorize URL whose `code` the browser POSTs to `${apiBaseUrl}/oauth/callback`. */
export function buildBotDiscordAuthorizeUrl(options: {
	clientId: string;
	redirectUri: string;
	prompt?: BotOauthPrompt;
	/** Post-login path returned by Discord in `state` after the authorize hop. */
	next?: string;
}): string {
	return withQuery("https://discord.com/oauth2/authorize", {
		client_id: options.clientId,
		prompt: options.prompt ?? "none",
		redirect_uri: options.redirectUri,
		response_type: "code",
		scope: BOT_OAUTH_SCOPES,
		state: encodeBotOauthState(options.next ?? "/"),
	});
}

/** Shared redirect URI Discord and sapphire must agree on. */
export function resolveBotOauthRedirectUri(origin: string): string {
	return `${origin.replace(/\/$/, "")}/oauth/callback`;
}

/** `prompt=none` Discord errors that can be retried with consent. */
export function isBotOauthSilentAuthError(error: string | null | undefined): boolean {
	return (
		error === "consent_required" ||
		error === "interaction_required" ||
		error === "login_required"
	);
}

function getBotOauthSessionStorage(): Storage | null {
	if (!import.meta.client || typeof sessionStorage === "undefined") {
		return null;
	}
	return sessionStorage;
}

export function rememberBotOauthNext(next: string): void {
	getBotOauthSessionStorage()?.setItem(BOT_OAUTH_NEXT_STORAGE_KEY, next);
}

export function consumeBotOauthNext(fallback = "/"): string {
	const storage = getBotOauthSessionStorage();
	if (!storage) {
		return isSafeRedirectPath(fallback) ? fallback : "/";
	}
	const stored = storage.getItem(BOT_OAUTH_NEXT_STORAGE_KEY);
	storage.removeItem(BOT_OAUTH_NEXT_STORAGE_KEY);
	return stored && isSafeRedirectPath(stored)
		? stored
		: isSafeRedirectPath(fallback)
			? fallback
			: "/";
}

export function peekBotOauthNext(): string | null {
	return getBotOauthSessionStorage()?.getItem(BOT_OAUTH_NEXT_STORAGE_KEY) ?? null;
}

export function normalizeBotApiBaseUrl(apiBaseUrl: string | undefined | null): string {
	return String(apiBaseUrl || "").replace(/\/$/, "");
}
