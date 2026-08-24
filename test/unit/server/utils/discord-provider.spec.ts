import type { DiscordProfile } from "better-auth/social-providers";
import { createDiscordProviderOptions } from "#server/utils/discord/provider";
import { discord } from "better-auth/social-providers";
import { describe, expect, it } from "vitest";

/** The app-side callback URL registered on the Discord application. */
const REGISTERED_URI = "https://wolfstar.rocks/oauth/callback";

/** What Better Auth would use on its own, absent an explicit `redirectURI`. */
const BETTER_AUTH_DEFAULT_URI = "https://wolfstar.rocks/api/auth/callback/discord";

const credentials = {
	clientId: "discord-client-id",
	clientSecret: "discord-client-secret",
	redirectURI: REGISTERED_URI,
};

/**
 * Builds the authorization URL exactly as Better Auth does during
 * `POST /api/auth/sign-in/social`, so these assertions cover what the browser
 * is actually sent to Discord with.
 */
async function createAuthorizationURL(overrides: Partial<typeof credentials> = {}) {
	const provider = discord(createDiscordProviderOptions({ ...credentials, ...overrides }));

	// Better Auth passes its own default here; `options.redirectURI` wins when set.
	return provider.createAuthorizationURL({
		state: "oauth-state",
		redirectURI: BETTER_AUTH_DEFAULT_URI,
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

	it("sends the app-side redirect URI Discord has registered", async () => {
		// `/oauth/callback` is an app page, forwarded into Better Auth by
		// `server/middleware/oauth-callback.ts`. Better Auth replays the same
		// `options.redirectURI` during the token exchange, so both legs agree.
		const url = await createAuthorizationURL();

		expect(url.searchParams.get("redirect_uri")).toBe(REGISTERED_URI);
		expect(url.searchParams.get("client_id")).toBe(credentials.clientId);
	});

	it("falls back to Better Auth's own callback when no redirect URI is resolvable", async () => {
		// Only reachable outside a request context, where no origin exists.
		expect(
			createDiscordProviderOptions({ ...credentials, redirectURI: undefined }),
		).not.toHaveProperty("redirectURI");

		const url = await createAuthorizationURL({ redirectURI: undefined });

		expect(url.searchParams.get("redirect_uri")).toBe(BETTER_AUTH_DEFAULT_URI);
	});

	it("never sends an empty redirect URI", async () => {
		// An empty string is falsy for Better Auth, so it would silently swap in
		// `/api/auth/callback/discord` — a URL Discord has not registered.
		const url = await createAuthorizationURL({ redirectURI: "" });

		expect(url.searchParams.get("redirect_uri")).toBe(BETTER_AUTH_DEFAULT_URI);
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
