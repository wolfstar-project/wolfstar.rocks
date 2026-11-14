/**
 * Trusted-origin resolution for Better Auth.
 *
 * Better Auth validates `Origin`/`Referer` on every cookie-bound request and
 * rejects anything not in `trustedOrigins`. The production hostnames are known
 * up front, but the checks run per request against host patterns, so a
 * subdomain of the site signs in without being listed one by one.
 *
 * `@nuxtjs/better-auth` caches the Better Auth instance (keyed on `__explicit__`
 * once `runtimeConfig.public.siteUrl` is set), so a request-derived origin
 * captured at construction time would be frozen into that shared instance. The
 * function form of `trustedOrigins` is evaluated per request instead, which is
 * why the resolver below takes the request rather than a captured origin.
 */

/**
 * Host patterns allowed to run the auth flow. `*` matches a single label, so
 * `*.wolfstar.rocks` covers `beta.` and `main.` but not a nested attacker
 * subdomain.
 */
const TRUSTED_HOST_PATTERNS = [
	"localhost",
	"127.0.0.1",
	"wolfstar.rocks",
	"*.wolfstar.rocks",
] as const;

/**
 * Origins that must be trusted even when no request is available (for example
 * when Better Auth resolves origins outside a request context).
 */
export const STATIC_TRUSTED_ORIGINS = [
	"http://localhost:3000",
	"https://wolfstar.rocks",
	"https://main.wolfstar.rocks",
	"https://beta.wolfstar.rocks",
] as const;

/**
 * Matches a hostname against a pattern where `*` stands for exactly one label.
 * Ports are never part of the comparison; the caller strips them first.
 */
export function matchesHostPattern(hostname: string, pattern: string): boolean {
	if (!hostname || !pattern) {
		return false;
	}
	if (!pattern.includes("*")) {
		return hostname === pattern;
	}

	const patternLabels = pattern.split(".");
	const hostLabels = hostname.split(".");
	if (patternLabels.length !== hostLabels.length) {
		return false;
	}

	return patternLabels.every((label, index) => label === "*" || label === hostLabels[index]);
}

/** True when `origin` is a well-formed URL whose host is covered by the allowlist. */
export function isTrustedOrigin(
	origin: string | null | undefined,
	patterns: readonly string[] = TRUSTED_HOST_PATTERNS,
): boolean {
	if (!origin) {
		return false;
	}

	let hostname: string;
	try {
		hostname = new URL(origin).hostname;
	} catch {
		return false;
	}

	return patterns.some((pattern) => matchesHostPattern(hostname, pattern));
}

/** Extracts the origin of a `Request`, or `undefined` when it cannot be parsed. */
function getRequestOrigin(request: Request | undefined): string | undefined {
	if (!request?.url) {
		return undefined;
	}
	try {
		return new URL(request.url).origin;
	} catch {
		return undefined;
	}
}

/**
 * Builds the `trustedOrigins` list for a single request: the static deployment
 * origins, plus the request's own origin when its host is on the allowlist.
 */
export function resolveTrustedOrigins(request?: Request): string[] {
	const origins = new Set<string>(STATIC_TRUSTED_ORIGINS);

	const requestOrigin = getRequestOrigin(request);
	if (requestOrigin && isTrustedOrigin(requestOrigin)) {
		origins.add(requestOrigin);
	}

	return [...origins];
}

/** The production site, whose subdomains share its sign-in. */
const SHARED_COOKIE_DOMAIN = "wolfstar.rocks";

/**
 * The domain the auth cookies are set on, or none to keep them on the host
 * that set them. Discord sends every sign-in back to the site URL, so a
 * host-only state cookie set on another host of the domain would be missing
 * there: on production the cookies cover the whole domain. Other sites, such
 * as the beta Worker or localhost, keep host-only cookies: their sessions must
 * not reach production's hosts.
 */
export function resolveAuthCookieDomain(siteUrl: string | undefined | null): string | undefined {
	if (!siteUrl) return undefined;
	try {
		return new URL(siteUrl).hostname === SHARED_COOKIE_DOMAIN
			? SHARED_COOKIE_DOMAIN
			: undefined;
	} catch {
		return undefined;
	}
}

/**
 * The auth cookies a request carries, by name: each of `names`, and the chunks
 * (`name.0`, `name.1`, …) Better Auth splits a long cookie into. On production
 * these may include host-only copies set before the cookies covered the whole
 * domain. The header cannot tell the two kinds apart, so the caller expires a
 * host-only cookie under each name; the shared one, set with a `Domain`, is a
 * different cookie and stays.
 */
export function hostOnlyAuthCookies(
	cookieHeader: string | null,
	names: readonly string[],
): string[] {
	if (!cookieHeader) return [];
	const found: string[] = [];
	for (const pair of cookieHeader.split(";")) {
		const name = pair.split("=", 1)[0]?.trim() ?? "";
		const base = name.replace(/\.\d+$/, "");
		if (names.includes(base) && !found.includes(name)) found.push(name);
	}
	return found;
}
