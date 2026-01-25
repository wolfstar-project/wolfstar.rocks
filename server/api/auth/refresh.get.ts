import type { UserSession } from "#auth-utils";
import { runtimeConfig } from "#server/utils/runtimeConfig";

async function refreshTokens(refreshToken: string) {
  const api = useApi();

  return api.oauth2.refreshToken({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: runtimeConfig.oauth.discord.clientId,
    client_secret: runtimeConfig.oauth.discord.clientSecret,
  });
}

function isExpired(expires_in: number | undefined, loggedInAt: number): boolean {
  if (!expires_in)
    return true;

  const ONE_HOUR = 60 * 60 * 1000;
  const expiresAt = loggedInAt + expires_in * 1000;

  return Date.now() + ONE_HOUR >= expiresAt;
}

export default defineEventHandler(async (event) => {
  const session: UserSession = await getUserSession(event);
  if (!session?.secure?.tokens) {
    return;
  }

  const { refresh_token, access_token, expires_in } = session.secure?.tokens ?? {};
  const isAccessTokenExpired = isExpired(expires_in, session.loggedInAt);
  if (!isAccessTokenExpired) {
    return;
  }

  if (!access_token || !refresh_token) {
    await clearUserSession(event);
    return;
  }

  try {
    const newTokens = await refreshTokens(refresh_token);

    session.secure.tokens = newTokens as unknown as any;
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
