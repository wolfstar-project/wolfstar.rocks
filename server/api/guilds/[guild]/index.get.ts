import { isNullOrUndefined } from '@sapphire/utilities/isNullish';
import { createError } from 'h3';
import rateLimitMiddleware from '~~/server/middlewares/ratelimit';
import authMiddleware from '~~/server/middlewares/auth';
import useApi from '~~/shared/utils/api';

defineRouteMeta({
	openAPI: {
		tags: ['discord-api'],
		description: 'Get guild data',
		parameters: [
			{
				in: 'path',
				name: 'guild',
				required: true,
				description: 'The guild ID to fetch data for'
			}
		]
	}
});

export default defineEventHandler({
	onRequest: [
		rateLimitMiddleware({
			max: 10,
			time: 5,
			auth: true
		}),
		authMiddleware()
	],
	handler: async (event) => {
		// Get guild ID from params
		const guildId = event.context.params?.guild;
		if (isNullOrUndefined(guildId)) {
			throw createError({
				statusCode: 400,
				message: 'Guild ID is required'
			});
		}

		// Validate query parameters
		const { user } = await getUserSession(event);
		// Fetch guild data
		const guild = await useApi().guilds.get(guildId, { with_counts: true });
		if (isNullOrUndefined(guild)) {
			throw createError({
				statusCode: 400,
				message: 'Guild not found'
			});
		}

		// Check if user ID is provided
		if (!user) {
			throw createError({
				statusCode: 400,
				message: 'User ID is required'
			});
		}

		// Fetch member data
		const member = await useApi().guilds.getMember(guild.id, user.id);
		if (isNullOrUndefined(member)) {
			throw createError({
				statusCode: 400,
				message: 'Member not found'
			});
		}

		// Check permissions
		if (!(await canManage(guild, member))) {
			throw createError({
				statusCode: 403,
				message: 'Forbidden'
			});
		}

		// Fetch channels
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const channels = (await useApi().guilds.getChannels(guild.id)) as any;

		// Return flattened guild data
		return flattenGuild({ ...guild, channels });
	}
});
