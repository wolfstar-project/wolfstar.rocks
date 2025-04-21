import { z } from 'zod';
import useApi from '~~/shared/utils/api';
import rateLimitMiddleware from '~~/server/utils/middlewares/ratelimit';
import authMiddleware from '~~/server/utils/middlewares/auth';
import { seconds } from '~~/shared/utils/times';

defineRouteMeta({
	openAPI: {
		tags: ['Discord Api'],
		description: 'Get the current user and their guilds',
		parameters: [
			{
				in: 'query',
				name: 'shouldSerialize',
				required: false,
				description: 'Whether to serialize the response or not'
			}
		]
	}
});

export default defineEventHandler({
	onRequest: [
		authMiddleware(),
		async (event) =>
			await rateLimitMiddleware(event, {
				max: 2,
				time: seconds(10),
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

		const tokens = null; // event.context.$authorization.resolveServerTokens();

		console.log(event.context);

		if (!tokens) {
			throw createError({
				statusCode: 401,
				message: 'Or secure token'
			});
		}
		const { access_token: token } = tokens;

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
