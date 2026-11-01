import type { WranglerConfig } from "nitropack/presets/cloudflare/types";
import { provider } from "std-env";

/**
 * The build for Cloudflare Workers, which serves wolfstar.rocks and
 * alpha.wolfstar.rocks.
 *
 * `NITRO_PRESET=cloudflare_module` selects it, and Nitro then writes the chosen
 * Worker to `.output/server/wrangler.json` for `npx wrangler deploy`. Without
 * the preset, as in local builds and the test builds of CI, the site builds for
 * Node.
 */
export const isCloudflareBuild =
	process.env.NITRO_PRESET?.startsWith("cloudflare") === true ||
	provider === "cloudflare_workers";

/** `CLOUDFLARE_WORKER=production` picks the production Worker; alpha is the default. */
const isProductionWorker = process.env.CLOUDFLARE_WORKER === "production";

/** Whether this build is for the alpha Worker. */
export const isAlphaWorker = isCloudflareBuild && !isProductionWorker;

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

/** What every Worker sets the same way. */
const WORKER_DEFAULTS = {
	// Workers drop a continuation that another request resolves once that
	// request has ended; this flag lets it run. It is not enough for a request
	// to wait on another (the runtime cancels the waiting one as hung), so the
	// app's own locks and shared reads stand aside on Workers: see
	// `canWaitOnOtherRequests()`. Nitro adds `nodejs_compat` next to it.
	compatibility_flags: ["no_handle_cross_request_promise_resolution"],
	version_metadata: {
		binding: "CF_VERSION_METADATA",
	},
	observability: OBSERVABILITY,
	preview_urls: false,
	workers_dev: false,
} satisfies WranglerConfig;

/** The project's DSN, public by design: every page of the site carries it. */
const SENTRY_DSN =
	"https://f22c05b1dea46bdd3465501f81b3c94d@o4505160005451776.ingest.us.sentry.io/4508811185356800";

/**
 * The production Worker. Its database goes through a Hyperdrive with query
 * caching off, so a setting read back after a save is the saved one. The ids
 * are of resources in the WolfStar Cloudflare account, not secrets;
 * `CLOUDFLARE_HYPERDRIVE_ID` and `NUXT_OAUTH_DISCORD_CLIENT_ID` come from the
 * deploy workflow.
 *
 * The secrets are set as on {@link ALPHA_WORKER}, with `--name wolfstar-rocks`.
 */
const PRODUCTION_WORKER = {
	...WORKER_DEFAULTS,
	d1_databases: [
		{
			binding: CLOUDFLARE_BINDINGS.contentDatabase,
			database_id: "7b7f274b-c8f3-47ec-adfc-96fb6f88e13c",
			database_name: "wolfstar-content",
		},
	],
	hyperdrive: [
		{
			binding: CLOUDFLARE_BINDINGS.database,
			id: process.env.CLOUDFLARE_HYPERDRIVE_ID ?? "",
		},
	],
	kv_namespaces: [
		{ binding: CLOUDFLARE_BINDINGS.cache, id: "cdf129317a7c43dcb1197fb60d0d70f6" },
		{ binding: CLOUDFLARE_BINDINGS.rateLimit, id: "6e08faf1027944438a30c813f9bde840" },
		{ binding: CLOUDFLARE_BINDINGS.skewProtection, id: "416c6dd69b3a4bf7a1cfca13ba1a5955" },
	],
	name: "wolfstar-rocks",
	routes: [{ custom_domain: true, pattern: "wolfstar.rocks" }],
	vars: {
		NUXT_OAUTH_DISCORD_CLIENT_ID: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID ?? "",
		NUXT_PUBLIC_API_BASE_URL: "https://api.wolfstar.rocks",
		NUXT_PUBLIC_ENVIRONMENT: "production",
		NUXT_PUBLIC_SITE_URL: "https://wolfstar.rocks",
		SENTRY_DSN,
	},
} satisfies WranglerConfig;

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
const ALPHA_WORKER = {
	...WORKER_DEFAULTS,
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
	routes: [{ custom_domain: true, pattern: "alpha.wolfstar.rocks" }],
	vars: {
		// The WolfStar Alpha application on Discord.
		NUXT_OAUTH_DISCORD_CLIENT_ID: "1557826376331960380",
		// The alpha bot's API, which answers this origin only.
		NUXT_PUBLIC_API_BASE_URL: "https://api.wolfstar.integrations.wolfstar.rocks",
		// Keeps the alpha site's events apart from production's in Sentry.
		NUXT_PUBLIC_ENVIRONMENT: "alpha",
		NUXT_PUBLIC_SITE_URL: "https://alpha.wolfstar.rocks",
		SENTRY_DSN,
	},
} satisfies WranglerConfig;

/** The Worker this build deploys to. */
export const WORKER = isProductionWorker ? PRODUCTION_WORKER : ALPHA_WORKER;

/**
 * Fills the env with the Worker's own `vars` on the Workers build, leaving any
 * value already set. The site's public values then come from one place, so the
 * prerendered pages and the Worker agree. Call it before the runtime config is
 * generated, which reads the env when `nuxt.config.ts` loads: a Nuxt module
 * would run too late.
 */
export function applyWorkerEnv() {
	if (!isCloudflareBuild) return;
	for (const [name, value] of Object.entries(WORKER.vars)) {
		process.env[name] ??= value;
	}
}
