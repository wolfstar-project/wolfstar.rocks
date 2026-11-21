import type { UserSettings } from "#shared/schemas";
import { db } from "#server/database/prisma";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { userSettingsUpdate } from "#shared/audit/actions";
import { UserSettingsUpdateSchema } from "#shared/schemas";
import { useLogger, withAuditMethods } from "evlog";
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
		const log = withAuditMethods(useLogger(event));
		log.set({ user: { id: user.id }, settings: { report } });

		const id = BigInt(user.id);
		// A user without a row reads as the column default, as the GET does.
		const before = { report: (await db.orm.public.User.first({ id }))?.report ?? true };
		await db.orm.public.User.upsert({ create: { id, report }, update: { report } });

		log.audit(
			userSettingsUpdate({
				actor: { type: "user", id: user.id, displayName: user.username },
				target: { type: "user", id: user.id },
				outcome: "success",
				changes: compactSettingsChanges(before, { report }),
			}),
		);
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
