import type { UserSession } from "#auth-utils";
import type { RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { sessionRefresh, userLogout } from "#shared/audit/actions";
import { useLogger, withAuditMethods } from "evlog";

const REFRESH_BUFFER_MS = 60 * 60 * 1000;

export function isAccessTokenExpired(expires_in: number | undefined, loggedInAt: number): boolean {
	if (!expires_in) {
		return true;
	}

	const expiresAt = loggedInAt + expires_in * 1000;
	return Date.now() + REFRESH_BUFFER_MS >= expiresAt;
}

async function requestTokenRefresh(refreshToken: string): Promise<RESTPostOAuth2AccessTokenResult> {
	const api = useApi();

	return api.oauth2.refreshToken({
		client_id: runtimeConfig.oauth.discord.clientId,
		client_secret: runtimeConfig.oauth.discord.clientSecret,
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});
}

function getAuditActor(userId: string | undefined) {
	return userId
		? { type: "user" as const, id: userId }
		: { type: "system" as const, id: "session-cleanup" };
}

export async function refreshSessionTokens(
	event: H3Event,
	options: { force?: boolean } = {},
): Promise<RESTPostOAuth2AccessTokenResult | null> {
	const log = withAuditMethods(useLogger(event));
	const session: UserSession = await getUserSession(event);

	if (!session?.secure?.tokens) {
		return null;
	}

	const userId = session.user?.id;
	if (userId) {
		log.set({ user: { id: userId } });
	}

	const { refresh_token, access_token, expires_in } = session.secure.tokens;

	if (!options.force && !isAccessTokenExpired(expires_in, session.loggedInAt)) {
		return session.secure.tokens;
	}

	if (!access_token || !refresh_token) {
		log.audit(
			userLogout({
				actor: getAuditActor(userId),
				outcome: "denied",
				reason: "Session cleared due to missing tokens",
			}),
		);
		await clearUserSession(event);
		return null;
	}

	try {
		const newTokens = await requestTokenRefresh(refresh_token);

		await setUserSession(event, {
			loggedInAt: Date.now(),
			secure: {
				tokens: newTokens,
			},
		});

		log.audit(
			sessionRefresh({
				actor: getAuditActor(userId),
				outcome: "success",
			}),
		);
		log.info("Tokens refreshed successfully");

		return newTokens;
	} catch (error) {
		const reason =
			error instanceof Error && error.message.includes("invalid_grant")
				? "Refresh token revoked or expired"
				: "Token refresh failed";
		log.error("Failed to refresh tokens", { error });
		log.audit(
			sessionRefresh({
				actor: getAuditActor(userId),
				outcome: "failure",
				reason,
			}),
		);
		await clearUserSession(event);
		return null;
	}
}
