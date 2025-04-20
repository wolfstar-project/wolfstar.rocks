import { z } from 'zod';
import useApi from '~~/shared/utils/api';
import rateLimitMiddleware from '~~/server/middlewares/ratelimit';
import authMiddleware from '~~/server/middlewares/auth';

export default defineEventHandler({
	onRequest: [
		authMiddleware(),
		rateLimitMiddleware({
			max: 10,
			time: 5,
			auth: true
		})
	],
	handler: async (event) => {
		// Validate query parameters
		const query = await getValidatedQuery(
			event,
			z.object({
				shouldSerialize: z.boolean().optional()
			}).parse
		);

		// Get session token
		const session = await getUserSession(event);

		if (!session.secure) {
			throw createError({
				statusCode: 401,
				message: 'Missing session Or secure token'
			});
		}
		const { access_token: token } = session.secure.tokens;

		if (!token) {
			throw createError({
				statusCode: 500,
				message: 'Missing token'
			});
		}

		// Initialize REST client
		const rest = useRest({
			authPrefix: 'Bearer'
		}).setToken(token);

		// Fetch user data
		const user = await useApi(rest)
			.users.getCurrent()
			.catch(() => null);
		if (!user) {
			throw createError({
				statusCode: 500,
				message: 'Failed to fetch user'
			});
		}

		// Fetch guilds
		const guilds = await useApi(rest)
			.users.getGuilds()
			.catch(() => null);
		if (!guilds) {
			throw createError({
				statusCode: 500,
				message: 'Failed to fetch guilds'
			});
		}

		// Return transformed or raw data based on query param
		return query?.shouldSerialize === false
			? {
					user,
					guilds
				}
			: await transformOauthGuildsAndUser({
					user,
					guilds
				});
	}
});
