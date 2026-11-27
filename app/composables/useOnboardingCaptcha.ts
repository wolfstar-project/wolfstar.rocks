import type { OnboardingCaptchaBody } from "#shared/schemas/onboarding";
import type { OnboardingRequestState } from "#shared/utils/onboarding";
import type { MaybeRefOrGetter } from "vue";

/** Why the page refused to ask the bot to pass the member, before writing anything. */
export type OnboardingCaptchaRefusal =
	| "notWaiting"
	| "captcha"
	| "captchaUnavailable"
	| "rateLimited"
	| "generic";

/** Where the member's captcha stands on the page. */
export type OnboardingCaptchaState =
	| { state: "idle" }
	| { state: "sending" }
	| JoinGuardRequestOutcome
	| { state: "refused"; code: OnboardingCaptchaRefusal };

const REFUSAL_CODES = new Set<string>(["notWaiting", "captcha", "captchaUnavailable"]);

function readRefusal(error: unknown): OnboardingCaptchaRefusal {
	if (readJoinGuardRouteStatus(error) === 429) return "rateLimited";
	const code = readJoinGuardRouteCode(error);
	return code !== null && REFUSAL_CODES.has(code)
		? (code as OnboardingCaptchaRefusal)
		: "generic";
}

/**
 * The `Captcha` stage of the onboarding on the verification page: sends the
 * solved captcha, which writes an `OnboardingRequest` the bot acts on, then
 * asks for it until the bot passed the member or said why not.
 */
export function useOnboardingCaptcha(
	guildId: MaybeRefOrGetter<string>,
	polling: JoinGuardPolling = {},
) {
	const result = ref<OnboardingCaptchaState>({ state: "idle" });

	async function submit(body: OnboardingCaptchaBody): Promise<OnboardingCaptchaState> {
		const guild = toValue(guildId);
		result.value = { state: "sending" };
		let requestId: string;
		try {
			({ id: requestId } = await $fetch<{ id: string }>(`/api/verify/${guild}/onboarding`, {
				body,
				method: "POST",
			}));
		} catch (error) {
			result.value = { code: readRefusal(error), state: "refused" };
			return result.value;
		}
		result.value = await settleJoinGuardRequest(
			() =>
				$fetch<OnboardingRequestState>(
					`/api/verify/${guild}/onboarding/requests/${requestId}`,
				),
			polling,
		);
		return result.value;
	}

	return { result, submit };
}
