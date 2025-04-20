import { isNullOrUndefined } from '@sapphire/utilities';
import { z } from 'zod';
import type { GuildData } from '~~/lib/database';
import { readSettings, serializeSettings } from '~~/lib/database';
import rateLimitMiddleware from '~~/server/middlewares/ratelimit';
import authMiddleware from '~~/server/middlewares/auth';
import useApi from '~~/shared/utils/api';

const querySchema = z.object({
	shouldSerialize: z.boolean().optional(),
	userId: z.string().optional()
});

export default defineEventHandler({
	onRequest: [
		rateLimitMiddleware({
			max: 10,
			time: 5
		}),
		authMiddleware()
	],
	handler: async (event) => {
		// Get guild ID from params
		const guildId = event.context.params?.guild;
		if (isNullOrUndefined(guildId)) {
			throw createError({
				statusCode: 400,
				message: 'No guild id provided'
			});
		}

		// Validate query parameters
		const query = await getValidatedQuery(event, querySchema.parse);
		const { shouldSerialize, userId: queryUserId } = query;

		// Initialize API client

		// Fetch guild data
		const guild = await useApi().guilds.get(guildId, { with_counts: true });
		if (!guild) {
			throw createError({
				statusCode: 400,
				message: 'Guild not found'
			});
		}

		// Use provided userId or fall back to guild owner
		const userId = queryUserId ?? guild.owner_id;

		// Fetch member data
		const member = await useApi().guilds.getMember(guild.id, userId);
		if (!member) {
			throw createError({
				statusCode: 400,
				message: 'Member not found'
			});
		}

		// Check permissions
		if (!(await canManage(guild, member))) {
			throw createError({
				statusCode: 403,
				message: 'Insufficient permissions'
			});
		}

		// Read and return settings
		const settings = await readSettings(guild.id);
		return shouldSerialize ? serializeSettings(settings) : (settings as unknown as GuildData);
	}
});
