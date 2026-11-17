import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialSubscription,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { addSocialSubscription } from "#server/utils/social/staryl";
import { SocialSubscriptionBodySchema } from "#shared/utils/social";
import { safeParse } from "valibot";

/**
 * `POST /api/guilds/:guild/social/subscriptions`: follows an account or a feed
 * in a channel: `provider`, `target`, `channelId` and an optional `message`.
 * Staryl checks the target and the channel, and answers with the server's
 * subscriptions, which this passes on with 201.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body = safeParse(SocialSubscriptionBodySchema, await readBody(event));
		if (!body.success) throwInvalidSocialRequest();

		const { subscription, subscriptions } = unwrapSocialResult(
			event,
			await addSocialSubscription(guild.id, socialActorId(event), body.output),
		);

		auditSocialSubscription(event, null, subscription);
		setResponseStatus(event, 201);
		return { subscriptions };
	},
	{
		auth: true,
		authorize: authorizeSocialManager,
		onError(log, error) {
			log.error(error);
		},
		// An add makes Staryl read a third party, so it is the dearest call here.
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
