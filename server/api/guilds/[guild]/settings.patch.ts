import { isNullOrUndefined } from '@sapphire/utilities';
import { createError } from 'h3';
import { z } from 'zod';
import useApi from '~~/shared/utils/api';
import { Result } from '@sapphire/result';
import { serializeSettings, writeSettingsTransaction } from '~~/lib/database';
import rateLimitMiddleware from '~~/server/middlewares/ratelimit';
import authMiddleware from '~~/server/middlewares/auth';

// Assuming settingsUpdateSchema is imported or defined here
const settingsUpdateSchema = z.object({
	guildId: z.string(),
	data: z.array(z.tuple([z.string(), z.unknown()])),
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
		// Get and validate body data
		const body = await readValidatedBody(event, settingsUpdateSchema.parse);

		if (isNullOrUndefined(body)) {
			throw createError({
				statusCode: 400,
				message: 'Invalid request body'
			});
		}

		const { guildId, data, userId } = body;

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

		const effectiveUserId = userId ?? guild.owner_id;

		// Fetch member data
		const member = await useApi().guilds.getMember(guild.id, effectiveUserId);
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
