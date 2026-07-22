import {
	BOT_OAUTH_NEXT_STORAGE_KEY,
	BOT_OAUTH_SCOPES,
	buildBotDiscordAuthorizeUrl,
	isBotOauthSilentAuthError,
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

		expect(url).toContain("https://discord.com/oauth2/authorize?");
		expect(url).toContain("client_id=123456789012345678");
		expect(url).toContain("response_type=code");
		expect(url).toContain("prompt=none");
		expect(url).toContain(`scope=${encodeURIComponent(BOT_OAUTH_SCOPES)}`);
		expect(url).toContain(
			`redirect_uri=${encodeURIComponent("http://localhost:3000/oauth/callback")}`,
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

	it("exports a stable sessionStorage key", () => {
		expect(BOT_OAUTH_NEXT_STORAGE_KEY).toBe("wolfstar:bot-oauth-next");
	});
});
