import { defineClientAuth } from "@nuxtjs/better-auth/config";

// No `baseURL` and no plugins: the server config registers only the Discord
// social provider, and the module already builds the client against the
// resolved site URL (runtimeConfig.public.siteUrl, falling back to the current
// request origin), which keeps /api/auth/* calls same-origin everywhere.
// Any plugin added to `server/auth.config.ts` needs its client counterpart here.
export default defineClientAuth({});
