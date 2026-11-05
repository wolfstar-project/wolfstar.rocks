import type { MyAppealGuild } from "#shared/utils/my-appeals";
import { readMyAppeals } from "#server/utils/my-appeals/list";
import { isSnowflake } from "#shared/utils/snowflake";
import { createError } from "evlog";

/**
 * `GET /api/users/appeals?guild=<id>`: the member's own cases that can be
 * appealed, wait on an appeal, were decided, or cannot be appealed, in the
 * servers the member is in and in the one of `guild`, which a banned member
 * comes with from the bot's direct message. Answers a `MyAppealsResponse`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = getQuery(event);
		if (guild !== undefined && !isSnowflake(guild)) {
			throw createError({
				message: "Invalid server",
				status: 400,
				why: "guild: Expected an ID.",
			});
		}

		const { user, guilds } = await getCurrentUser(event);
		const known: MyAppealGuild[] = guilds.map((entry) => ({
			id: entry.id,
			name: entry.name,
			icon: entry.icon ?? null,
		}));
		// A banned member is not in the server any more: the bot has to know it.
		if (typeof guild === "string" && !known.some((entry) => entry.id === guild)) {
			const fetched = await getGuild(guild).catch(() => null);
			if (fetched)
				known.unshift({ id: fetched.id, name: fetched.name, icon: fetched.icon ?? null });
		}

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return readMyAppeals({ userId: user.id, guilds: known });
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
