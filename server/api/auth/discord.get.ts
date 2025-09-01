import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";
import { useLogger } from "#shared/utils/logger";
import { isDevelopment } from "std-env";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Discord OAuth2 callback",
    parameters: [
      {
        in: "query",
        name: "code",
        required: true,
        description: "The authorization code returned by Discord",
      },
      {
        in: "query",
        name: "state",
        required: true,
        description: "The state parameter returned by Discord",
      },
    ],
  },
});

export default defineOAuthDiscordEventHandler({
  async onSuccess(
    event: H3Event,
    {
      user,
			tokens,
    }: {
      user: APIUser;
      tokens: RESTPostOAuth2AccessTokenResult;
    },
  ) {
    useLogger("@wolfstar/auth").info(`Discord OAuth success: ${user.global_name ?? user.username}`);
    // Save the user and tokens to the session
    const userSession = await setUserSession(
      event,
      {
        user: {
          name: user.username ?? user.global_name,
          globalName: user.global_name,
          username: user.username,
          id: user.id,
          avatar: user.avatar ?? null,
        },
        secure: {
          tokens,
        },
        loggedInAt: new Date().getTime(),
      },
      {
        maxAge: 60 * 60 * 24 * 7, // 1 week
      },
    );
    if (isDevelopment)
      useLogger("@wolfstar/auth").debug(`User session set: ${userSession.id}`, userSession);
    // Redirect to the home page
    return sendRedirect(event, "/");
  },

  async onError(_event: H3Event, error: NuxtError) {
    useLogger("@wolfstar/auth").error("Discord OAuth error", error);

    throw createError({
      statusCode: 500,
      statusMessage: "Discord OAuth error",
      data: error,
    });
  },
});
