import { createAuthSecondaryStorage } from "#server/utils/auth-rate-limit-storage";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { createDiscordProviderOptions } from "#server/utils/discord/provider";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";
import { createAuthMiddleware } from "better-auth/api";
import { isDevelopment } from "std-env";

// Adapts the Nitro/unstorage mount to better-auth's SecondaryStorage shape so
// its rate-limit counters survive across serverless invocations.
const authSecondaryStorage = createAuthSecondaryStorage(useStorage("wolfstar:auth-ratelimiter"));

export default defineServerAuth(() => ({
	socialProviders: {
		discord: createDiscordProviderOptions({
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret,
			redirectURI: runtimeConfig.discord.redirectURI,
		}),
	},
	trustedOrigins: [
		"http://localhost:3000",
		"https://wolfstar.rocks",
		"https://main.wolfstar.rocks",
		"https://beta.wolfstar.rocks",
		"https://your-preview.workers.dev",
	],
	baseURL: {
		allowedHosts: [
			"localhost:3000",
			"localhost:5173",
			"wolfstar.rocks",
			"beta.wolfstar.rocks",
			"main.wolfstar.rocks",
			"*.netlify.app",
			"*.vercel.app",
		],
		protocol: isDevelopment ? "http" : "https",
	},
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
	session: {
		cookieCache: {
			enabled: true,
			maxAge: runtimeConfig.session.maxAge,
			strategy: "jwe",
		},
	},
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
