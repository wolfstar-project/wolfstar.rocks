import type { DiscordOptions, DiscordProfile } from "better-auth/social-providers";

/** Discord OAuth credentials as they arrive from `runtimeConfig.discord`. */
export interface DiscordProviderCredentials {
	clientId: string;
	clientSecret: string;
	/**
	 * Absolute redirect URI registered on the Discord application, built by
	 * `resolveDiscordRedirectURI()` from the resolved site origin. Omitted only
	 * outside a request context, where Better Auth's own default applies.
	 */
	redirectURI?: string | undefined;
}

/**
 * Scopes requested on top of Better Auth's Discord defaults (`identify`, `email`).
 *
 * `guilds` is required for GET /users/@me/guilds (the dashboard guild list);
 * `guilds.members.read` only covers per-guild member lookups.
 */
export const DISCORD_OAUTH_SCOPES = ["guilds", "guilds.members.read"] as const;

/**
 * Builds the Better Auth Discord social-provider options.
 *
 * Kept out of `server/auth.config.ts` so the authorization request it produces
 * stays unit-testable: that file reads Nitro auto-imports at module scope and
 * cannot be imported outside a Nitro runtime.
 */
export function createDiscordProviderOptions(
	credentials: DiscordProviderCredentials,
): DiscordOptions {
	return {
		clientId: credentials.clientId,
		clientSecret: credentials.clientSecret,
		// Spread, not a plain assignment: Better Auth resolves the redirect URI as
		// `options.redirectURI || redirectURI`, so an explicit `undefined` is fine
		// but an empty string would silently fall back to
		// `/api/auth/callback/discord` — a URL Discord has not registered, which
		// fails the authorization request instead of erroring here.
		...(credentials.redirectURI ? { redirectURI: credentials.redirectURI } : {}),
		// Better Auth's Discord provider sends `prompt=none` unless overridden.
		// Discord can only skip the authorization screen when the user has already
		// approved exactly the scopes being requested; otherwise it answers the
		// authorization request with an error instead of a code. Since `guilds` was
		// added to the scope set, no existing grant covers it — and a first-time
		// user has no grant at all — so `prompt=none` fails every sign-in. Always
		// ask for consent instead.
		prompt: "consent",
		scope: [...DISCORD_OAUTH_SCOPES],
		// No `id` here: since Better Auth 1.7 the provider account identity comes
		// from the provider's own `accountSubject` (the Discord snowflake) and
		// `OAuthMappedUser` forbids the field, so setting it only looks like it
		// pins the session user id while being ignored.
		mapProfileToUser: (profile: DiscordProfile) => ({
			name: profile.global_name ?? profile.username,
			email: profile.email ?? "",
			image: profile.image_url,
		}),
		overrideUserInfoOnSignIn: true,
	};
}
