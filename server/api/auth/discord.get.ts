/* eslint-disable node/prefer-global/buffer */
import type { APIUser, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import type { NuxtError } from "nuxt/app";

defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    summary: "Discord OAuth2 callback",
    description: "Handles the OAuth2 callback from Discord after user authorization. Exchanges the authorization code for access tokens and establishes a user session.",
    operationId: "discordOAuthCallback",
    parameters: [
      {
        in: "query",
        name: "code",
        required: true,
        description: "The authorization code returned by Discord after user consent",
        schema: { type: "string" },
      },
      {
        in: "query",
        name: "state",
        required: true,
        description: "The state parameter for CSRF protection, must match the original request",
        schema: { type: "string" },
      },
    ],
    responses: {
      302: { description: "Redirect to the dashboard on successful authentication" },
      400: { description: "Invalid or missing authorization code or state" },
      500: { description: "Failed to exchange code for tokens or fetch user data" },
    },
  },
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const nextUrl = query.next as string | undefined;

  // Create OAuth handler with dynamic state
  const oauthHandler = defineOAuthDiscordEventHandler({
    config: {
      authorizationParams: nextUrl
        ? {
            state: Buffer.from(nextUrl).toString("base64"),
            prompt: "none",
          }
        : {
            prompt: "none",
          },
    },

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
      // Save the user and tokens to the session
      await setUserSession(
        event,
        {
          user: {
            name: user.global_name ?? user.username,
            globalName: user.global_name,
            username: user.username,
            id: user.id,
            avatar: user.avatar ?? null,
          },
          secure: {
            tokens,
          },
          loggedInAt: Date.now(),
        },
        {
          maxAge: 60 * 60 * 24 * 7, // 1 week
        },
      );
    },

    async onError(_event: H3Event, error: NuxtError) {
      throw createError({
        status: 500,
        statusMessage: "Discord OAuth error",
        message: error.message,
      });
    },
  });

  return oauthHandler(event);
});
