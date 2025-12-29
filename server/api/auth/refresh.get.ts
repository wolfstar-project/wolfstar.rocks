import type { UserSession } from "#auth-utils";

async function refreshTokens(refreshToken: string) {
  const api = useApi();

  const config = useRuntimeConfig();

  return api.oauth2.refreshToken({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: config.oauth.discord.clientId,
    client_secret: config.oauth.discord.clientSecret,
  });
}

function isExpired(expires_in: number): boolean {
  const ONE_HOUR = 60 * 60 * 1000;
  const expiresAt = expires_in * 1000;

  return Date.now() + ONE_HOUR >= expiresAt;
}

export default defineEventHandler(async (event) => {
  const session: UserSession = await getUserSession(event);
  if (!session?.secure?.tokens) {
    return;
  }

  const { refresh_token, expires_in } = session.secure?.tokens ?? {};
  const isAccessTokenExpired = isExpired(expires_in);
  if (!isAccessTokenExpired) {
    // If the access token is still valid, we don't need to refresh it
    return;
  }

  try {
    const newTokens = await refreshTokens(refresh_token);

    session.secure.tokens = newTokens;
    await setUserSession(event, {
      secure: {
        tokens: newTokens,
      },
      loggedInAt: Date.now(),
    });
  }
  catch (error) {
    logger.error("Failed to refresh tokens:", error);
    await clearUserSession(event);
  }
});
