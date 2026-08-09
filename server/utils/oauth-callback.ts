const AUTH_CALLBACK_PATH = "/api/auth/callback/discord";
const OAUTH_CALLBACK_PATH = "/oauth/callback";

/**
 * h3 v1 `event.path` is `req.url` and includes the query string. Compare only
 * the pathname so real OAuth callbacks (`?code=&state=`) still match.
 */
export function isOAuthCallbackPath(path: string | undefined): boolean {
	const raw = path ?? "";
	const queryIndex = raw.indexOf("?");
	const pathname = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
	return pathname === OAUTH_CALLBACK_PATH;
}

/**
 * Returns the Better Auth callback URL only for a response sent by the OAuth
 * provider. Browser navigations after Better Auth completes have no state and
 * are allowed through to the Vue callback page.
 */
export function resolveOAuthProviderCallbackRedirect(query: URLSearchParams): string | null {
	return query.has("state") ? `${AUTH_CALLBACK_PATH}?${query.toString()}` : null;
}
