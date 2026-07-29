import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

/**
 * Client-only Better Auth: the WolfStar bot hosts the auth server.
 * `baseURL` must be the bot API origin so `/api/auth/**` calls go there
 * (see https://better-auth.nuxt.dev/guides/external-auth-backend).
 *
 * `NUXT_PUBLIC_SITE_URL` remains the frontend origin for SEO / redirects;
 * do not point it at the auth backend.
 */
export default defineClientAuth(() => {
	const apiBaseUrl = useRuntimeConfig().public.apiBaseUrl;
	return {
		baseURL: String(apiBaseUrl || "").replace(/\/$/, ""),
	};
});
