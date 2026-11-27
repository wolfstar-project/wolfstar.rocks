import type { OnboardingStage, OnboardingState } from "#shared/utils/onboarding";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { isOnboardingCaptchaAvailable } from "#server/utils/onboarding/captcha";
import {
	canGiveOnboardingRole,
	fetchOnboardingDiscordFacts,
} from "#server/utils/onboarding/discord";
import {
	auditOnboardingStageChange,
	authorizeOnboardingManager,
	parseOnboardingInput,
	readOnboardingStageParam,
	readOnboardingState,
	unwrapOnboardingChange,
} from "#server/utils/onboarding/route";
import { updateOnboardingStage } from "#server/utils/onboarding/stages";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingStagePatchBodySchema } from "#shared/schemas/onboarding";
import { isDeepEqual } from "#shared/utils/isDeepEqual";
import { readBody } from "nuxt/server";

const AUDITED_FIELDS = [
	"name",
	"enabled",
	"trigger",
	"challenge",
	"question",
	"answers",
	"maxAttempts",
	"timeLimit",
	"roleId",
	"failureAction",
	"failureTimeout",
] as const satisfies readonly (keyof OnboardingStage)[];

/**
 * `PATCH /api/guilds/:guild/onboarding/stages/:stage`: edits a stage. The
 * body has the fields that change and the revision the page read; the stage
 * they make with the others is checked whole. Answers the whole onboarding;
 * 404 `{ code: "unknown" }`, and the refusals of `POST`. Only a role that
 * differs from the stored one is checked, so a role that WolfStar can no
 * longer give does not keep the stage from being renamed or switched off.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		const stageId = readOnboardingStageParam(event);
		const body = parseOnboardingInput(OnboardingStagePatchBodySchema, await readBody(event));

		const facts = await fetchOnboardingDiscordFacts(guild);

		const { before, after } = unwrapOnboardingChange(
			await updateOnboardingStage(
				onboardingStore,
				guild.id,
				body.revision,
				stageId,
				body.stage,
				{
					canGiveRole: (roleId) => canGiveOnboardingRole(facts, roleId),
					captchaAvailable: isOnboardingCaptchaAvailable(),
				},
			),
		);

		const changed = AUDITED_FIELDS.filter((key) => !isDeepEqual(before[key], after[key]));
		if (changed.length > 0) {
			const pick = (stage: OnboardingStage) =>
				Object.fromEntries(changed.map((key) => [key, stage[key]]));
			auditOnboardingStageChange(event, pick(before), pick(after), before.name);
		}

		return readOnboardingState(onboardingStore, guild, { facts });
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
