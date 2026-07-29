/**
 * ClientOnly Better Auth: there is no local auth server, but the module's
 * SSR path still calls `GET /api/auth/get-session` via `useRequestFetch()`.
 * Always return a signed-out snapshot so prerender/SSR stay stable; the
 * browser hydrates the real session from the bot origin.
 *
 * @see https://better-auth.nuxt.dev/guides/external-auth-backend
 */
export default defineEventHandler(() => null);
