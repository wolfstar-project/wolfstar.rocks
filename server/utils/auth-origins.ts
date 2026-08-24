/**
 * Trusted-origin resolution for Better Auth.
 *
 * Better Auth validates `Origin`/`Referer` on every cookie-bound request and
 * rejects anything not in `trustedOrigins`. The production hostnames are known
 * up front, but Netlify deploy previews get a generated hostname per branch and
 * per PR, so a hardcoded array locks sign-in out of every preview deploy.
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
 * subdomain, and `*.netlify.app` covers deploy previews.
 */
export const TRUSTED_HOST_PATTERNS = [
	"localhost",
	"127.0.0.1",
	"wolfstar.rocks",
	"*.wolfstar.rocks",
	"*.netlify.app",
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
export function getRequestOrigin(request: Request | undefined): string | undefined {
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
