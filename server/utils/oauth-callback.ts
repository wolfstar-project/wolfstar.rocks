/**
 * Discord is registered against `<site>/oauth/callback`, not Better Auth's own
 * `/api/auth/callback/discord`. Better Auth supports this: both the
 * authorization request and the token exchange read `options.redirectURI` first
 * (`options.redirectURI || redirectURI` in `create-authorization-url` and
 * `validate-authorization-code`), so the two sides stay consistent as long as
 * the provider is configured with the same absolute URL.
 *
 * What Better Auth does *not* do is serve a route at `/oauth/callback`, so
 * `server/middleware/oauth-callback.ts` forwards the provider's response to the
 * real callback endpoint. Everything in this file exists to keep those three
 * places — the provider options, the middleware, and the Discord Developer
 * Portal — describing one single URL.
 */

/** App-side path Discord redirects to. Must match the Developer Portal entry. */
export const OAUTH_PROVIDER_CALLBACK_PATH = "/oauth/callback";

/** Better Auth's own callback route, mounted under the module's `/api/auth` base path. */
export const BETTER_AUTH_DISCORD_CALLBACK_PATH = "/api/auth/callback/discord";

/**
 * Builds the absolute redirect URI handed to Discord.
 *
 * Derived from the resolved site origin rather than read from its own
 * environment variable: a separate variable can drift from
 * `NUXT_PUBLIC_SITE_URL`, and when it does, Better Auth silently falls back to
 * `/api/auth/callback/discord` while Discord still expects `/oauth/callback` —
 * which fails the authorization request with no useful error.
 *
 * Returns `undefined` when no origin is available (a non-request context such
 * as a build task), letting Better Auth use its own default; sign-in only ever
 * runs inside a request, where an origin always exists.
 */
export function resolveDiscordRedirectURI(origin: string | undefined | null): string | undefined {
	if (!origin) {
		return undefined;
	}

	try {
		return new URL(OAUTH_PROVIDER_CALLBACK_PATH, origin).toString();
	} catch {
		return undefined;
	}
}

/**
 * Returns the Better Auth callback URL only for a response sent by the OAuth
 * provider.
 *
 * Discord always echoes `state` back alongside either `code` (success) or
 * `error` (the user declined, or the request was rejected). Better Auth's own
 * post-sign-in redirect lands on the same path carrying `next`/`error` but
 * never `state`, so it falls through to the Vue callback page instead of being
 * bounced into the auth handler a second time.
 */
export function resolveOAuthProviderCallbackRedirect(query: URLSearchParams): string | null {
	if (!query.has("state")) {
		return null;
	}
	if (!query.has("code") && !query.has("error")) {
		return null;
	}

	return `${BETTER_AUTH_DISCORD_CALLBACK_PATH}?${query.toString()}`;
}
