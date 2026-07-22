import {
	BOT_OAUTH_NEXT_STORAGE_KEY,
	BOT_OAUTH_SCOPES,
	buildBotDiscordAuthorizeUrl,
	consumeBotOauthNext,
	isBotOauthSilentAuthError,
	normalizeBotApiBaseUrl,
	peekBotOauthNext,
	rememberBotOauthNext,
	resolveBotOauthRedirectUri,
} from "#shared/utils/bot-oauth";
import { describe, expect, it } from "vitest";

describe("bot-oauth utils", () => {
	it("builds the Discord authorize URL for the sapphire bridge", () => {
		const url = buildBotDiscordAuthorizeUrl({
			clientId: "123456789012345678",
			prompt: "none",
			redirectUri: "http://localhost:3000/oauth/callback",
		});

		const parsed = new URL(url);
		expect(parsed.origin + parsed.pathname).toBe("https://discord.com/oauth2/authorize");
		expect(parsed.searchParams.get("client_id")).toBe("123456789012345678");
		expect(parsed.searchParams.get("response_type")).toBe("code");
		expect(parsed.searchParams.get("prompt")).toBe("none");
		expect(parsed.searchParams.get("scope")).toBe(BOT_OAUTH_SCOPES);
		expect(parsed.searchParams.get("redirect_uri")).toBe(
			"http://localhost:3000/oauth/callback",
		);
	});

	it("resolves the frontend oauth callback redirect URI", () => {
		expect(resolveBotOauthRedirectUri("http://localhost:3000/")).toBe(
			"http://localhost:3000/oauth/callback",
		);
		expect(resolveBotOauthRedirectUri("https://wolfstar.rocks")).toBe(
			"https://wolfstar.rocks/oauth/callback",
		);
	});

	it("detects silent OAuth errors that can be retried with consent", () => {
		expect(isBotOauthSilentAuthError("consent_required")).toBe(true);
		expect(isBotOauthSilentAuthError("interaction_required")).toBe(true);
		expect(isBotOauthSilentAuthError("login_required")).toBe(true);
		expect(isBotOauthSilentAuthError("access_denied")).toBe(false);
		expect(isBotOauthSilentAuthError(null)).toBe(false);
	});

	it("normalizes bot API base URLs", () => {
		expect(normalizeBotApiBaseUrl("http://localhost:8282/")).toBe("http://localhost:8282");
		expect(normalizeBotApiBaseUrl(undefined)).toBe("");
	});

	it("no-ops sessionStorage helpers outside the browser", () => {
		expect(BOT_OAUTH_NEXT_STORAGE_KEY).toBe("wolfstar:bot-oauth-next");
		rememberBotOauthNext("/profile");
		expect(peekBotOauthNext()).toBeNull();
		expect(consumeBotOauthNext("/guilds")).toBe("/guilds");
	});
});
