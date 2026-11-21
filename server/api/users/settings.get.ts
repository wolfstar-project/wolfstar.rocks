import type { UserSettings } from "#shared/schemas";
import { db } from "#server/database/prisma";
import { useLogger } from "evlog";

/**
 * The signed-in user's own WolfStar settings. The `User` row is keyed by the
 * Discord id, not the session's; a user without a row has the column defaults,
 * as the bot reads it (`fetchUserReportEnabled`).
 */
export default defineWrappedResponseHandler(
	async (event): Promise<UserSettings> => {
		const { user } = await getCurrentUser(event);
		useLogger(event).set({ user: { id: user.id } });

		const row = await db.orm.public.User.first({ id: BigInt(user.id) });
		return { report: row?.report ?? true };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 20, window: seconds(60) },
	},
);
