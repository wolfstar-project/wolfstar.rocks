import { defineClientAuth } from "@nuxtjs/better-auth/config";

// The client must target the same origin the app is actually served from, not
// the configured `runtimeConfig.public.siteUrl`: the module's default client
// factory prefers that configured siteUrl unconditionally, even in the
// browser. That breaks any build served from a different origin than the
// configured production domain — e.g. CI's Playwright preview, which builds
// with NUXT_PUBLIC_SITE_URL=https://wolfstar.rocks (for correct SEO/OG output)
// but serves the result on http://localhost:5678, so a same-origin client
// would otherwise call the real production API and get blocked by CORS.
// Read window.location.origin only on the client; fall back to the
// module-injected site URL on the server so this never touches a browser
// global during SSR/server setup (import.meta.client is compiled out of the
// server bundle). Any plugin added to `server/auth.config.ts` needs its
// client counterpart here.
export default defineClientAuth((ctx) => ({
	baseURL: import.meta.client ? window.location.origin : ctx.siteUrl,
}));
