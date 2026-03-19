/**
 * Shared route mock handlers for WolfStar dashboard API requests.
 *
 * This module contains the URL matching and response generation logic used by:
 * - Lighthouse CI puppeteer setup (lighthouse-setup.cjs)
 *
 * It is intentionally written as CJS so it can be required from the CJS
 * Lighthouse setup script and imported from ESM test utilities.
 *
 * All patterns target the local preview server (http://localhost:3000).
 */

"use strict";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a JSON MockResponse.
 *
 * @param {unknown} data
 * @param {number} [status]
 * @returns {{ status: number, contentType: string, body: string }}
 */
function json(data, status = 200) {
	return {
		status,
		contentType: "application/json",
		body: JSON.stringify(data),
	};
}

/**
 * Check if a URL matches a simple glob pattern like "http://localhost:3000/**".
 *
 * @param {string} url
 * @param {string} pattern
 * @returns {boolean}
 */
function urlMatchesPattern(url, pattern) {
	if (pattern.endsWith("/**")) {
		const prefix = pattern.slice(0, -2); // keep trailing /
		return url.startsWith(prefix);
	}
	return url === pattern;
}

// ---------------------------------------------------------------------------
// Per-domain matchers
// ---------------------------------------------------------------------------

/**
 * nuxt-auth-utils sealed-session endpoint.
 * Returns an empty session object so every public page renders in the
 * unauthenticated state without triggering redirect loops or hydration
 * mismatches from missing cookies.
 *
 * @param {string} _urlString
 * @returns {{ status: number, contentType: string, body: string }}
 */
function matchAuthSession(_urlString) {
	return json({});
}

/**
 * User + guilds endpoint consumed by the useUser composable.
 * Returns 401 so the app gracefully falls back to the guest state
 * instead of hanging indefinitely waiting for a real auth token.
 *
 * @param {string} _urlString
 * @returns {{ status: number, contentType: string, body: string }}
 */
function matchUsersApi(_urlString) {
	return json({ message: "Unauthorized", statusCode: 401 }, 401);
}

/**
 * Guild-specific endpoints (settings, channels, roles, members…).
 * All require authentication – return 401 for every sub-path so dashboard
 * pages audited while logged-out don't hang on pending requests.
 *
 * @param {string} _urlString
 * @returns {{ status: number, contentType: string, body: string }}
 */
function matchGuildsApi(_urlString) {
	return json({ message: "Unauthorized", statusCode: 401 }, 401);
}

// ---------------------------------------------------------------------------
// Route table
// ---------------------------------------------------------------------------

/**
 * Route definitions mapping URL patterns to their matchers.
 * Each entry has a `name` (for logging), `pattern` (CDP Fetch urlPattern)
 * and a `match` function that returns a MockResponse.
 *
 * @type {Array<{ name: string; pattern: string; match: (url: string) => { status: number, contentType: string, body: string } | null }>}
 */
const routes = [
	{
		name: "auth session",
		pattern: "http://localhost:3000/_auth/session",
		match: matchAuthSession,
	},
	{
		name: "users API",
		pattern: "http://localhost:3000/api/users",
		match: matchUsersApi,
	},
	{
		name: "guilds API",
		pattern: "http://localhost:3000/api/guilds/**",
		match: matchGuildsApi,
	},
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Try to match a URL against all known routes and return a mock response.
 *
 * @param {string} url - The full request URL
 * @returns {{ name: string; response: { status: number, contentType: string, body: string } } | null}
 */
function matchRoute(url) {
	for (const route of routes) {
		if (urlMatchesPattern(url, route.pattern)) {
			const response = route.match(url);
			if (response) {
				return { name: route.name, response };
			}
			// URL matches the domain pattern but handler returned null => unmocked
			return null;
		}
	}
	return null;
}

/**
 * Check if a URL belongs to any of the known intercepted routes.
 *
 * @param {string} url
 * @returns {string | null} The route name if matched, null otherwise
 */
function getExternalApiName(url) {
	for (const route of routes) {
		if (urlMatchesPattern(url, route.pattern)) {
			return route.name;
		}
	}
	return null;
}

module.exports = { getExternalApiName, matchRoute, routes };
