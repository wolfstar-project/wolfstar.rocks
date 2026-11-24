import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	authorizeSocialManager,
	socialActorId,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { readSocialState } from "#server/utils/social/staryl";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";

/**
 * `GET /api/guilds/:guild/social`: the Social module of a server, as Staryl
 * holds it: whether Staryl is in the server, the module's switch, the
 * platforms and every subscription. Not cached: Staryl changes a
 * subscription's health on its own, and `/subscriptions` changes the list.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return unwrapSocialResult(event, await readSocialState(guild.id, socialActorId(event)));
	},
	{
		auth: true,
		authorize: authorizeSocialManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
