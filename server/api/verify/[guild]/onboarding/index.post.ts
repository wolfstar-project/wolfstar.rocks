import { readJoinGuardVerifyGuildParam, parseJoinGuardInput } from "#server/utils/join-guard/route";
import { readVerifyMemberId } from "#server/utils/join-guard/verify";
import {
	submitOnboardingCaptcha,
	throwOnboardingCaptchaError,
} from "#server/utils/onboarding/verify";
import { defineWrappedResponseHandler } from "#server/utils/wrappedEventHandler";
import { OnboardingCaptchaBodySchema } from "#shared/schemas/onboarding";
import { useLogger } from "evlog";
import { readBody, setResponseStatus } from "nuxt/server";

/**
 * `POST /api/verify/:guild/onboarding` (signed in): the member solved the
 * captcha of the `Captcha` stage they wait at, with `{ verificationId,
 * turnstileToken }` (an `OnboardingCaptchaBody`). Answers 202 `{ id }` of the
 * `OnboardingRequest` the bot passes them for; see
 * `GET /api/verify/:guild/onboarding/requests/:request` for how it went.
 * Refusals, with `{ code }`: 409 `notWaiting`, 403 `captcha`, 503
 * `captchaUnavailable` (no Turnstile keys, or Cloudflare unreachable).
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = readJoinGuardVerifyGuildParam(event);
		const body = parseJoinGuardInput(
			OnboardingCaptchaBodySchema,
			(await readBody(event)) ?? {},
		);
		const userId = await readVerifyMemberId(event);

		const requestId = await submitOnboardingCaptcha({ guildId, userId, ...body }).catch(
			throwOnboardingCaptchaError,
		);

		useLogger(event).set({ onboarding: { guildId, requestId } });
		setResponseStatus(event, 202);
		return { id: requestId };
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		// A member passes a stage once; a few tries cover a captcha that expired.
		// A refused try counts too.
		rateLimit: {
			countFailures: true,
			enabled: true,
			limit: 5,
			scope: "route",
			window: minutes(1),
		},
	},
);
