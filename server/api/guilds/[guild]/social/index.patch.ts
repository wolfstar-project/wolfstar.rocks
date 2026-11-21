import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditSocialSwitch,
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { setSocialEnabled } from "#server/utils/social/staryl";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { SocialSwitchBodySchema } from "#shared/utils/social";
import { readBody } from "nuxt/server";
import { safeParse } from "valibot";

/**
 * `PATCH /api/guilds/:guild/social`: turns the Social module of a server on or
 * off. The switch is Staryl's: off, it posts nothing in the server and keeps
 * every subscription. It answers `{ enabled }`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body = safeParse(SocialSwitchBodySchema, await readBody(event));
		if (!body.success) throwInvalidSocialRequest();

		const { enabled, previous } = unwrapSocialResult(
			event,
			await setSocialEnabled(guild.id, socialActorId(event), body.output.enabled),
		);

		// A repeat of the value the switch already had changed nothing.
		if (previous !== enabled) auditSocialSwitch(event, previous, enabled);
		return { enabled };
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
