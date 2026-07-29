import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

/**
 * Client-only Better Auth: the WolfStar bot hosts the auth server.
 * `baseURL` must be the bot API origin so `/api/auth/**` calls go there
 * (see https://better-auth.nuxt.dev/guides/external-auth-backend).
 *
 * `NUXT_PUBLIC_SITE_URL` remains the frontend origin for SEO / redirects;
 * do not point it at the auth backend.
 *
 * `import.meta.test` is true for both Vitest and `build:test` (NODE_ENV=test).
 * Returning `{}` would fall back to `siteUrl` (often production in CI) and break
 * Playwright with CORS. An empty `baseURL` lets Better Auth use
 * `window.location.origin` so Vitest/`registerEndpoint` and Playwright hit the
 * Nuxt origin instead.
 */
export default defineClientAuth(() => {
	if (import.meta.test) {
		return { baseURL: "" };
	}
	const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
	return {
		baseURL: String(apiBaseUrl || "").replace(/\/$/, ""),
	};
});
