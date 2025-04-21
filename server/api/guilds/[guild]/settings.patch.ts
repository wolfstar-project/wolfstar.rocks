import { isNullOrUndefined } from '@sapphire/utilities';
import { createError } from 'h3';
import { z } from 'zod';
import useApi from '~~/shared/utils/api';
import { Result } from '@sapphire/result';
import { serializeSettings, writeSettingsTransaction } from '~~/lib/database';
import rateLimitMiddleware from '~~/server/utils/middlewares/ratelimit';
import authMiddleware from '~~/server/utils/middlewares/auth';
import { seconds } from '~~/shared/utils/times';

// Assuming settingsUpdateSchema is imported or defined here
const settingsUpdateSchema = z.object({
	data: z.array(z.tuple([z.string(), z.unknown()]))
});

defineRouteMeta({
	openAPI: {
		tags: ['Discord Api'],
		description: 'Update guild settings',
		parameters: [
			{
				in: 'path',
				name: 'guild',
				required: true,
				description: 'The guild ID to update settings for'
			}
		]
	}
});

export default defineEventHandler({
	onRequest: [
		authMiddleware(),
		async (event) =>
			await rateLimitMiddleware(event, {
				max: 10,
				time: seconds(10),
				auth: true
			})
	],
	handler: async (event) => {
		const guildId = getRouterParam(event, 'guild');
		if (isNullOrUndefined(guildId)) {
			throw createError({
				statusCode: 400,
				message: 'No guild id provided'
			});
		}

		// Get and validate body data
		const body = await readValidatedBody(event, settingsUpdateSchema.parse);

		if (isNullOrUndefined(body)) {
			throw createError({
				statusCode: 400,
				message: 'Invalid request body'
			});
		}

		const { data } = body;

		// Validate inputs
		if (isNullOrUndefined(guildId)) {
			throw createError({
				statusCode: 400,
				message: 'No guild id provided'
			});
		}

		if (data.length === 0) {
			throw createError({
				statusCode: 400,
				message: 'No settings provided'
			});
		}

		// Fetch guild data
		const guild = await useApi().guilds.get(guildId, { with_counts: true });
		if (!guild) {
			throw createError({
				statusCode: 400,
				message: 'Guild not found'
			});
		}

		const user = event.context.$authorization.resolveServerUser();

		if (!user) {
			throw createError({
				statusCode: 401,
				message: 'Unauthorized'
			});
		}

		// Fetch member data
		const member = await useApi().guilds.getMember(guild.id, user.id);
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

		// Update settings
		const updateResult = await Result.fromAsync(async () => {
			const trx = await writeSettingsTransaction(guild.id);
			await trx.write(Object.fromEntries(data)).submit();
			return serializeSettings(trx.settings);
		});

		return updateResult.unwrapOrElse((error) => {
			throw createError({
				statusCode: 400,
				message: Array.isArray(error) ? error.join('\n') : String(error)
			});
		});
	}
});
