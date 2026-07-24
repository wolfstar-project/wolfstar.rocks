import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

// The auth client must target the same origin the app is served from so that
// /api/auth/* calls stay same-origin (localhost during tests/preview, the site URL
// in production). Read window.location.origin only on the client; fall back to the
// module-injected site URL on the server so this never touches a browser global
// during SSR/server setup (import.meta.client is compiled out of the server bundle).
export default defineClientAuth((ctx) => ({
	baseURL: import.meta.client ? window.location.origin : ctx.siteUrl,
}));
