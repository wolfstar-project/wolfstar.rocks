import type { NitroRuntimeConfig } from "nitropack/types";
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
		// Connection string for the shared Redis instance backing the fetch cache,
		// SWR cache, and rate limiter when deployed to Vercel (see modules/cache.ts).
		redis: {
			url: process.env.REDIS_URL,
		},
		discord: {
			botToken: process.env.NUXT_OAUTH_DISCORD_BOT_TOKEN,
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			clientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET,
		},
		public: {
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
			clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID,
			environment: process.env.NODE_ENV ?? "production",
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
		session: {
			maxAge: 60 * 60 * 24 * 7, // 1 week
			name: process.env.NUXT_SESSION_COOKIE_NAME || "wolfstar-session",
			password: process.env.NUXT_SESSION_PASSWORD ?? "",
			cookie: {
				sameSite: "strict" as "lax" | "strict" | "none",
				secure: true,
			},
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
