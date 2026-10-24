import type { WranglerConfig } from "nitropack/presets/cloudflare/types";

/**
 * The build for Cloudflare Workers, which serves alpha.wolfstar.rocks.
 *
 * `NITRO_PRESET=cloudflare_module` selects it: `nuxt.config.ts` then leaves the
 * Netlify-only modules out, and Nitro writes `ALPHA_WORKER` to
 * `.output/server/wrangler.json` for `npx wrangler deploy`. The Netlify build
 * does not change.
 */
export const isCloudflareBuild = process.env.NITRO_PRESET?.startsWith("cloudflare") === true;

/** Names of the Worker's bindings, as the server code reads them. */
export const CLOUDFLARE_BINDINGS = {
	/** KV namespace for Nitro's cache and the fetch cache. */
	cache: "CACHE",
	/** D1 database `@nuxt/content` loads the site's content into. */
	contentDatabase: "CONTENT_DB",
	/** Hyperdrive in front of the Postgres the Worker reads and writes. */
	database: "HYPERDRIVE",
	/** KV namespace for the rate limiters and Better Auth's secondary storage. */
	rateLimit: "RATE_LIMIT",
	/**
	 * KV namespace that keeps the build assets of past deploys for skew
	 * protection. `nuxt-skew-protection` finds its id at build time by this exact
	 * name, and writes the new build's assets there through `npx wrangler`.
	 */
	skewProtection: "SKEW_PROTECTION",
} as const;

/**
 * Workers Logs, Traces and Issues, all on. Nitro's copy of Wrangler's types
 * predates `traces` and `issues`, so the block is kept apart from the literal
 * that `satisfies` checks.
 */
const OBSERVABILITY = {
	enabled: true,
	issues: { enabled: true },
	logs: { enabled: true, invocation_logs: true },
	traces: { enabled: true },
};

/**
 * The alpha Worker. It shares the database of the WolfStar Alpha bot, the
 * staging environment on Railway, through a Hyperdrive with query caching off,
 * so a setting read back after a save is the saved one. The ids are of
 * resources in the WolfStar Cloudflare account, not secrets.
 *
 * Nitro's generated configuration replaces what the Cloudflare dashboard holds,
 * so every plain variable the Worker needs is listed in `vars`; the build reads
 * them too. The secrets are set with `npx wrangler secret put <NAME> --name
 * wolfstar-alpha` and outlive each deploy: `NUXT_BETTER_AUTH_SECRET`,
 * `NUXT_DISCORD_BOT_TOKEN` and `NUXT_DISCORD_CLIENT_SECRET`. At run time Nitro
 * overrides a runtime config key from the env var named after its path, so
 * these are not the `NUXT_OAUTH_DISCORD_*` names the build reads.
 */
export const ALPHA_WORKER = {
	d1_databases: [
		{
			binding: CLOUDFLARE_BINDINGS.contentDatabase,
			database_id: "b4445647-fed9-40ed-b4d3-299880ad7946",
			database_name: "wolfstar-alpha-content",
		},
	],
	hyperdrive: [{ binding: CLOUDFLARE_BINDINGS.database, id: "e151ba0c2b0e409c90fbdc4a56ef15aa" }],
	kv_namespaces: [
		{ binding: CLOUDFLARE_BINDINGS.cache, id: "de83f44d706f44da83bdcc59975b3c36" },
		{ binding: CLOUDFLARE_BINDINGS.rateLimit, id: "f9b5b50991c44b7f981a966e35180edb" },
		{ binding: CLOUDFLARE_BINDINGS.skewProtection, id: "9518d22a8f88456e9fcedb50ab30bdfc" },
	],
	name: "wolfstar-alpha",
	observability: OBSERVABILITY,
	preview_urls: false,
	routes: [{ custom_domain: true, pattern: "alpha.wolfstar.rocks" }],
	vars: {
		// The WolfStar Alpha application on Discord.
		NUXT_OAUTH_DISCORD_CLIENT_ID: "1557826376331960380",
		// The alpha bot's API, which answers this origin only.
		NUXT_PUBLIC_API_BASE_URL: "https://api.wolfstar.integrations.wolfstar.rocks",
		// Keeps the alpha site's events apart from production's in Sentry.
		NUXT_PUBLIC_ENVIRONMENT: "alpha",
		NUXT_PUBLIC_SITE_URL: "https://alpha.wolfstar.rocks",
		// The project's DSN, public by design: every page of the site carries it.
		SENTRY_DSN:
			"https://f22c05b1dea46bdd3465501f81b3c94d@o4505160005451776.ingest.us.sentry.io/4508811185356800",
	},
	workers_dev: false,
} satisfies WranglerConfig;
