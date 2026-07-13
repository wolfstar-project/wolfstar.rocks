import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

// Always target the page's own origin rather than the configured site URL:
// this is a monolithic app where client and server are always same-origin,
// and preview/CI environments serve the built app on a different host/port
// than NUXT_PUBLIC_SITE_URL, which otherwise makes every request cross-origin
// and trips the CSP connect-src allowlist. This callback only ever runs
// client-side (the module's server-side session resolution never invokes it).
export default defineClientAuth(() => ({ baseURL: window.location.origin }));
