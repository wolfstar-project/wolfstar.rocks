# Server API patterns

Read before adding or changing a route under `server/api/`.

- Routes go under `server/api/` with HTTP suffix (`.get.ts`, `.post.ts`)
- Always wrap handlers with `defineWrappedResponseHandler` for auth + rate limiting
- Use `defineWrappedCachedResponseHandler` for cached responses
- Rate limiting (`server/utils/wrappedEventHandler.ts`) reserves a fixed- or sliding-window quota in storage before the handler runs and rolls the reservation back if the handler throws; it fails open (lets the request through) if the rate-limit storage read/write itself errors
- Use the `authorize` option (not an inline check in the handler body) for per-request permission checks — e.g. `canManage()` — that must run on every request, including warm cache hits on `defineWrappedCachedResponseHandler` routes
- Use `createError` for error responses with proper status codes
- Use the `onError` callback for error logging
- Validate query strings with shared Valibot schemas from `shared/schemas/` via `getValidatedQuery(event, (body) => parse(Schema, body))`
- For paginated guild log routes, use stable cache keys that include the guild id, route segment, and `url.search`
- `defineWrappedResponseHandler`/`defineWrappedCachedResponseHandler` reject outdated browser sessions before auth, rate limiting, or cache resolution: `isClientOutdated()` from `nuxt-skew-protection/server` throws a 409 (with an `x-client-outdated` response header) so stale clients never consume quota or read data shaped for a newer server build (header name: `CLIENT_OUTDATED_HEADER` in `shared/utils/skew-protection.ts`, shared with the client)
- `app/plugins/skew-protection.client.ts` is what makes that 409 truthful and actionable, and must not be removed while `skewProtection.updateStrategy` is `"polling"`. `isClientOutdated()` compares the `__nkpv` cookie against the server build id, but that cookie is only written by the module's Nitro middleware on document responses and by `createSkewConnection()` — a plugin that only ships with the `sse`/`ws`/adapter strategies. Marketing routes are prerendered and served statically, so a visitor entering through one keeps whatever build id last rendered an SSR document for them and every `/api/**` call 409s even though the browser runs the current build, unfixable by reloading. The plugin pins the cookie to the running build (via `resolveSkewCookie()`, whose attributes must keep matching the middleware's or the browser stores a second cookie), registers the `app:manifest:update` hook that populates `useSkewProtection().manifest` — otherwise `isAppOutdated` stays false until the lazy, `DeferredMount`-gated prompt mounts — and wraps `globalThis.fetch` to re-check the manifest on a real 409. That wrapper is the only global seam: Nuxt's auto-imported `$fetch` is a const captured from `#build/fetch` before any plugin runs, so replacing `globalThis.$fetch` would miss every existing call site, while `ofetch` resolves `globalThis.fetch` per request
