import type { OnboardingState } from "#shared/utils/onboarding";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { authorizeOnboardingManager, readOnboardingState } from "#server/utils/onboarding/route";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";

/**
 * `GET /api/guilds/:guild/onboarding`: the onboarding of a guild, with its
 * stages in order, the counts of the last seven days, what is blocked, and
 * the revision a write sends back. Never cached: a write is checked against
 * the revision this answers.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		return readOnboardingState(onboardingStore, guild);
	},
	{
		auth: true,
		authorize: authorizeOnboardingManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
