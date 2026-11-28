<template>
	<article
		class="ob-stage"
		:class="{ 'ob-stage--off': status === 'off' }"
		:aria-labelledby="nameId"
	>
		<span class="ob-number" aria-hidden="true">{{ number }}</span>
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-2">
				<h4 :id="nameId" class="min-w-0 truncate text-[0.9375rem] font-bold">
					{{ stage.name }}
				</h4>
				<span class="ob-pill" :class="`ob-pill--${status}`">{{ statusLabel }}</span>
			</div>
			<ul class="mt-2 flex flex-wrap gap-1.5">
				<li
					v-for="chip in chips"
					:key="chip.text"
					class="ob-chip"
					:class="`ob-chip--${chip.tone}`"
				>
					{{ chip.text }}
				</li>
			</ul>
			<p class="mt-2 font-mono text-xs text-muted">
				{{
					ts("guild_settings.onboarding.stages.stats", {
						failed: counts.failed,
						passed: counts.passed,
					})
				}}
				<template v-if="counts.waiting > 0">
					·
					{{ tc("guild_settings.onboarding.stages.stats_waiting", counts.waiting) }}
				</template>
			</p>
		</div>
		<div class="ob-actions">
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-arrow-upward"
				:disabled="disabled || first"
				:aria-label="
					ts('guild_settings.onboarding.stages.move_up_aria', { name: stage.name })
				"
				@click="emit('move', -1)"
			/>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-arrow-downward"
				:disabled="disabled || last"
				:aria-label="
					ts('guild_settings.onboarding.stages.move_down_aria', { name: stage.name })
				"
				@click="emit('move', 1)"
			/>
			<UButton
				color="neutral"
				variant="outline"
				size="sm"
				:disabled="disabled"
				:aria-label="ts('guild_settings.onboarding.stages.edit_aria', { name: stage.name })"
				@click="emit('edit')"
			>
				{{ ts("guild_settings.onboarding.stages.edit") }}
			</UButton>
			<USwitch
				:model-value="stage.enabled"
				:disabled="disabled"
				:aria-label="
					ts('guild_settings.onboarding.stages.toggle_aria', { name: stage.name })
				"
				@update:model-value="emit('toggle', $event)"
			/>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { OnboardingCounts, OnboardingStage } from "#shared/utils/onboarding";
/**
 * A stage as the section lists it: its place in the sequence, its name,
 * whether the bot can run it, what it asks and what a failure costs, how many
 * members passed it this week, and its buttons. Two buttons move it, so the
 * order changes with a keyboard as it does with a pointer.
 */
const {
	stage,
	status,
	first = false,
	last = false,
	disabled = false,
} = defineProps<{
	stage: OnboardingStage;
	/** Its place in the sequence, from 1. */
	number: number;
	status: "ready" | "blocked" | "off";
	counts: OnboardingCounts;
	/** Whether it is the first, or the last, of the sequence: it does not move further. */
	first?: boolean;
	last?: boolean;
	/** A write is in flight, or the page must reload before the next one. */
	disabled?: boolean;
}>();

const emit = defineEmits<{
	toggle: [enabled: boolean];
	edit: [];
	move: [direction: -1 | 1];
}>();

const { ts, tc } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();

const nameId = useId();

const chips = computed(() => onboardingStageChips(stage, text, names));

// Literal keys, one per status, so the i18n report sees each.
const STATUS_KEYS = {
	blocked: "guild_settings.onboarding.stages.status.blocked",
	off: "guild_settings.onboarding.stages.status.off",
	ready: "guild_settings.onboarding.stages.status.ready",
} as const;

const statusLabel = computed(() => ts(STATUS_KEYS[status]));
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The buttons go under the stage on a phone, and beside it from `sm`. */
.ob-stage {
	@apply grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-3 py-3.5 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto];
}

.ob-actions {
	@apply col-start-2 flex items-center gap-1.5 sm:col-start-3;
}

.ob-stage--off .ob-number,
.ob-stage--off .ob-chip {
	opacity: 0.62;
}

.ob-number {
	@apply flex size-7 items-center justify-center rounded-full font-mono text-[0.8125rem] font-bold text-highlighted;
	background-color: var(--console-active);
}

.ob-chip,
.ob-pill {
	@apply inline-flex h-6 items-center rounded-full px-2.25 text-xs font-semibold whitespace-nowrap text-highlighted;
	background-color: var(--console-active);
}

.ob-pill {
	@apply h-5.5 text-[0.6875rem];
}

.ob-chip--error {
	background-color: color-mix(in oklab, var(--color-error) 16%, transparent);
}

.ob-chip--warning,
.ob-pill--blocked {
	background-color: color-mix(in oklab, var(--color-warning) 16%, transparent);
}

.ob-pill--ready {
	background-color: color-mix(in oklab, var(--color-success) 16%, transparent);
}

.ob-pill--off {
	@apply text-muted;
}
</style>
