import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialTwitch,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { removeSocialTwitch } from "#server/utils/social/staryl";
import { isSnowflake } from "#shared/utils/snowflake";

/** Staryl's ID of a shared Twitch subscription: a number, not a snowflake. */
const SUBSCRIPTION_ID_PATTERN = /^\d{1,19}$/u;

/**
 * `DELETE /api/guilds/:guild/social/twitch/:channel/:subscription`: stops a
 * channel's Twitch live notification. It answers with the Twitch live
 * subscriptions the server has left.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		// Both go into the path of the call to Staryl, so neither is passed on as it came.
		const channelId = getRouterParam(event, "channel") ?? "";
		const subscriptionId = getRouterParam(event, "subscription") ?? "";
		if (!isSnowflake(channelId) || !SUBSCRIPTION_ID_PATTERN.test(subscriptionId)) {
			throwInvalidSocialRequest();
		}

		const { removed, twitch } = unwrapSocialResult(
			event,
			await removeSocialTwitch(guild.id, socialActorId(event), channelId, subscriptionId),
		);

		auditSocialTwitch(event, removed, null);
		return { twitch };
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
