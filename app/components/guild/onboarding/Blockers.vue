<template>
	<section class="console-card border-l-[3px] border-l-warning" :aria-labelledby="headingId">
		<h3 :id="headingId" class="flex items-center gap-2 text-[1.0625rem] font-semibold">
			<UIcon
				name="ic:round-warning-amber"
				class="size-5 shrink-0 text-warning"
				aria-hidden="true"
			/>
			{{ ts("guild_settings.onboarding.blockers.title") }}
		</h3>
		<ul class="mt-3 flex flex-col gap-3">
			<li v-for="line in lines" :key="line.title">
				<p class="text-sm font-semibold text-highlighted">{{ line.title }}</p>
				<p class="text-[0.8125rem] leading-normal text-muted">{{ line.fix }}</p>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import type { OnboardingState } from "#shared/utils/onboarding";
/**
 * What keeps the onboarding from working: one line per blocker, what it
 * stops and what the administrator does about it.
 */
const { state } = defineProps<{
	state: Pick<OnboardingState, "blockers" | "stages" | "logChannelId">;
}>();

const { ts } = useI18n();
const text = useOnboardingText();
const names = useJoinGuardNames();

const headingId = useId();

const lines = computed(() =>
	state.blockers.map((blocker) =>
		onboardingBlockerLine(
			blocker,
			{ logChannelId: state.logChannelId, stages: state.stages },
			text,
			names,
		),
	),
);
</script>
