import {
	buildBotDiscordAuthorizeUrl,
	normalizeBotApiBaseUrl,
	resolveBotOauthRedirectUri,
	type BotOauthPrompt,
} from "#shared/utils/bot-oauth";

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

/**
 * Discord authorize URL for the sapphire bot OAuth bridge
 * (`POST ${apiBaseUrl}/oauth/callback`).
 */
export function buildBotOauthAuthorizeUrl(prompt: BotOauthPrompt = "none"): string {
	return buildBotDiscordAuthorizeUrl({
		clientId: requireDiscordClientId(),
		prompt,
		redirectUri: getBotOauthRedirectUri(),
	});
}

/**
 * Exchange the Discord OAuth code with the bot API. The response Set-Cookie
 * attaches `SAPPHIRE_AUTH` to the API origin (e.g. localhost:8282).
 */
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

/** True when the browser already has a valid sapphire session cookie. */
export async function hasBotOauthSession(): Promise<boolean> {
	const base = normalizeBotApiBaseUrl(getApiBaseUrl());
	if (!base) {
		return false;
	}
	try {
		await $fetch(`${base}/users/@me`, {
			credentials: "include",
			method: "GET",
		});
		return true;
	} catch {
		return false;
	}
}

/** Clear the sapphire cookie on the bot API origin. */
export async function logoutBotOauth(): Promise<void> {
	const base = normalizeBotApiBaseUrl(getApiBaseUrl());
	if (!base) {
		return;
	}
	try {
		await $fetch(`${base}/oauth/logout`, {
			credentials: "include",
			method: "POST",
		});
	} catch {
		// Best-effort: dashboard sign-out should still clear better-auth.
	}
}
