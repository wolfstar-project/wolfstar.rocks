import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialSubscription,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { removeSocialSubscription } from "#server/utils/social/staryl";
import { isSnowflake } from "#shared/utils/snowflake";

/** Staryl's ID of a followed account or feed: a number, not a snowflake. */
const SOURCE_ID_PATTERN = /^\d{1,19}$/u;

/**
 * `DELETE /api/guilds/:guild/social/subscriptions/:channel/:source`: stops a
 * channel following an account or a feed. It answers with the subscriptions
 * the server has left.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		// Both go into the path of the call to Staryl, so neither is passed on as it came.
		const channelId = getRouterParam(event, "channel") ?? "";
		const sourceId = getRouterParam(event, "source") ?? "";
		if (!isSnowflake(channelId) || !SOURCE_ID_PATTERN.test(sourceId)) {
			throwInvalidSocialRequest();
		}

		const { removed, subscriptions } = unwrapSocialResult(
			event,
			await removeSocialSubscription(guild.id, socialActorId(event), channelId, sourceId),
		);

		auditSocialSubscription(event, removed, null);
		return { subscriptions };
	},
	{
		auth: true,
		authorize: authorizeSocialManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
