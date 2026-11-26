<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="ob-heading">
			<h3 :id="headingId">{{ ts("guild_settings.onboarding.stages.title") }}</h3>
			<span class="ob-heading-rule" aria-hidden="true"></span>
			<span class="ob-count">
				{{
					ts("guild_settings.onboarding.stages.count", {
						count: state.stages.length,
						max: MaximumOnboardingStages,
					})
				}}
			</span>
		</div>
		<p class="mt-1.5 text-[0.8125rem] leading-normal text-muted">
			{{ ts("guild_settings.onboarding.stages.help") }}
		</p>

		<div v-if="state.stages.length === 0" class="ob-empty mt-4">
			<span class="ob-empty-icon" aria-hidden="true">
				<UIcon name="ic:round-checklist" class="size-6 text-muted" />
			</span>
			<p class="text-base font-bold">
				{{ ts("guild_settings.onboarding.stages.empty_title") }}
			</p>
			<p class="max-w-95 text-[0.8125rem] leading-[1.55] text-muted">
				{{ ts("guild_settings.onboarding.stages.empty_description") }}
			</p>
		</div>

		<ol v-else class="mt-4 flex flex-col">
			<li v-for="(stage, index) in state.stages" :key="stage.id" class="ob-item">
				<GuildOnboardingStageRow
					:stage="stage"
					:number="index + 1"
					:status="statusOf(stage)"
					:counts="state.weekByStage[stage.id] ?? NO_COUNTS"
				/>
			</li>
		</ol>
	</section>
</template>

<script setup lang="ts">
import type { OnboardingCounts, OnboardingStage, OnboardingState } from "#shared/utils/onboarding";
import { blockedOnboardingStageIds, MaximumOnboardingStages } from "#shared/utils/onboarding";
/**
 * The stages of the open server, in the order a member meets them, each with
 * whether the bot can run it and how many members passed it this week.
 */
const { state } = defineProps<{
	state: Pick<OnboardingState, "blockers" | "stages" | "weekByStage">;
}>();

const { ts } = useI18n();

const headingId = useId();

const NO_COUNTS: OnboardingCounts = { failed: 0, passed: 0, waiting: 0 };

const blocked = computed(() => blockedOnboardingStageIds(state.blockers, state.stages));

function statusOf(stage: OnboardingStage): "ready" | "blocked" | "off" {
	if (!stage.enabled) return "off";
	return blocked.value.has(stage.id) ? "blocked" : "ready";
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.ob-heading {
	@apply flex flex-wrap items-center gap-3;
}

.ob-heading h3 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.ob-heading-rule {
	@apply h-px min-w-6 flex-1;
	background-color: var(--console-border);
}

/* The design system's soft badge: a blurple tint, the count in monospace. */
.ob-count {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.ob-item + .ob-item {
	border-top: 1px solid var(--home-border-subtle);
}

.ob-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}

.ob-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}
</style>
