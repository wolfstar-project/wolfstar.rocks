import type { SecondaryStorage } from "better-auth";
import type { DiscordProfile } from "better-auth/social-providers";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";
import { createAuthMiddleware } from "better-auth/api";
import { isDevelopment } from "std-env";

const authRateLimitStorage = useStorage("wolfstar:auth-ratelimiter");

// Adapts the Nitro/unstorage mount above to better-auth's SecondaryStorage
// shape so its rate-limit counters survive across serverless invocations.
const authSecondaryStorage: SecondaryStorage = {
	get: (key) => authRateLimitStorage.getItem(key),
	set: (key, value) => authRateLimitStorage.setItem(key, value),
	delete: (key) => authRateLimitStorage.removeItem(key),
};

export default defineServerAuth(() => ({
	socialProviders: {
		discord: {
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret,
			redirectURI: runtimeConfig.discord.redirectURI,
			// `guilds` is required for GET /users/@me/guilds (the dashboard guild list);
			// `guilds.members.read` only covers per-guild member lookups.
			scope: ["guilds", "guilds.members.read", "email"],
			mapProfileToUser: (profile: DiscordProfile) => ({
				id: profile.id,
				name: profile.global_name ?? profile.username,
				email: profile.email ?? "",
				image: profile.image_url,
			}),
			overrideUserInfoOnSignIn: true,
		},
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
	},
	secondaryStorage: authSecondaryStorage,
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
		storage: "secondary-storage",
		customRules: {
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
