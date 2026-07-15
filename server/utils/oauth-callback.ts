const AUTH_CALLBACK_PATH = "/api/auth/callback/discord";

/**
 * Returns the Better Auth callback URL only for a response sent by the OAuth
 * provider. Browser navigations after Better Auth completes have no state and
 * are allowed through to the Vue callback page.
 */
export function resolveOAuthProviderCallbackRedirect(query: URLSearchParams): string | null {
	return query.has("state") ? `${AUTH_CALLBACK_PATH}?${query.toString()}` : null;
}
