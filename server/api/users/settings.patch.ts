import type { UserSettings } from "#shared/schemas";
import { db } from "#server/database/prisma";
import { UserSettingsUpdateSchema } from "#shared/schemas";
import { useLogger } from "evlog";
import { parse } from "valibot";

/**
 * Changes the signed-in user's own WolfStar settings, creating their `User`
 * row on the first change, as the bot's `/settings user` menu does.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<UserSettings> => {
		const { report } = await readValidatedBody(event, (body) =>
			parse(UserSettingsUpdateSchema, body),
		);
		const { user } = await getCurrentUser(event);
		useLogger(event).set({ user: { id: user.id }, settings: { report } });

		const id = BigInt(user.id);
		await db.orm.public.User.upsert({ create: { id, report }, update: { report } });
		return { report };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(60) },
	},
);
