import type { UserSession } from "#auth-utils";
import { sessionRefresh, userLogout } from "#shared/audit/actions";
import { useLogger, withAuditMethods } from "evlog";

async function refreshTokens(refreshToken: string) {
	const api = useApi();

	return api.oauth2.refreshToken({
		client_id: runtimeConfig.oauth.discord.clientId,
		client_secret: runtimeConfig.oauth.discord.clientSecret,
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});
}

function isExpired(expires_in: number | undefined, loggedInAt: number): boolean {
	if (!expires_in) {
		return true;
	}

	const ONE_HOUR = 60 * 60 * 1000;
	const expiresAt = loggedInAt + expires_in * 1000;

	return Date.now() + ONE_HOUR >= expiresAt;
}

export default defineWrappedResponseHandler(
	async (event) => {
		const log = withAuditMethods(useLogger(event));
		const session: UserSession = await getUserSession(event);
		if (!session?.secure?.tokens) {
			return;
		}

		const userId = session.user?.id;
		if (userId) {
			log.set({ user: { id: userId } });
		}

		const { refresh_token, access_token, expires_in } = session.secure?.tokens ?? {};
		const isAccessTokenExpired = isExpired(expires_in, session.loggedInAt);
		if (!isAccessTokenExpired) {
			return;
		}

		if (!access_token || !refresh_token) {
			const actor = userId
				? { type: "user" as const, id: userId }
				: { type: "system" as const, id: "session-cleanup" };
			log.audit(
				userLogout({
					actor,
					outcome: "denied",
					reason: "Session cleared due to missing tokens",
				}),
			);
			await clearUserSession(event);
			return;
		}

		try {
			const newTokens = await refreshTokens(refresh_token);

			session.secure.tokens = newTokens as unknown as any;
			await setUserSession(event, {
				loggedInAt: Date.now(),
				secure: {
					tokens: newTokens,
				},
			});

			const successActor = userId
				? { type: "user" as const, id: userId }
				: { type: "system" as const, id: "session-cleanup" };
			log.audit(
				sessionRefresh({
					actor: successActor,
					outcome: "success",
				}),
			);
			log.info("Tokens refreshed successfully");
		} catch (error) {
			const reason =
				error instanceof Error && error.message.includes("invalid_grant")
					? "Refresh token revoked or expired"
					: "Token refresh failed";
			log.error("Failed to refresh tokens", { error });
			const failureActor = userId
				? { type: "user" as const, id: userId }
				: { type: "system" as const, id: "session-cleanup" };
			log.audit(
				sessionRefresh({
					actor: failureActor,
					outcome: "failure",
					reason,
				}),
			);
			await clearUserSession(event);
		}
	},
	{
		auth: false,
		rateLimit: { enabled: true, limit: 3, window: seconds(5) },
	},
);
