// Not `nitropack/types` (as `wrappedEventHandler.ts` uses): `nuxt.config.ts`
// imports this file, so it is also checked under the node tsconfig's
// `nodenext` resolution, where that subpath's extensionless re-export fails.
import type { NitroRuntimeConfig } from "nitropack";
import { cast } from "@sapphire/utilities/cast";
import { config } from "dotenv";

// `useRuntimeConfig` is injected by Nitro's auto-imports in server builds and is absent when
// `nuxt.config.ts` loads this file at build time; declare only its signature so both type
// contexts accept the runtime feature check below.
declare const useRuntimeConfig: (() => NitroRuntimeConfig) | undefined;

let runtimeConfigInstance: NitroRuntimeConfig;

const DEFAULT_TRACES_SAMPLE_RATE = 0.2;

/**
 * Parses `NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` into a finite number in
 * [0, 1]. `0` is a valid, intentional "no tracing" value — only absent or
 * invalid input falls back to the default, with a structured warning so
 * misconfiguration is visible instead of silently changing telemetry spend.
 */
export function parseTracesSampleRate(raw: string | undefined): number {
	if (raw === undefined || raw === "") {
		return DEFAULT_TRACES_SAMPLE_RATE;
	}
	const value = Number(raw);
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		// oxlint-disable-next-line no-console --- runs before any logger exists (nuxt.config load)
		console.warn(
			`[runtimeConfig] Invalid NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE "${raw}" — expected a number from 0 to 1; falling back to ${DEFAULT_TRACES_SAMPLE_RATE}`,
		);
		return DEFAULT_TRACES_SAMPLE_RATE;
	}
	return value;
}

export function generateRuntimeConfig() {
	return {
		// The bridge to the bot's own API, which the member's appeals go through:
		// the dashboard mints the session cookie the API reads, so the secret is
		// the bot's `OAUTH_SECRET` and the name its `OAUTH_COOKIE`. Server-only.
		botApiOauthSecret: process.env.NUXT_BOT_API_OAUTH_SECRET ?? "",
		botApiOauthCookie: process.env.NUXT_BOT_API_OAUTH_COOKIE || "WOLFSTAR_AUTH",
		discord: {
			botToken: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN,
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			clientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET,
		},
		public: {
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			environment: process.env.NODE_ENV ?? "production",
			// Declared so `NUXT_PUBLIC_SITE_URL` can override it at runtime: Nuxt only
			// applies env overrides to keys that already exist in runtimeConfig.
			// @nuxtjs/better-auth reads this first when resolving Better Auth's
			// `baseURL`, which is what OAuth callback URLs are built from — without it
			// the base URL is inferred per request and Discord callbacks drift between
			// the apex domain, deploy previews, and platform-generated hostnames.
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "",
			// The public key of the Turnstile widget of the verification page
			// (`/verify/<guild>`); empty when the site has no Turnstile set up.
			turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || "",
			sentry: {
				dsn: process.env.SENTRY_DSN,
				tracesSampleRate: parseTracesSampleRate(
					process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
				),
			},
		},
		sentry: {
			authToken: process.env.SENTRY_AUTH_TOKEN,
			org: process.env.SENTRY_ORG,
			project: process.env.SENTRY_PROJECT,
		},
		// The secret the verification page checks a Turnstile token with
		// (`siteverify`). Server only: it never reaches the client, nor a log.
		turnstileSecretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || "",
		// Consumed by `server/auth.config.ts`. Cookie attributes are deliberately
		// absent: Better Auth owns them, and forcing `sameSite: "strict"` would drop
		// the OAuth state cookie on the cross-site redirect back from Discord.
		session: {
			maxAge: 60 * 60 * 24 * 7, // 1 week
			name: process.env.NUXT_SESSION_COOKIE_NAME || "wolfstar-session",
		},
	};
}

if (typeof useRuntimeConfig !== "undefined") {
	runtimeConfigInstance = useRuntimeConfig();
} else {
	config({ quiet: true });
	runtimeConfigInstance = cast<NitroRuntimeConfig>(generateRuntimeConfig());
}

export const runtimeConfig = runtimeConfigInstance;
