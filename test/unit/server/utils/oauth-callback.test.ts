import {
	isOAuthCallbackPath,
	resolveOAuthProviderCallbackRedirect,
} from "#server/utils/oauth-callback";
import { describe, expect, it } from "vitest";

describe("isOAuthCallbackPath", () => {
	it("matches the bare callback path", () => {
		expect(isOAuthCallbackPath("/oauth/callback")).toBe(true);
	});

	it("matches when h3 includes the OAuth query string on event.path", () => {
		expect(isOAuthCallbackPath("/oauth/callback?code=abc&state=xyz")).toBe(true);
	});

	it("rejects other paths", () => {
		expect(isOAuthCallbackPath("/oauth/callback/extra")).toBe(false);
		expect(isOAuthCallbackPath("/api/auth/callback/discord")).toBe(false);
		expect(isOAuthCallbackPath(undefined)).toBe(false);
	});
});

describe("resolveOAuthProviderCallbackRedirect", () => {
	it("forwards the provider callback to Better Auth", () => {
		const query = new URLSearchParams({ code: "authorization-code", state: "oauth-state" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBe(
			"/api/auth/callback/discord?code=authorization-code&state=oauth-state",
		);
	});

	it("allows the completed sign-in to render the callback page", () => {
		const query = new URLSearchParams({ next: "/guilds/123" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});

	it("does not forward a callback without OAuth state", () => {
		const query = new URLSearchParams({ code: "authorization-code", next: "/" });

		expect(resolveOAuthProviderCallbackRedirect(query)).toBeNull();
	});
});
