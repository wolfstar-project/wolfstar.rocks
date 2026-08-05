import {
	isOAuthCallbackPath,
	resolveOAuthProviderCallbackRedirect,
} from "#server/utils/oauth-callback";

export default defineEventHandler((event) => {
	// Gate on `event.path` first: `getRequestURL()` can throw `TypeError: Invalid URL`
	// during Nitro prerender (and some h3 v2 request shapes) when Host/url are incomplete.
	// Strip the query string — h3 v1 includes it in `event.path`.
	if (!isOAuthCallbackPath(event.path)) {
		return;
	}

	const query = getQuery(event);
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (typeof value === "string") {
			searchParams.set(key, value);
		} else if (Array.isArray(value)) {
			for (const entry of value) {
				if (typeof entry === "string") {
					searchParams.append(key, entry);
				}
			}
		}
	}

	const redirectURL = resolveOAuthProviderCallbackRedirect(searchParams);
	if (redirectURL) {
		return sendRedirect(event, redirectURL);
	}
});
