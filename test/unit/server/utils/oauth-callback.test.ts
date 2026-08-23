import { resolveOAuthProviderCallbackRedirect } from "#server/utils/oauth-callback";
import { describe, expect, it } from "vitest";

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
