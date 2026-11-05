<template>
	<div class="flex flex-col gap-2">
		<p class="text-sm">
			{{ ts("verify.trust.yours", { level: ts(JOIN_GUARD_TRUST_KEYS[level]) }) }}
			<span class="text-muted">
				{{ ts("verify.trust.minimum", { level: ts(JOIN_GUARD_TRUST_KEYS[minimum]) }) }}
			</span>
		</p>
		<ol class="grid grid-cols-4 gap-1.5" :aria-label="ts('verify.trust.scale_aria')">
			<li
				v-for="step in JoinGuardTrustLevels"
				:key="step"
				class="flex flex-col gap-1"
				:aria-current="step === level ? 'step' : undefined"
			>
				<span
					class="trust-bar"
					:class="
						step <= level ? `trust-bar--${JOIN_GUARD_TRUST_TONES[level]}` : undefined
					"
					aria-hidden="true"
				></span>
				<span
					class="text-[0.6875rem] leading-tight"
					:class="step === level ? 'font-bold text-highlighted' : 'text-muted'"
				>
					{{ ts(JOIN_GUARD_TRUST_KEYS[step]) }}
					<span v-if="step === minimum" class="block font-semibold text-toned">
						{{ ts("verify.trust.minimum_mark") }}
					</span>
				</span>
			</li>
		</ol>
	</div>
</template>

<script setup lang="ts">
import { JoinGuardTrustLevels, type JoinGuardTrust } from "#shared/utils/join-guard";

/**
 * The four trust levels of the checkpoint, from Not Trusted to Very Trusted,
 * filled up to the member's and with the server's minimum marked.
 */
defineProps<{
	level: JoinGuardTrust;
	minimum: JoinGuardTrust;
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.trust-bar {
	@apply h-1.5 rounded-full;
	background-color: var(--ui-border, oklch(50% 0 0 / 0.2));
}

.trust-bar--error {
	background-color: var(--color-error);
}

.trust-bar--warning {
	background-color: var(--color-warning);
}

.trust-bar--success {
	background-color: var(--color-success);
}

.trust-bar--primary {
	background-color: var(--color-primary);
}
</style>
