import type { OnboardingState } from "#shared/utils/onboarding";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	checkOnboardingLogChannel,
	fetchOnboardingDiscordFacts,
} from "#server/utils/onboarding/discord";
import {
	auditOnboardingLogChannelChange,
	authorizeOnboardingManager,
	parseOnboardingInput,
	readOnboardingState,
	throwOnboardingLogChannelFailure,
	unwrapOnboardingChange,
} from "#server/utils/onboarding/route";
import { setOnboardingLogChannel } from "#server/utils/onboarding/stages";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingSettingsBodySchema } from "#shared/schemas/onboarding";
import { readBody } from "nuxt/server";

/**
 * `PATCH /api/guilds/:guild/onboarding`: sets the log channel, or none with
 * `null`. The body carries the revision the page read. Answers the whole
 * onboarding; 422 `{ code: "logChannel" }` for a channel that is no text
 * channel of the server and `{ code: "logPermissions", missing }` for one
 * WolfStar cannot post in, the saved channel staying as it was; 409
 * `{ code: "conflict" }` when the onboarding changed since that revision.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<OnboardingState> => {
		const { guild } = useManagedGuild(event);
		const body = parseOnboardingInput(OnboardingSettingsBodySchema, await readBody(event));

		const facts = await fetchOnboardingDiscordFacts(guild);
		if (body.logChannelId !== null) {
			const failure = checkOnboardingLogChannel(facts, body.logChannelId);
			if (failure !== null) throwOnboardingLogChannelFailure(failure);
		}

		const change = unwrapOnboardingChange(
			await setOnboardingLogChannel(
				onboardingStore,
				guild.id,
				body.revision,
				body.logChannelId,
			),
		);

		auditOnboardingLogChannelChange(event, change.before, body.logChannelId);
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
