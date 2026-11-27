import type { OnboardingState } from "#shared/utils/onboarding";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditOnboardingOrderChange,
	authorizeOnboardingManager,
	parseOnboardingInput,
	readOnboardingState,
	unwrapOnboardingChange,
} from "#server/utils/onboarding/route";
import { reorderOnboardingStages } from "#server/utils/onboarding/stages";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingStageOrderBodySchema } from "#shared/schemas/onboarding";
import { readBody } from "nuxt/server";

/**
 * `PUT /api/guilds/:guild/onboarding/stages/order`: puts the stages in a new
 * order. The body names every stage of the guild once, first to last, and
 * carries the revision the page read. Answers the whole onboarding; 400
 * `{ code: "invalid" }` for an order that is not one of these stages; 409
 * `{ code: "conflict" }` when the onboarding changed since that revision.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		const body = parseOnboardingInput(OnboardingStageOrderBodySchema, await readBody(event));

		const { before, after } = unwrapOnboardingChange(
			await reorderOnboardingStages(onboardingStore, guild.id, body.revision, body.order),
		);

		auditOnboardingOrderChange(event, before, after);
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
