import type { OnboardingState } from "#shared/utils/onboarding";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditOnboardingStageChange,
	authorizeOnboardingManager,
	parseOnboardingInput,
	readOnboardingStageParam,
	readOnboardingState,
	unwrapOnboardingChange,
} from "#server/utils/onboarding/route";
import { deleteOnboardingStage } from "#server/utils/onboarding/stages";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingRevisionQuerySchema } from "#shared/schemas/onboarding";
import { getQuery } from "nuxt/server";

/**
 * `DELETE /api/guilds/:guild/onboarding/stages/:stage?revision=`: deletes a
 * stage and closes the gap it leaves in the sequence. The verifications of
 * the stage keep its name, and lose the stage. Answers the whole onboarding;
 * 404 `{ code: "unknown" }`; 409 `{ code: "conflict" }` when the onboarding
 * changed since that revision.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		const stageId = readOnboardingStageParam(event);
		const { revision } = parseOnboardingInput(
			OnboardingRevisionQuerySchema,
			getQuery(event),
			"query",
		);

		const stage = unwrapOnboardingChange(
			await deleteOnboardingStage(onboardingStore, guild.id, revision, stageId),
		);

		auditOnboardingStageChange(event, stage, null, stage.name);
		return readOnboardingState(onboardingStore, guild);
	},
	{
		auth: true,
		authorize: authorizeOnboardingManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
