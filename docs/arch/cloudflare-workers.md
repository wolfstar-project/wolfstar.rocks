# Cloudflare Workers build

Read before changing `config/cloudflare.ts`, the `isCloudflareBuild` branches of `nuxt.config.ts` and `modules/cache.ts`, `server/database/prisma.ts`, or `server/cloudflare/`.

The site can also be built for Cloudflare Workers, which serves alpha.wolfstar.rocks. Netlify stays production: nothing in its build changes unless `NITRO_PRESET` starts with `cloudflare`.

## Build and deploy

- `NITRO_PRESET=cloudflare_module pnpm build`. Prerendering starts the server, and Better Auth refuses to start in production without a secret, so the build needs some `NUXT_BETTER_AUTH_SECRET`; the Worker's own secret overrides it at run time. Without a Sentry upload token the hidden client source maps stay in `.output/public`, so delete `.output/public/**/*.map` before deploying.
- `npx wrangler deploy -c .output/server/wrangler.json`. Nitro writes that file from `ALPHA_WORKER` in `config/cloudflare.ts`, and it replaces what the Cloudflare dashboard holds: plain variables live in its `vars`, which the build reads too, so the prerendered pages carry the alpha site's public config. Secrets are set with `npx wrangler secret put <NAME> --name wolfstar-alpha` and outlive each deploy.
- At run time Nitro overrides a runtime config key from the env var named after its path, so the secrets are `NUXT_BETTER_AUTH_SECRET`, `NUXT_DISCORD_BOT_TOKEN` and `NUXT_DISCORD_CLIENT_SECRET`, not the `NUXT_OAUTH_DISCORD_*` names the build reads.
- Skew protection writes the new build's assets to its KV namespace through `npx wrangler` during a build in CI, and only when `CLOUDFLARE_API_TOKEN` is set: without it the build keeps no past assets.
- Alpha is built by Workers Builds on Cloudflare (8 GB, 20 minutes): a local build needs more memory than a 4 GB machine has. Build command `pnpm build && find .output/public -name '*.map' -delete`, deploy command `npx wrangler deploy -c .output/server/wrangler.json --autoconfig=false`, build variables `NITRO_PRESET=cloudflare_module`, `NODE_OPTIONS=--max-old-space-size=6144` and the secret `NUXT_BETTER_AUTH_SECRET`.

## Around the Worker

Set on the `wolfstar.rocks` zone, outside this repository:

- **The alpha bot's API.** `api.wolfstar.integrations.wolfstar.rocks` routes to the staging bot's port 8282 on Railway, whose `API_ORIGIN` is the alpha site. It is proxied, so Total TLS gives it an edge certificate, and a Configuration Rule sets its SSL mode to Full, since Railway presents `*.up.railway.app` until it issues the hostname's own certificate. "Allow Nuxt Proxy to API" skips Super Bot Fight Mode for its `/languages` and `/commands`, as it does for production's.
- **Image transformations.** On for the zone, from the zone's own images and the three origins above.
- **Skew protection.** A Cache Rule keeps 404s under `/_nuxt/` on alpha out of the edge cache.

## What differs on a Worker

- **Database.** A Worker refuses I/O across requests: a connection opened while serving one request cannot be used by the next. `db` in `server/database/prisma.ts` is a proxy that resolves, through `useEvent()` and Nitro's async context, to a client made for the request from the `HYPERDRIVE` binding. Its idle connections are never timed out, since that timer would fire in another request; the runtime closes the sockets when the request, and what it handed to `waitUntil`, is done. Hyperdrive's query cache is off, so a setting read back after a save is the saved one.
- **Requests do not wait on each other.** The runtime cancels a request as hung once its own code has nothing left to run, even while the request it waits on is still working, and a cancelled request never lets go of what it holds. So on a Worker (`canWaitOnOtherRequests()` in `server/utils/keyed-lock.ts`) the in-process locks of `createKeyedLock()` and of the settings writes run at once, a settings read does not join one already running, each request gets its own Discord REST client, and Nitro's cached functions, patched in `patches/nitropack@2.13.4.patch`, do not share a call already running for a key. What orders writes there is the database: transactions, and the advisory locks of the rules and the Auto-* tables.
- **Storage.** There is no file system for the `fsLite` mounts. `modules/cache.ts` mounts them on Workers KV through `shared/utils/storage/cloudflare-kv-fallback.ts`, which falls back to memory while the binding is not there: during the prerender in Node, and while the Worker runs its plugins before the first request brings the bindings.
- **Audit.** `server/plugins/evlog-drain.ts` writes each event inside the drain hook, which evlog hands to `waitUntil`, instead of batching it for a timer that would fire outside any request. There is no secondary file journal; the Postgres hash chain is the record.
- **Content.** `@nuxt/content` loads the site's content into the `CONTENT_DB` D1 database.
- **Images.** Nuxt Image uses the `cloudflare` provider, the zone's image transformations. They accept the zone's own images plus `cdn.discordapp.com`, `media.discordapp.net` and `cdn.wolfstar.rocks`, the origins Netlify allows.
- **Sentry.** `server/cloudflare/sentry.ts` sets up Sentry's SDK for Workers, and the Node one from `sentry.server.config.ts` is not imported into the entry. Both drop the same expected HTTP errors (`server/utils/sentry-expected-errors.ts`). Events carry the `alpha` environment.
- **Skew protection.** It keeps its versions in a KV namespace of its own, `SKEW_PROTECTION`, as the module's Cloudflare guide sets it up. The assets of past deploys (`bundleAssets`) are kept only by a build in CI: the module uploads them one by one through `wrangler`, 25 at a time, which a machine with 4 GB of memory does not survive. `nuxt-skew-protection` 1.4 sets no `assets.run_worker_first` and has no asset recovery endpoint; both arrive in 1.6.
- **Left out.** `@netlify/nuxt` and `nuxt-studio`. The `isr` route rules have no effect on Workers.
