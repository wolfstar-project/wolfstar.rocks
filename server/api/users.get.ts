import { isNullOrUndefined } from '@sapphire/utilities/isNullish';
import authMiddleware from '~~/server/utils/middlewares/auth';
import { createRateLimit } from '~~/server/utils/middlewares/ratelimit';
import useApi from '~~/shared/utils/api';
import { seconds } from '~~/shared/utils/times';

defineRouteMeta({
	openAPI: {
		tags: ['Discord Api'],
		description: 'Get the current user and their guilds'
	}
});

export default defineEventHandler({
	onRequest: [
		authMiddleware(),
		createRateLimit({
			max: 2,
			time: seconds(10),
			auth: true
		})
	],
	handler: defineWrappedHandlingError(async (event) => {
		// Get session token

		const tokens = await event.context.$authorization.resolveServerTokens();

		if (isNullOrUndefined(tokens) || !('access_token' in tokens) || isNullOrUndefined(tokens.access_token)) {
			throw createError({
				statusCode: 401,
				message: 'None tokens OR access token not found'
			});
		}

		// Initialize REST client
		const rest = useRest({
			authPrefix: 'Bearer'
		}).setToken(tokens.access_token);

		// Fetch user data
		const user = await useApi(rest)
			.users
.getCurrent()
			.catch(() => null);
		if (!user) {
			throw createError({
				statusCode: 500,
				message: 'Failed to fetch user'
			});
		}

		// Fetch guilds
		const guilds = await useApi(rest)
			.users
.getGuilds()
			.catch(() => null);
		if (!guilds) {
			throw createError({
				statusCode: 500,
				message: 'Failed to fetch guilds'
			});
		}

		// Return transformed or raw data based on query param
		return await transformOauthGuildsAndUser({
			user,
			guilds
		});
	})
});
