import { createApiError } from "../utils";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get the current user and their guilds",
    responses: {
      200: {
        description: "Successful response with user and guild data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  description: "The current authenticated user",
                },
                guilds: {
                  type: "array",
                  description: "List of guilds the user is a member of",
                  items: {
                    type: "object",
                  },
                },
                transformedGuilds: {
                  type: "array",
                  description: "List of transformed guilds the user is a member of",
                  items: {
                    type: "object",
                  },
                },
              },
              required: ["user", "guilds"],
            },
          },
        },
      },
      500: {
        description: "Internal Server Error",
      },
    },
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    const api = useApi();
    const user = await getCurrentUser(event);

    const guilds = await api.users.getGuilds().catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Failed to fetch guilds",
        error,
        data: {
          message: error.message || "Unknown error",
        },
      });
    });

    // Transform and return data with improved error handling
    const transformedData = await transformOauthGuildsAndUser({
      user,
      guilds,
    }).catch((error) => {
      throw createApiError({
        statusCode: 500,
        message: "Data transformation failed",
        error,
        data: {
          message: error.message || "Unknown error",
        },
      });
    });

    return transformedData;
  },
  {
    auth: true,
    onSuccess: (logger, { user }) =>
      logger.info(`Successfully transformed guilds and user: ${user?.id}`),
    onError: (logger, error) =>
      logger.error(`Failed to transform guilds and user data:\n${error.message}\n${error.cause}`),
    rateLimit: { enabled: true, window: seconds(5), limit: 2 },
  },
);
