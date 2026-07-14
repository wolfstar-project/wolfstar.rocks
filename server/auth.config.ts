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
			scope: ["guilds.members.read", "email"],
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
