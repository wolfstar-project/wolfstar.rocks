import { defineServerAuth } from "@onmax/nuxt-better-auth";

export default defineServerAuth(() => ({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    discord: {
      clientId: process.env.NUXT_OAUTH_DISCORD_CLIENT_ID!,
      clientSecret: process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET!,
      redirectURI: `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/callback/discord`,
      scopes: ["identify", "guilds"],
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
}));
