import {
	BETTER_AUTH_DISCORD_CALLBACK_PATH,
	OAUTH_PROVIDER_CALLBACK_PATH,
	resolveDiscordRedirectURI,
	resolveOAuthProviderCallbackRedirect,
} from "#server/utils/oauth-callback";
import { describe, expect, it } from "vitest";

describe("resolveDiscordRedirectURI", () => {
	it("builds the app-side callback URL registered on the Discord application", () => {
		expect(resolveDiscordRedirectURI("https://wolfstar.rocks")).toBe(
			"https://wolfstar.rocks/oauth/callback",
		);
		expect(resolveDiscordRedirectURI("http://localhost:3000")).toBe(
			"http://localhost:3000/oauth/callback",
		);
	});

	it("replaces any path already on the origin", () => {
		// The module can hand over a URL with a trailing path; only the origin matters.
		expect(resolveDiscordRedirectURI("https://wolfstar.rocks/some/path")).toBe(
			"https://wolfstar.rocks/oauth/callback",
		);
	});

	it("returns undefined when no usable origin is available", () => {
		// Better Auth then falls back to its own default, which only happens
		// outside a request context where sign-in never runs.
		expect(resolveDiscordRedirectURI(undefined)).toBeUndefined();
		expect(resolveDiscordRedirectURI(null)).toBeUndefined();
		expect(resolveDiscordRedirectURI("")).toBeUndefined();
		expect(resolveDiscordRedirectURI("not a url")).toBeUndefined();
	});
});

describe("resolveOAuthProviderCallbackRedirect", () => {
	it("forwards a successful provider callback to Better Auth", () => {
		const query = new URLSearchParams({ code: "authorization-code", state: "oauth-state" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBe(
			`${BETTER_AUTH_DISCORD_CALLBACK_PATH}?code=authorization-code&state=oauth-state`,
		);
	});

	it("forwards a denied authorization so Better Auth can render the failure", () => {
		// Discord answers a declined consent screen with `error` + `state`, never `code`.
		const query = new URLSearchParams({ error: "access_denied", state: "oauth-state" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBe(
			`${BETTER_AUTH_DISCORD_CALLBACK_PATH}?error=access_denied&state=oauth-state`,
		);
	});

	it("allows the completed sign-in to render the callback page", () => {
		// Better Auth redirects back here with `next` after setting the session
		// cookie; forwarding that into the auth handler again would loop.
		const query = new URLSearchParams({ next: "/guilds/123" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});

	it("lets an error rendered by the callback page through", () => {
		const query = new URLSearchParams({ error: "SESSION_EXPIRED" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});

	it("does not forward a callback without OAuth state", () => {
		const query = new URLSearchParams({ code: "authorization-code", next: "/" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});

	it("does not forward bare state without a provider result", () => {
		const query = new URLSearchParams({ state: "oauth-state" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});

	it("keeps the two callback paths distinct", () => {
		// A forward onto the same path would be an infinite redirect loop.
		expect(BETTER_AUTH_DISCORD_CALLBACK_PATH).not.toBe(OAUTH_PROVIDER_CALLBACK_PATH);
	});
});
