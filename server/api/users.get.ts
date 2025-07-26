import { REST } from "@discordjs/rest";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import useApi from "~~/server/utils/api";

defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get the current user and their guilds",
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const logger = useLogger("@wolfstar/api");
  // Get session token
  const tokens = await event.context.$authorization.resolveServerTokens();

  if (isNullOrUndefined(tokens) || !("access_token" in tokens) || isNullOrUndefined(tokens.access_token)) {
    logger.warn("No tokens or access token not found");
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
      data: {
        error: "no_access_token",
        message: "None tokens OR access token not found",
      },
    });
  }

  // Initialize REST client
  const rest = new REST({
    authPrefix: "Bearer",
  }).setToken(tokens.access_token);

  const api = useApi(rest);

  // Fetch user data with improved error handling
  logger.info("Fetching user data...");
  const user = await api.users.getCurrent().catch((error) => {
    logger.error("Failed to fetch user data:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user data",
      data: {
        error: "user_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  // Fetch guilds with improved error handling
  logger.info(`Fetching guilds for user ${user.id}...`);
  const guilds = await api.users.getGuilds().catch((error) => {
    logger.error("Failed to fetch guilds:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch guilds",
      data: {
        error: "guilds_fetch_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  logger.info(`Successfully fetched ${guilds.length} guilds for user ${user.id}`);

  // Transform and return data with improved error handling
  const transformedData = await transformOauthGuildsAndUser({
    user,
    guilds,
  }).catch((error) => {
    logger.error("Failed to transform guilds and user data:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Data transformation failed",
      data: {
        error: "transformation_failed",
        message: error.message || "Unknown error",
        details: error,
      },
    });
  });

  logger.info(`Successfully transformed data for user ${user.id}`);
  return transformedData;
}, {
  auth: true,
  onError: (err) => {
    logger.error("Users API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
      stack: err.stack,
    });
  },
});
