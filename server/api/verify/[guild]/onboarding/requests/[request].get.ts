import type { OnboardingRequestState } from "#shared/utils/onboarding";
import {
	readJoinGuardRowParam,
	readJoinGuardVerifyGuildParam,
} from "#server/utils/join-guard/route";
import { readVerifyMemberId } from "#server/utils/join-guard/verify";
import { readOnboardingRequestState } from "#server/utils/onboarding/verify";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { setResponseHeader } from "nitro/h3";
import { createError } from "nuxt/server";

/**
 * `GET /api/verify/:guild/onboarding/requests/:request` (signed in): whether
 * the bot has passed the member yet, and why it could not (an
 * `OnboardingRequestState`), which the page polls. Only the member's own
 * requests are read: 404 `{ code: "unknown" }` for any other.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingRequestState> => {
		const guildId = readJoinGuardVerifyGuildParam(event);
		const requestId = readJoinGuardRowParam(event, "request");
		const userId = await readVerifyMemberId(event);

		const state = await readOnboardingRequestState(guildId, userId, requestId);
		if (state === null) {
			throw createError({
				data: { code: "unknown" },
				message: "Request not found",
				statusCode: 404,
				statusMessage: "Request not found",
			});
		}

		setResponseHeader(event, "Cache-Control", "private, no-store");
		return state;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(1) },
	},
);
