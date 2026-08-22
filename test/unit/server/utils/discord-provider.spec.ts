import type { DiscordProfile } from "better-auth/social-providers";
import { createDiscordProviderOptions } from "#server/utils/discord/provider";
import { discord } from "better-auth/social-providers";
import { describe, expect, it } from "vitest";

const credentials = {
	clientId: "discord-client-id",
	clientSecret: "discord-client-secret",
	redirectURI: "https://wolfstar.rocks/oauth/callback",
};

/**
 * Builds the authorization URL exactly as Better Auth does during
 * `POST /api/auth/sign-in/social`, so these assertions cover what the browser
 * is actually sent to Discord with.
 */
async function createAuthorizationURL() {
	const provider = discord(createDiscordProviderOptions(credentials));

	return provider.createAuthorizationURL({
		state: "oauth-state",
		redirectURI: "https://wolfstar.rocks/api/auth/callback/discord",
	});
}

describe("createDiscordProviderOptions", () => {
	it("asks Discord for consent instead of a silent authorization", async () => {
		// `prompt=none` (Better Auth's Discord default) makes Discord answer with an
		// error whenever the user has not already approved every requested scope, so
		// it breaks first-time sign-in and any sign-in after the scope set changes.
		const url = await createAuthorizationURL();

		expect(url.searchParams.get("prompt")).toBe("consent");
	});

	it("requests the guild scopes the dashboard needs, without duplicates", async () => {
		const url = await createAuthorizationURL();
		const scopes = url.searchParams.get("scope")?.split(" ") ?? [];

		expect(scopes).toContain("guilds");
		expect(scopes).toContain("guilds.members.read");
		expect(scopes).toContain("email");
		expect(scopes).toStrictEqual([...new Set(scopes)]);
	});

	it("keeps the configured redirect URI Discord has registered", async () => {
		const url = await createAuthorizationURL();

		expect(url.searchParams.get("redirect_uri")).toBe(credentials.redirectURI);
		expect(url.searchParams.get("client_id")).toBe(credentials.clientId);
	});

	it("maps the Discord profile onto the session user", () => {
		const options = createDiscordProviderOptions(credentials);
		const profile: DiscordProfile = {
			id: "242043489611808769",
			username: "wolfstar",
			discriminator: "0",
			global_name: "WolfStar",
			avatar: "hash",
			mfa_enabled: true,
			banner: null,
			accent_color: null,
			locale: "en-US",
			verified: true,
			email: "wolfstar@example.com",
			flags: 0,
			premium_type: 0,
			public_flags: 0,
			display_name: "WolfStar",
			avatar_decoration: null,
			banner_color: null,
			image_url: "https://cdn.discordapp.com/avatars/242043489611808769/hash.png",
		};

		// `id` is deliberately absent: Better Auth resolves the provider account id
		// from `accountSubject`, and `OAuthMappedUser` types the field as `never`.
		expect(options.mapProfileToUser?.(profile)).toStrictEqual({
			name: "WolfStar",
			email: "wolfstar@example.com",
			image: "https://cdn.discordapp.com/avatars/242043489611808769/hash.png",
		});
	});
});
