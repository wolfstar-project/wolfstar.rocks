import type { OnboardingState } from "#shared/utils/onboarding";
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
	readOnboardingState,
	throwOnboardingRoleFailure,
	unwrapOnboardingChange,
} from "#server/utils/onboarding/route";
import { createOnboardingStage } from "#server/utils/onboarding/stages";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingStageCreateBodySchema } from "#shared/schemas/onboarding";
import { readBody, setResponseStatus } from "nuxt/server";

/**
 * `POST /api/guilds/:guild/onboarding/stages`: creates a stage after the ones
 * the guild has. The body carries the stage and the revision the page read;
 * the fields the stage leaves out take the bot's defaults. Answers 201 with
 * the whole onboarding; 400 `{ code: "stage", problem }` for a stage the bot
 * could not run, `{ code: "invalid", errors }` for a field of the wrong type
 * and `{ code: "limit" }` past 5 stages; 409 `{ code: "nameTaken" }` for a
 * name another stage has, whatever its case, and `{ code: "conflict" }` when
 * the onboarding changed since that revision; 422 `{ code: "role" }` for a
 * role WolfStar cannot give.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		const body = parseOnboardingInput(OnboardingStageCreateBodySchema, await readBody(event));

		const facts = await fetchOnboardingDiscordFacts(guild);
		if (body.stage.roleId !== null && !canGiveOnboardingRole(facts, body.stage.roleId)) {
			throwOnboardingRoleFailure();
		}

		const stage = unwrapOnboardingChange(
			await createOnboardingStage(onboardingStore, guild.id, body.revision, body.stage, {
				captchaAvailable: isOnboardingCaptchaAvailable(),
			}),
		);

		auditOnboardingStageChange(event, null, stage, stage.name);
		setResponseStatus(event, 201);
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
