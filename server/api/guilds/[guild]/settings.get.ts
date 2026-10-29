import { readSettings, serializeSettings } from "#server/database";
import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		// The member does not wait on the guild: both are asked for at once.
		const memberRequest = getCurrentMember(event, guildId);
		// When the guild is missing the member is never awaited; keep its
		// failure from surfacing as an unhandled rejection.
		memberRequest.catch(() => undefined);
		const guild = await resolveGuildForRequest(event, guildId);
		if (!guild) {
			throw createError({
				message: "Guild not found",
				status: 404,
				why: `The bot is not a member of guild ${guildId}`,
				fix: "check bot is a member of the guild",
			});
		}

		const member = await memberRequest;
		log.set({ member: { id: member.user.id } });

		const settings = await readSettings(guild.id);
		await canManage(guild, member, settings);

		return serializeSettings(settings);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
