defineRouteMeta({
  openAPI: {
    tags: ["Discord Api"],
    description: "Get the current user and their guilds",
  },
});

export default defineWrappedResponseHandler(async (event) => {
  const user = await getCurrentUser(event);

  const guilds = await getGuilds();

  // Transform and return data with improved error handling
  const transformedData = await transformOauthGuildsAndUser({
    user,
    guilds,
  }).catch((error) => {
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

  return transformedData;
}, {
  auth: true,
  onSuccess: (logger, { user, guilds }) => {
    logger.info(`Successfully transformed guilds and user ${user?.id}`, {
      guilds: guilds ? guilds.map(guild => ({ id: guild.id, name: guild.name })) : undefined,
    });
  },
  onError: (logger, error) => {
    if (isH3Error(error)) {
      logger.error("Failed to transform guilds and user data:", {
        message: error.message,
        statusCode: error.statusCode,
      });
    }
  },
  rateLimit: { enabled: true, window: seconds(5), limit: 2 },
});
