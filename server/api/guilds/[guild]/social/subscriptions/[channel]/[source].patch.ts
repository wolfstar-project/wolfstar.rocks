import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialSubscription,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { editSocialSubscription } from "#server/utils/social/staryl";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { isSnowflake } from "#shared/utils/snowflake";
import { SocialEditBodySchema } from "#shared/utils/social";
import { getRouterParam, readBody } from "nuxt/server";
import { safeParse } from "valibot";

/** Staryl's ID of a followed account or feed: a number, not a snowflake. */
const SOURCE_ID_PATTERN = /^\d{1,19}$/u;

/**
 * `PATCH /api/guilds/:guild/social/subscriptions/:channel/:source`: moves a
 * subscription to another channel (`channelId`) or changes its `message`. The
 * account and its filters stay. Staryl checks a new channel, and answers with
 * the server's subscriptions.
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

		const body = safeParse(SocialEditBodySchema, await readBody(event));
		if (!body.success) throwInvalidSocialRequest();

		const { previous, subscription, subscriptions } = unwrapSocialResult(
			event,
			await editSocialSubscription(
				guild.id,
				socialActorId(event),
				{ channelId, sourceId },
				body.output,
			),
		);

		auditSocialSubscription(event, previous, subscription);
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
