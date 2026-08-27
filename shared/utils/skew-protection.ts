/**
 * Shared helpers for the `nuxt-skew-protection` integration.
 *
 * Kept free of Nuxt/Vue imports so both the Nitro handler wrapper and the client
 * plugin can use them, and so the branching is unit-testable without an app.
 */

/**
 * Response header `defineWrappedResponseHandler` sets alongside its 409 when it
 * rejects a request coming from a build that no longer matches the server.
 */
export const CLIENT_OUTDATED_HEADER = "x-client-outdated";

/** Cookie name `nuxt-skew-protection` derives for a root-mounted app. */
export const DEFAULT_SKEW_COOKIE_NAME = "__nkpv";

/** The module's own default retention for the version cookie (7 days). */
export const DEFAULT_SKEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const SAME_SITE_VALUES = ["lax", "none", "strict"] as const;

export type SkewCookieSameSite = (typeof SAME_SITE_VALUES)[number];

/**
 * Shape of `runtimeConfig.public.skewProtection.cookie`. Nuxt generates its
 * `sameSite` as a plain `string`, so it has to be narrowed before it can be
 * handed to `useCookie()`.
 */
export interface SkewCookieRuntimeConfig {
	name?: string;
	path?: string;
	maxAge?: number;
	sameSite?: string;
	domain?: string;
	secure?: boolean;
}

export interface ResolvedSkewCookie {
	name: string;
	options: {
		domain: string | undefined;
		maxAge: number;
		path: string;
		sameSite: SkewCookieSameSite;
		secure: boolean | undefined;
	};
}

function toSameSite(value: string | undefined): SkewCookieSameSite {
	return SAME_SITE_VALUES.find((candidate) => candidate === value) ?? "lax";
}

/**
 * Normalize the module's published cookie config into `useCookie()` options.
 *
 * The attributes have to match the ones the module's Nitro middleware writes:
 * a differing `path`/`domain` makes the browser store a second cookie instead of
 * overwriting the existing one, and the stale value would keep winning.
 */
export function resolveSkewCookie(config?: SkewCookieRuntimeConfig): ResolvedSkewCookie {
	return {
		name: config?.name || DEFAULT_SKEW_COOKIE_NAME,
		options: {
			domain: config?.domain,
			maxAge: config?.maxAge ?? DEFAULT_SKEW_COOKIE_MAX_AGE,
			path: config?.path || "/",
			sameSite: toSameSite(config?.sameSite),
			secure: config?.secure,
		},
	};
}

/** True when a response is the 409 the server sends to an outdated client. */
export function isClientOutdatedResponse(response: Pick<Response, "status" | "headers">): boolean {
	return response.status === 409 && response.headers.get(CLIENT_OUTDATED_HEADER) !== null;
}
