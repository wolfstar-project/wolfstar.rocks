import { useRuntimeConfig } from "nuxt/server";

/**
 * Whether the site checks the captcha of a `Captcha` stage: both Turnstile
 * keys are set. Without them the verification page cannot serve it, so the
 * editor does not offer it and a stage that has it is blocked.
 */
export function isOnboardingCaptchaAvailable(): boolean {
	const config = useRuntimeConfig();
	return Boolean(config.turnstileSecretKey && config.public.turnstileSiteKey);
}
