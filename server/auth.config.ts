import { resolveTrustedOrigins } from "#server/utils/auth-origins";
import { createAuthSecondaryStorage } from "#server/utils/auth-rate-limit-storage";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { createDiscordProviderOptions } from "#server/utils/discord/provider";
import { resolveDiscordRedirectURI } from "#server/utils/oauth-callback";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@nuxtjs/better-auth/config";
import { createAuthMiddleware } from "better-auth/api";
import { isDevelopment } from "std-env";

// Adapts the Nitro/unstorage mount to better-auth's SecondaryStorage shape so
// its rate-limit counters survive across serverless invocations.
const authSecondaryStorage = createAuthSecondaryStorage(useStorage("wolfstar:auth-ratelimiter"));

// `secret` and `baseURL` are deliberately absent: @nuxtjs/better-auth injects
// both after this config is resolved (`secret` from NUXT_BETTER_AUTH_SECRET,
// `baseURL` from runtimeConfig.public.siteUrl), and its spread wins over
// anything set here — so declaring them only creates config that looks live.
export default defineServerAuth((ctx) => ({
	socialProviders: {
		discord: createDiscordProviderOptions({
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret,
			// Same origin the module resolves `baseURL` from, so the redirect URI
			// sent to Discord and the one replayed during the token exchange can
			// never disagree. `requestOrigin` is only reached when no explicit
			// siteUrl is configured — and in that case the module keys its auth
			// instance cache by origin, so per-origin values stay correct.
			redirectURI: resolveDiscordRedirectURI(
				ctx.runtimeConfig.public.siteUrl || ctx.requestOrigin,
			),
		}),
	},
	// Function form, not an array: the auth instance is cached and shared across
	// requests, so preview-deploy origins have to be resolved per request.
	trustedOrigins: (request) => resolveTrustedOrigins(request),
	advanced: {
		cookiePrefix: runtimeConfig.session.name,
		ipAddress: {
			// Netlify supplies a single, trusted client IP. Keep Cloudflare as a
			// fallback for deployments where it is the application runtime rather
			// than the CDN in front of Netlify.
			ipAddressHeaders: ["x-nf-client-connection-ip", "cf-connecting-ip"],
		},
	},
	secondaryStorage: authSecondaryStorage,
	rateLimit: {
		enabled: !isDevelopment,
		window: 60,
		max: 100,
		storage: "secondary-storage",
		customRules: {
			// Session reads happen during hydration, callback recovery, and tab
			// refreshes. They are cookie-bound and must not prevent a completed
			// OAuth flow from loading its newly-created session.
			"/get-session": false,
			// OAuth sign-in initiation is the only unauthenticated entry point
			// (Discord-only login, no email/password) worth a tighter window.
			"/sign-in/social": { window: 10, max: 5 },
		},
	},
	// Database-less mode: the session lives entirely in a JWE cookie, so
	// `expiresIn` and the cookie cache must describe the same lifetime — the
	// cookie is the session, there is no server-side record to outlive it.
	session: {
		expiresIn: runtimeConfig.session.maxAge,
		cookieCache: {
			enabled: true,
			maxAge: runtimeConfig.session.maxAge,
			strategy: "jwe",
		},
	},
	// Also database-less: OAuth state and the linked Discord account are carried
	// in signed cookies instead of `verification`/`account` tables.
	account: {
		storeStateStrategy: "cookie",
		storeAccountCookie: true,
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/callback/discord") {
				return;
			}
			const userId = ctx.context.newSession?.user.id;
			if (!userId) {
				return;
			}
			await invalidateCurrentUserCache(userId).catch(() => {});
		}),
	},
}));
