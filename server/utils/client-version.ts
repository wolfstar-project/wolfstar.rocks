import type { H3Event } from "h3";
import { resolveSkewCookie } from "#shared/utils/skew-protection";

/**
 * True when the browser sent a version cookie from a build that is no longer
 * the one serving it.
 *
 * `nuxt-skew-protection` 2 ships the same check as `isClientOutdated()`, but it
 * reads the cookie through the web `Request` of Nuxt's portable request event.
 * Nitro 2 hands handlers an h3 1 event whose `req` is the Node request, so that
 * helper has no `headers.get()` to call here; this one reads the cookie with
 * h3's own `getCookie()`, from the name the module publishes in the runtime config.
 */
export function isClientOutdated(event: H3Event): boolean {
	const config = useRuntimeConfig(event);
	const cookie = config.public.skewProtection?.cookie;
	// Nuxt widens the module's `false` to `boolean`; only an object names a cookie
	if (typeof cookie !== "object") return false;

	const clientVersion = getCookie(event, resolveSkewCookie(cookie).name);
	const buildId = config.app.buildId;
	return Boolean(clientVersion && buildId && clientVersion !== buildId);
}
