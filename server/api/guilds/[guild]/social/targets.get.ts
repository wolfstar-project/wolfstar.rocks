import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	authorizeSocialManager,
	socialActorId,
	throwInvalidSocialRequest,
	unwrapSocialResult,
} from "#server/utils/social/route";
import { searchSocialTargets } from "#server/utils/social/staryl";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { SocialTargetQuerySchema } from "#shared/utils/social";
import { getQuery } from "nuxt/server";
import { safeParse } from "valibot";

/**
 * `GET /api/guilds/:guild/social/targets?source=&query=`: the accounts that
 * match what an admin is typing in the add dialog, from Staryl's search. An
 * empty list is a normal answer: a source without a search, a short query, or
 * a slow search gives none, and the target can still be typed in full.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const query = safeParse(SocialTargetQuerySchema, getQuery(event));
		if (!query.success) throwInvalidSocialRequest();

		const result = await searchSocialTargets(
			guild.id,
			socialActorId(event),
			query.output.source,
			query.output.query,
		);
		// A Staryl from before the search answers 404 on every keystroke. That is no outage to log:
		// it has no suggestion, and the target is typed in full as before.
		if (!result.ok && result.error.kind === "unreachable" && result.error.status === 404) {
			return { suggestions: [] };
		}
		return unwrapSocialResult(event, result);
	},
	{
		auth: true,
		authorize: authorizeSocialManager,
		onError(log, error) {
			log.error(error);
		},
		// One a keystroke at most, after the dialog's debounce; Staryl caches a repeated search.
		rateLimit: { enabled: true, limit: 20, window: seconds(10) },
	},
);
