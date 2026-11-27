<template>
	<section
		v-if="result.state === 'done'"
		class="verify-card verify-card--success"
		:aria-labelledby="headingId"
	>
		<UIcon name="heroicons:check-circle" class="size-9 text-success" aria-hidden="true" />
		<h2 :id="headingId" ref="resultRef" tabindex="-1" class="verify-result">
			{{ ts("verify.onboarding.done_title", { stage: prompt.stageName }) }}
		</h2>
		<p class="text-sm text-toned">
			{{ ts("verify.onboarding.done_body", { server: guildName }) }}
		</p>
		<div>
			<UButton
				color="primary"
				:to="discordLink"
				target="_blank"
				rel="noopener"
				icon="ph:discord-logo-fill"
			>
				{{ ts("verify.open_discord") }}
			</UButton>
		</div>
	</section>

	<section v-else class="verify-card" :aria-labelledby="headingId">
		<h2 :id="headingId" class="text-base font-bold">
			{{ ts("verify.onboarding.title", { stage: prompt.stageName }) }}
		</h2>
		<p class="text-sm leading-relaxed text-toned">
			{{ ts("verify.onboarding.body", { server: guildName }) }}
		</p>
		<p v-if="prompt.expiresAt" class="text-[0.8125rem] text-muted">
			{{ ts("verify.onboarding.deadline") }}
			<NuxtTime :locale :datetime="prompt.expiresAt" time-style="short" />
		</p>

		<VerifyTurnstile ref="turnstile" :site-key="prompt.siteKey" @token="token = $event" />

		<p v-if="message" ref="resultRef" tabindex="-1" class="verify-error" role="alert">
			{{ message }}
		</p>

		<div class="flex flex-wrap items-center gap-3">
			<UButton
				color="primary"
				:loading="result.state === 'sending'"
				:disabled="!canSubmit"
				@click="send"
			>
				{{ ts("verify.waiting.verify") }}
			</UButton>
			<span v-if="result.state === 'sending'" class="text-[0.8125rem] text-muted">
				{{ ts("verify.waiting.sending") }}
			</span>
			<span v-else-if="!token" class="text-[0.8125rem] text-muted">
				{{ ts("verify.waiting.captcha_first") }}
			</span>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { OnboardingCaptchaPrompt, OnboardingRequestError } from "#shared/utils/onboarding";
import type { OnboardingCaptchaRefusal } from "~/composables/useOnboardingCaptcha";

/**
 * The `Captcha` stage of the onboarding on the verification page: the member
 * solves the captcha, and WolfStar passes them for the stage in Discord.
 */
const { guildId, guildName, prompt } = defineProps<{
	guildId: string;
	guildName: string;
	prompt: OnboardingCaptchaPrompt;
}>();

const { ts } = useI18n();
const { locale } = useAppLocale();
const { result, submit } = useOnboardingCaptcha(() => guildId);

const headingId = useId();
const resultRef = useTemplateRef<HTMLElement>("resultRef");
const turnstile = useTemplateRef<{ reset: () => void }>("turnstile");
const token = ref<string | null>(null);

const discordLink = computed(() => `https://discord.com/channels/${guildId}`);
const canSubmit = computed(() => result.value.state !== "sending" && token.value !== null);

const REFUSAL_KEYS: Record<OnboardingCaptchaRefusal, string> = {
	captcha: "verify.result.captcha",
	captchaUnavailable: "verify.result.captcha_unavailable",
	generic: "verify.result.refused",
	notWaiting: "verify.onboarding.not_waiting",
	rateLimited: "verify.result.rate_limited",
};

const FAILURE_KEYS: Record<OnboardingRequestError["code"], string> = {
	expired: "verify.onboarding.failures.expired",
	failed: "verify.onboarding.failures.failed",
	notMember: "verify.onboarding.failures.not_member",
	off: "verify.onboarding.failures.off",
	roleRefused: "verify.onboarding.failures.role_refused",
	stale: "verify.onboarding.failures.stale",
	unknown: "verify.onboarding.failures.failed",
};

const message = computed(() => {
	const current = result.value;
	switch (current.state) {
		case "failed":
			return ts(
				FAILURE_KEYS[current.error.code as OnboardingRequestError["code"]] ??
					"verify.onboarding.failures.failed",
			);
		case "timeout":
			return ts("verify.onboarding.timeout");
		case "unreachable":
			return ts("verify.result.unreachable");
		case "refused":
			return ts(REFUSAL_KEYS[current.code]);
		default:
			return null;
	}
});

async function send() {
	if (!canSubmit.value || token.value === null) return;
	const outcome = await submit({
		turnstileToken: token.value,
		verificationId: prompt.verificationId,
	});
	// A token is good once: a refusal or a failure needs a new one.
	if (outcome.state !== "done") {
		token.value = null;
		turnstile.value?.reset();
	}
	await nextTick();
	resultRef.value?.focus();
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.verify-card {
	@apply flex flex-col gap-4 rounded-xl p-5 sm:p-6;
	background-color: var(--ui-bg-elevated, var(--color-base-200));
	border: 1px solid var(--home-border-subtle);
}

.verify-card--success {
	@apply items-start;
}

.verify-result {
	@apply text-lg font-bold focus:outline-none;
}

.verify-error {
	@apply rounded-lg px-3 py-2.5 text-[0.8125rem] leading-normal focus:outline-none;
	background-color: color-mix(in oklab, var(--color-error) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-error) 40%, transparent);
}
</style>
