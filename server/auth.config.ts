import type { DiscordProfile } from "better-auth/social-providers";
import { invalidateCurrentUserCache } from "#server/utils/discord/cache";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { defineServerAuth } from "@onmax/nuxt-better-auth/config";
import { createAuthMiddleware } from "better-auth/api";

// Database-less mode (https://better-auth.nuxt.dev/guides/database-less-mode):
// no `database` adapter is configured, so Better Auth keeps user/session/account
// rows in a single in-process store rather than Postgres. Accepted trade-off —
// on this app's serverless Netlify deployment, a session created on one
// function instance is not visible to another, so users may see intermittent
// unexpected logouts. See migration plan for the alternative (Prisma-backed
// auth_* tables) if this proves too disruptive in production.
export default defineServerAuth(() => ({
	socialProviders: {
		discord: {
			clientId: runtimeConfig.discord.clientId ?? "",
			clientSecret: runtimeConfig.discord.clientSecret ?? "",
			scope: ["guilds.members.read", "email"],
			// Do not set `prompt: "none"`: Discord only skips the consent screen for
			// users who have already authorized these scopes, and returns an OAuth
			// error otherwise, which breaks first-time sign-in. Default consent
			// behavior works for both new and returning users.
			// Keep the Discord snowflake as the Better Auth user id — the rest of
			// this app (rate limiting, guild permission checks, the bot's shared
			// `user` table) keys everything off that id, not a generated one.
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
		expiresIn: runtimeConfig.session.maxAge,
	},
	// NOTE: the `userLogin` audit event (previously emitted from
	// server/api/auth/discord.get.ts's onSuccess) still needs to be wired back
	// in here — evlog's useLogger() requires a real H3-shaped ServerEvent that
	// isn't available inside Better Auth's AuthMiddleware context. Follow-up:
	// find the right event/context bridge before relying on the dashboard
	// activity feed to reflect fresh logins again.
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
