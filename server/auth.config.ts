import type { DiscordProfile } from "better-auth/social-providers";
import { createAuthSecondaryStorage } from "#server/utils/auth-rate-limit-storage";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";
import { createAuthMiddleware } from "better-auth/api";
import { isDevelopment } from "std-env";

// Adapts the Nitro/unstorage mount to better-auth's SecondaryStorage shape so
// its rate-limit counters survive across serverless invocations.
const authSecondaryStorage = createAuthSecondaryStorage(useStorage("wolfstar:auth-ratelimiter"));

export default defineServerAuth(() => ({
	socialProviders: {
		discord: {
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret,
			redirectURI: runtimeConfig.discord.redirectURI,
			// Override Better Auth's Discord default (`prompt=none`) so first login /
			// new scopes get a consent screen. Sapphire bridge still uses prompt=none.
			prompt: "consent",
			// On top of Better Auth defaults (`identify`, `email`): guild list + member lookups.
			scope: ["guilds", "guilds.members.read"],
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
