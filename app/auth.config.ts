import { defineClientAuth } from "@onmax/nuxt-better-auth/config";

// Use the module-injected site URL (runtimeConfig.public.siteUrl, falling back to
// the request origin) rather than the browser-only window.location.origin, which is
// undefined during SSR/server setup and breaks auth client creation there.
export default defineClientAuth((ctx) => ({ baseURL: ctx.siteUrl }));
