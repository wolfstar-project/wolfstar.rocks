import {
	buildBotDiscordAuthorizeUrl,
	normalizeBotApiBaseUrl,
	resolveBotOauthRedirectUri,
	type BotOauthPrompt,
} from "#shared/utils/bot-oauth";

const BOT_OAUTH_SESSION_TIMEOUT_MS = 3_000;

function getBotOauthRedirectUri(): string {
	if (import.meta.client) {
		return resolveBotOauthRedirectUri(window.location.origin);
	}
	return resolveBotOauthRedirectUri(useRequestURL().origin);
}

function requireBotApiBaseUrl(): string {
	const base = normalizeBotApiBaseUrl(getApiBaseUrl());
	if (!base) {
		throw new Error("Bot API base URL is not configured");
	}
	return base;
}

function requireDiscordClientId(): string {
	const clientId = getClientId();
	if (!clientId) {
		throw new Error("Discord client id is not configured");
	}
	return String(clientId);
}

export function buildBotOauthAuthorizeUrl(prompt: BotOauthPrompt = "none", next = "/"): string {
	return buildBotDiscordAuthorizeUrl({
		clientId: requireDiscordClientId(),
		next,
		prompt,
		redirectUri: getBotOauthRedirectUri(),
	});
}

/** POST Discord `code` to the bot API; Set-Cookie attaches `SAPPHIRE_AUTH` on that origin. */
export async function completeBotOauthCallback(code: string) {
	return await $fetch(`${requireBotApiBaseUrl()}/oauth/callback`, {
		body: {
			clientId: requireDiscordClientId(),
			code,
			redirectUri: getBotOauthRedirectUri(),
		},
		credentials: "include",
		method: "POST",
	});
}

export async function hasBotOauthSession(): Promise<boolean> {
	const base = normalizeBotApiBaseUrl(getApiBaseUrl());
	if (!base) {
		return false;
	}
	try {
		await $fetch(`${base}/users/@me`, {
			credentials: "include",
			method: "GET",
			signal: AbortSignal.timeout(BOT_OAUTH_SESSION_TIMEOUT_MS),
		});
		return true;
	} catch {
		return false;
	}
}

export async function logoutBotOauth(): Promise<void> {
	const base = normalizeBotApiBaseUrl(getApiBaseUrl());
	if (!base) {
		return;
	}
	try {
		await $fetch(`${base}/oauth/logout`, {
			credentials: "include",
			method: "POST",
			signal: AbortSignal.timeout(BOT_OAUTH_SESSION_TIMEOUT_MS),
		});
	} catch {
		// Best-effort: dashboard sign-out should still clear better-auth.
	}
}
