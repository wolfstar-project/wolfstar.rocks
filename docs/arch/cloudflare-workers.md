# Cloudflare Workers build

Read before changing `config/cloudflare.ts`, the `isCloudflareBuild` branches of `nuxt.config.ts` and `modules/cache.ts`, `server/database/prisma.ts`, or `server/cloudflare/`.

The site runs on Cloudflare Workers: the Worker `wolfstar-rocks` serves wolfstar.rocks and `wolfstar-alpha` serves alpha.wolfstar.rocks. Local builds and the test builds of CI target Node, unless `NITRO_PRESET` starts with `cloudflare`.

## Build and deploy

- `NITRO_PRESET=cloudflare_module pnpm build`, with `CLOUDFLARE_WORKER=production` for the production Worker (alpha is the default). Prerendering starts the server, and Better Auth refuses to start in production without a secret, so the build needs some `NUXT_BETTER_AUTH_SECRET`; the Worker's own secret overrides it at run time. Without a Sentry upload token the hidden client source maps stay in `.output/public`, so delete `.output/public/**/*.map` before deploying.
- `npx wrangler deploy -c .output/server/wrangler.json`. Nitro writes that file from `WORKER` in `config/cloudflare.ts`, and it replaces what the Cloudflare dashboard holds: plain variables live in its `vars`, which the build reads too, so the prerendered pages carry that site's public config. Secrets are set with `npx wrangler secret put <NAME> --name wolfstar-alpha` and outlive each deploy.
- At run time Nitro overrides a runtime config key from the env var named after its path, so the secrets are `NUXT_BETTER_AUTH_SECRET`, `NUXT_DISCORD_BOT_TOKEN` and `NUXT_DISCORD_CLIENT_SECRET`, not the `NUXT_OAUTH_DISCORD_*` names the build reads.
- Skew protection writes the new build's assets to its KV namespace through `npx wrangler` during a build in CI, and only when `CLOUDFLARE_API_TOKEN` is set: without it the build keeps no past assets.
- Production is built and deployed by `.github/workflows/deploy.yml` on every push to `release`. It reads the repository variables `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_HYPERDRIVE_ID` and `NUXT_OAUTH_DISCORD_CLIENT_ID`, and the secrets `CLOUDFLARE_API_TOKEN`, `NUXT_BETTER_AUTH_SECRET`, `SENTRY_AUTH_TOKEN` and `SENTRY_PROJECT`. The `ci` workflow builds the same Worker on each pull request and checks it with `wrangler deploy --dry-run`.
- Alpha is built from `refactor/v3` by Workers Builds on Cloudflare (8 GB, 20 minutes): a local build needs more memory than a 4 GB machine has. Build command `(git fetch --quiet --unshallow --tags origin '+refs/heads/release:refs/remotes/origin/release' || git fetch --quiet --tags origin '+refs/heads/release:refs/remotes/origin/release' || true) && pnpm build && find .output/public -name '*.map' -delete`: Workers Builds clones without tags or the `release` branch, and without them `getNextVersion()` finds no `v*` tag and the site shows `package.json`'s `0.0.0`, deploy command `npx wrangler deploy -c .output/server/wrangler.json --autoconfig=false`, build variables `NITRO_PRESET=cloudflare_module`, `NODE_OPTIONS=--max-old-space-size=6144` and the secret `NUXT_BETTER_AUTH_SECRET`. With no `SENTRY_AUTH_TOKEN` the Sentry source map plugins are off, and the Worker is bundled without server source maps: with them, rewriting and collapsing every chunk's map took Nitro's bundling step past the build's time limit.

## Around the Worker

Set on the `wolfstar.rocks` zone, outside this repository:

- **The alpha bot's API.** `api.wolfstar.integrations.wolfstar.rocks` routes to the staging bot's port 8282 on Railway, whose `API_ORIGIN` is the alpha site. It is proxied, so Total TLS gives it an edge certificate, and a Configuration Rule sets its SSL mode to Full, since Railway presents `*.up.railway.app` until it issues the hostname's own certificate. "Allow Nuxt Proxy to API" skips Super Bot Fight Mode for its `/languages` and `/commands`, as it does for production's.
- **Image transformations.** On for the zone, from the zone's own images and the three origins above.
- **Skew protection.** A Cache Rule keeps 404s under `/_nuxt/` on alpha out of the edge cache.

## What differs on a Worker

