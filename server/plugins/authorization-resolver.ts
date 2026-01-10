import { auth } from "~/server/lib/auth";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => {
        const session = await auth.api.getSession({ headers: event.node.req.headers });
        return session?.user ?? null;
      },
      resolveServerTokens: async () => {
        const session = await auth.api.getSession({ headers: event.node.req.headers });
        // Better auth doesn't expose raw tokens by default
        // We'll need to handle this differently if needed
        return null;
      },
    };
  });
});
