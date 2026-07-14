import type { DiscordProfile } from "better-auth/social-providers";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";
import { createAuthMiddleware } from "better-auth/api";

export default defineServerAuth(() => ({
	socialProviders: {
		discord: {
			clientId: runtimeConfig.discord.clientId,
			clientSecret: runtimeConfig.discord.clientSecret,
			// `guilds` is required for GET /users/@me/guilds (the dashboard guild list);
			// `guilds.members.read` only covers per-guild member lookups.
			scope: ["guilds", "guilds.members.read", "email"],
			// better-auth defaults to prompt=none, which suppresses Discord's consent
			// screen and breaks first-time sign-ins and any request for new scopes.
			// Force consent so the guild-list scope above can actually be granted.
			prompt: "consent",
			mapProfileToUser: (profile: DiscordProfile) => ({
				id: profile.id,
				name: profile.global_name ?? profile.username,
				email: profile.email ?? "",
				image: profile.image_url,
			}),
			overrideUserInfoOnSignIn: true,
		},
	},
	advanced: {
		cookiePrefix: runtimeConfig.session.name,
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
