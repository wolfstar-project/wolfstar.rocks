import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialTwitch,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { editSocialTwitch } from "#server/utils/social/staryl";
import { isSnowflake } from "#shared/utils/snowflake";
import { SocialEditBodySchema } from "#shared/utils/social";
import { safeParse } from "valibot";

/** Staryl's ID of a shared Twitch subscription: a number, not a snowflake. */
const SUBSCRIPTION_ID_PATTERN = /^\d{1,19}$/u;

/**
 * `PATCH /api/guilds/:guild/social/twitch/:channel/:subscription`: moves a
 * Twitch live notification to another channel or changes its message. The
 * streamer and the event stay, and an offline notification keeps a message.
 * It answers with the server's Twitch live subscriptions.
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

		const body = safeParse(SocialEditBodySchema, await readBody(event));
		if (!body.success) throwInvalidSocialRequest();

		const { previous, subscription, twitch } = unwrapSocialResult(
			event,
			await editSocialTwitch(
				guild.id,
				socialActorId(event),
				{ channelId, subscriptionId },
				body.output,
			),
		);

		auditSocialTwitch(event, previous, subscription);
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
