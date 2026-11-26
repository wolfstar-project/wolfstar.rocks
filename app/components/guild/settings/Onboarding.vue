<template>
	<DashboardPageHeader
		:title="ts('guild_settings.onboarding.title')"
		:description="ts('guild_settings.onboarding.subtitle')"
	>
		<template v-if="state">
			<span class="ob-badge">
				{{
					tc("guild_settings.onboarding.stages_badge", {
						count: state.stages.length,
						on: enabledCount,
					})
				}}
			</span>
			<span class="ob-badge">
				{{ tc("guild_settings.onboarding.passed_badge", state.week.passed) }}
			</span>
		</template>
	</DashboardPageHeader>

	<div
		v-if="isLoading"
		class="flex flex-col gap-4"
		role="status"
		:aria-label="ts('guild_settings.onboarding.loading_aria')"
	>
		<USkeleton class="h-20 w-full rounded-lg" />
		<USkeleton class="h-56 w-full rounded-lg" />
	</div>

	<div v-else-if="hasFailed" class="ob-empty" role="alert">
		<p class="text-toned">{{ ts("guild_settings.onboarding.load_failed") }}</p>
		<UButton color="neutral" variant="outline" @click="refresh()">
			{{ ts("guild_settings.onboarding.retry") }}
		</UButton>
	</div>

	<template v-else-if="state">
		<GuildModuleBanner
			icon="ic:round-checklist"
			:title="ts('guild_settings.onboarding.title')"
			:hint="verdictHint"
			:on="state.enabled"
		>
			<span class="ob-state" :class="{ 'ob-state--on': state.enabled }">
				{{
					state.enabled
						? ts("guild_settings.onboarding.state_on")
						: ts("guild_settings.onboarding.state_off")
				}}
			</span>
		</GuildModuleBanner>

		<GuildOnboardingBlockers v-if="state.blockers.length > 0" :state="state" />
		<GuildOnboardingStages :state="state" />

		<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
			<GuildOnboardingMessage :channel-id="state.messageChannelId" />
			<GuildOnboardingLogChannel :channel-id="state.logChannelId" />
		</div>
	</template>
</template>

<script setup lang="ts">
import { onboardingVerdict } from "#shared/utils/onboarding";
/**
 * The Onboarding section: what a new member must pass before they are in.
 * The stages and the log channel are written at once, each write against the
 * revision the page read, so an edit never overwrites a newer one.
 */
const { ts, tc } = useI18n();
const text = useOnboardingText();
const { activeGuildId } = useActiveGuild();

const { refresh, state, status } = useOnboarding(activeGuildId);

const isLoading = computed(
	() => (status.value === "idle" || status.value === "pending") && state.value === null,
);
const hasFailed = computed(() => status.value === "error" && state.value === null);

const enabledCount = computed(
	() => state.value?.stages.filter((stage) => stage.enabled).length ?? 0,
);

const verdictHint = computed(() =>
	state.value ? onboardingVerdictHint(onboardingVerdict(state.value), text) : "",
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft badge: a blurple tint, the count in monospace. */
.ob-badge {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.ob-state {
	@apply inline-flex h-6.5 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold text-muted;
	background-color: var(--console-active);
}

.ob-state--on {
	@apply text-highlighted;
	background-color: color-mix(in oklab, var(--color-success) 16%, transparent);
}

.ob-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}
</style>
