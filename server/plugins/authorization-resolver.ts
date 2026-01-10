import { auth } from "~/server/lib/auth";
import { prisma } from "~/server/database/prisma";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => {
        const session = await auth.api.getSession({ headers: event.node.req.headers });
        return session?.user ?? null;
      },
      resolveServerTokens: async () => {
        const session = await auth.api.getSession({ headers: event.node.req.headers });
        if (!session?.user) {
          return null;
        }

        // Fetch the Discord account from the database to get tokens
        const account = await prisma.authAccount.findFirst({
          where: {
            userId: session.user.id,
            providerId: "discord",
          },
        });

        if (!account) {
          return null;
        }

        // Return tokens in a format compatible with the existing code
        return {
          access_token: account.accessToken,
          refresh_token: account.refreshToken,
          expires_in: account.accessTokenExpiresAt
            ? Math.floor((account.accessTokenExpiresAt.getTime() - Date.now()) / 1000)
            : undefined,
          scope: account.scope,
        };
      },
    };
  });
});
