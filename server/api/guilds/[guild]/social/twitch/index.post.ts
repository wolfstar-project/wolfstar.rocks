import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialTwitch,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { addSocialTwitch } from "#server/utils/social/staryl";
import { SocialTwitchBodySchema } from "#shared/utils/social";
import { safeParse } from "valibot";

/**
 * `POST /api/guilds/:guild/social/twitch`: notifies a channel when a streamer
 * goes live (`StreamOnline`) or offline (`StreamOffline`, which needs a
 * message). Staryl checks the streamer and the channel, and answers with the
 * server's Twitch live subscriptions, which this passes on with 201.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body = safeParse(SocialTwitchBodySchema, await readBody(event));
		if (!body.success) throwInvalidSocialRequest();

		const { subscription, twitch } = unwrapSocialResult(
			event,
			await addSocialTwitch(guild.id, socialActorId(event), body.output),
		);

		// Staryl answers no subscription when it saved one and could not read it back. The add is
		// recorded all the same, from what was asked for.
		auditSocialTwitch(
			event,
			null,
			subscription ?? {
				channelId: body.output.channelId,
				message: body.output.message,
				streamerId: body.output.streamer,
				streamerName: null,
				type: body.output.type,
			},
		);
		setResponseStatus(event, 201);
		return { twitch };
	},
	{
		auth: true,
		authorize: authorizeSocialManager,
		onError(log, error) {
			log.error(error);
		},
		// An add makes Staryl ask Twitch twice, so it is as dear as a social add.
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