- **Database.** A Worker refuses I/O across requests: a connection opened while serving one request cannot be used by the next. `server/plugins/database.ts` makes a client for each request from the `HYPERDRIVE` binding and sets it as `event.context.database`; `db` in `server/database/prisma.ts` is a proxy that resolves to it through `useEvent()` and Nitro's async context. Its idle connections are never timed out, since that timer would fire in another request; the runtime closes the sockets when the request, and what it handed to `waitUntil`, is done. Hyperdrive's query cache is off, so a setting read back after a save is the saved one.
- **Requests do not wait on each other.** The runtime cancels a request as hung once its own code has nothing left to run, even while the request it waits on is still working, and a cancelled request never lets go of what it holds. So on a Worker (`canWaitOnOtherRequests()` in `server/utils/keyed-lock.ts`) the in-process locks of `createKeyedLock()` and of the settings writes run at once, a settings read does not join one already running, each request gets its own Discord REST client, and Nitro's cached functions, patched in `patches/nitropack@2.13.4.patch`, do not share a call already running for a key. What orders writes there is the database: transactions, and the advisory locks of the rules and the Auto-* tables.
- **Storage.** There is no file system for the `fsLite` mounts. `modules/cache.ts` mounts them on Workers KV through `shared/utils/storage/cloudflare-kv-fallback.ts`, which falls back to memory while the binding is not there: during the prerender in Node, and while the Worker runs its plugins before the first request brings the bindings.
- **Audit.** `server/plugins/evlog-drain.ts` writes each event inside the drain hook, which evlog hands to `waitUntil`, instead of batching it for a timer that would fire outside any request. There is no secondary file journal; the Postgres hash chain is the record.
- **Content.** `@nuxt/content` loads the site's content into the `CONTENT_DB` D1 database.
- **Images.** Nuxt Image uses the `cloudflare` provider, the zone's image transformations, in open mode with an allow list: `cdn.discordapp.com`, `media.discordapp.net` and `cdn.wolfstar.rocks`, plus the site's own hosts `alpha.wolfstar.rocks` and `wolfstar.rocks`. Open mode drops the implicit same-zone allowance, so a host missing from the list fails its own images (`/avatars/*.png`) with error 9401.
- **Sentry.** `server/cloudflare/sentry.ts` sets up Sentry's SDK for Workers, and the Node one from `sentry.server.config.ts` is not imported into the entry. Both drop the same expected HTTP errors (`server/utils/sentry-expected-errors.ts`). Events carry the Worker's environment, `production` or `alpha`.
- **Skew protection.** It keeps its versions in a KV namespace of its own, `SKEW_PROTECTION`, as the module's Cloudflare guide sets it up. The assets of past deploys (`bundleAssets`) are kept only when a build in CI sets `SKEW_PROTECTION_BUNDLE_ASSETS=true`: the module uploads them one by one through `wrangler`, 25 at a time, which a machine with 4 GB of memory does not survive, and on Workers Builds the upload of the last releases' 626 assets each ran past the 30 minute limit after the bundle was already written. `nuxt-skew-protection` 1.4 sets no `assets.run_worker_first` and has no asset recovery endpoint; both arrive in 1.6.
- **Left out.** `nuxt-studio`, which only runs in development. The `isr` route rules have no effect on Workers.

## Moving production to the Worker

Netlify keeps serving wolfstar.rocks until these are done, in this order. The first push to `release` after them deploys the Worker.

1. Create the Hyperdrive `wolfstar` on production's database, with query caching off, and set its id as `CLOUDFLARE_HYPERDRIVE_ID`.
2. Set the repository variables and secrets the deploy workflow reads, using the same `NUXT_OAUTH_DISCORD_CLIENT_ID` as Netlify. The `CLOUDFLARE_API_TOKEN` needs Workers Scripts, Workers KV, D1, Hyperdrive and Workers Routes edit on the account and zone.
3. Set the Worker's secrets with `npx wrangler secret put <NAME> --name wolfstar-rocks`: `NUXT_BETTER_AUTH_SECRET` with the value Netlify holds, or every session ends, plus `NUXT_DISCORD_BOT_TOKEN` and `NUXT_DISCORD_CLIENT_SECRET`.
4. Turn off the zone's managed transform `remove_visitor_ip_headers`. With it on, a Worker sees no visitor IP, and every visitor shares one rate limit bucket.
5. Move the redirects `netlify.toml` held to Redirect Rules on the zone: `repo.wolfstar.rocks/*` to the GitHub repository, `chat.wolfstar.rocks` to the Discord invite, `social.wolfstar.rocks/twitter` to X, and `blog.wolfstar.rocks/*` to `wolfstar.rocks/blog/*`.
6. Remove the `wolfstar.rocks` DNS record that points at Netlify, so the deploy can add its custom domain, and take the Worker's first deploy from `release`.
7. Add the Cache Rule that keeps 404s under `/_nuxt/` out of the edge cache, as alpha has it.
8. Check sign-in, a settings save and an image from `cdn.discordapp.com` on wolfstar.rocks, then stop Netlify's builds.
