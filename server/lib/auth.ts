import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "~/server/database/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // Map to our custom table names
    schema: {
      user: "auth_user",
      session: "auth_session",
      account: "auth_account",
      verification: "auth_verification",
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    discord: {
      clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID as string,
      clientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET as string,
      redirectURI: `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback/discord`,
      scope: ["identify", "guilds"], // Request Discord scopes
      // Map Discord user data to our user schema
      mapProfileToUser: (profile) => {
        return {
          id: profile.id,
          name: profile.global_name || profile.username,
          email: profile.email || null,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          emailVerified: profile.verified || false,
        };
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    generateId: () => {
      return crypto.randomUUID();
    },
  },
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;


