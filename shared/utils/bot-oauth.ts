import { isSafeRedirectPath } from "#shared/utils/redirect";
import { withQuery } from "ufo";

/** sessionStorage key for the post-login redirect during the sapphire bot OAuth bridge. */
export const BOT_OAUTH_NEXT_STORAGE_KEY = "wolfstar:bot-oauth-next";

/** Discord scopes for the sapphire-plugin-api OAuth cookie (includes `identify` explicitly). */
export const BOT_OAUTH_SCOPES = "identify guilds guilds.members.read email";

export type BotOauthPrompt = "none" | "consent";

/** Authorize URL whose `code` the browser POSTs to `${apiBaseUrl}/oauth/callback`. */
export function buildBotDiscordAuthorizeUrl(options: {
	clientId: string;
	redirectUri: string;
	prompt?: BotOauthPrompt;
}): string {
	return withQuery("https://discord.com/oauth2/authorize", {
		client_id: options.clientId,
		prompt: options.prompt ?? "none",
		redirect_uri: options.redirectUri,
		response_type: "code",
		scope: BOT_OAUTH_SCOPES,
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
		return fallback;
	}
	const stored = storage.getItem(BOT_OAUTH_NEXT_STORAGE_KEY);
	storage.removeItem(BOT_OAUTH_NEXT_STORAGE_KEY);
	return stored && isSafeRedirectPath(stored) ? stored : fallback;
}

export function peekBotOauthNext(): string | null {
	return getBotOauthSessionStorage()?.getItem(BOT_OAUTH_NEXT_STORAGE_KEY) ?? null;
}

export function normalizeBotApiBaseUrl(apiBaseUrl: string | undefined | null): string {
	return String(apiBaseUrl || "").replace(/\/$/, "");
}
