defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get the current user and their guilds",
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const logger = useLogger("@wolfstar/api");

  const user = await getCurrentUser(event);

  const guilds = await getGuilds(event);

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
  onError: (logger, err) => {
    logger.error("Users API error:", {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
      stack: err.stack,
    });
  },
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
});
