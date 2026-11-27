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
		<GuildSettingsForm
			:schema="schema"
			:state="form"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.onboarding.form_aria')"
			@error="onError"
		>
			<GuildModuleBanner
				icon="ic:round-checklist"
				:title="ts('guild_settings.onboarding.title')"
				:hint="verdictHint"
				:on="form.onboardingEnabled"
			>
				<USwitch
					v-model="form.onboardingEnabled"
					:aria-label="ts('guild_settings.onboarding.switch_aria')"
				/>
			</GuildModuleBanner>
		</GuildSettingsForm>

		<GuildOnboardingConflict v-if="onboarding.conflict.value" :onboarding="onboarding" />
		<GuildOnboardingBlockers v-if="state.blockers.length > 0" :state="state" />
		<GuildOnboardingStages :state="state" :onboarding="onboarding" />

		<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
			<GuildOnboardingMessage :channel-id="state.messageChannelId" />
			<GuildOnboardingLogChannel :channel-id="state.logChannelId" :onboarding="onboarding" />
		</div>
	</template>
</template>

<script setup lang="ts">
import { onboardingVerdict } from "#shared/utils/onboarding";
/**
 * The Onboarding section: what a new member must pass before they are in.
 * The module's switch is staged with the save bar, like every module's. The
 * stages and the log channel are written at once, each write against the
 * revision the page read, so an edit never overwrites a newer one.
 */
const { ts, tc } = useI18n();
const text = useOnboardingText();
const { activeGuildId } = useActiveGuild();

// The switch is a setting: what the banner says follows it as it is staged.
const {
	mapToGuildData,
	onError,
	schema,
	state: form,
} = useSettingsForm({ toggles: ["onboardingEnabled"] });

const onboarding = useOnboarding(activeGuildId);
const { refresh, state, status } = onboarding;

const isLoading = computed(
	() => (status.value === "idle" || status.value === "pending") && state.value === null,
);
const hasFailed = computed(() => status.value === "error" && state.value === null);

const enabledCount = computed(
	() => state.value?.stages.filter((stage) => stage.enabled).length ?? 0,
);

const verdictHint = computed(() =>
	state.value
		? onboardingVerdictHint(
				onboardingVerdict({ ...state.value, enabled: form.onboardingEnabled === true }),
				text,
			)
		: "",
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft badge: a blurple tint, the count in monospace. */
.ob-badge {
	@apply inline-flex h-6.5 items-center rounded-full bg-primary/15 px-2.5 font-mono text-xs font-semibold text-primary theme-light:text-default;
}

.ob-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border);
}
</style>
