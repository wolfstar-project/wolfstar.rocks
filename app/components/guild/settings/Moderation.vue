<template>
	<DashboardPageHeader
		:title="ts('guild_settings.moderation.title')"
		:description="ts('guild_settings.moderation.subtitle')"
	/>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.moderation.form_aria')"
		@error="onError"
	>
		<div class="flex flex-col gap-5">
			<section class="console-card" :aria-labelledby="casesHeadingId">
				<div class="moderation-card-heading">
					<h2 :id="casesHeadingId">{{ ts("guild_settings.moderation.cases_title") }}</h2>
					<span aria-hidden="true"></span>
				</div>

				<div class="moderation-fields">
					<SelectChannel
						v-for="config in ConfigurableModerationChannels"
						:key="config.key"
						v-model="state[config.key]"
						layout="field"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
				</div>

				<div class="mt-3">
					<GuildSettingsToggleRow
						v-for="config in ConfigurableModerationToggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</section>

			<section class="console-card" :aria-labelledby="reportsHeadingId">
				<div class="moderation-card-heading">
					<h2 :id="reportsHeadingId">{{ ts("guild_settings.reports.title") }}</h2>
					<span aria-hidden="true"></span>
				</div>
				<p class="mt-1.5 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.reports.subtitle") }}
				</p>

				<div class="moderation-fields">
					<SelectChannel
						v-for="config in ConfigurableReportChannels"
						:key="config.key"
						v-model="state[config.key]"
						layout="field"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
					<SelectRole
						v-for="config in ConfigurableReportRoles"
						:key="config.key"
						v-model="state[config.key]"
						layout="field"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
				</div>

				<div class="mt-3">
					<GuildSettingsToggleRow
						v-for="config in ConfigurableReportToggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</section>
		</div>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import {
	ConfigurableModerationChannels,
	ConfigurableModerationToggles,
	ConfigurableReportChannels,
	ConfigurableReportRoles,
	ConfigurableReportToggles,
} from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const casesHeadingId = useId();
const reportsHeadingId = useId();

// Reports are reviewed by the same moderators and can close into a case, so
// they are set up on this page rather than on one of their own.
const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: [
		...ConfigurableModerationChannels.map((entry) => entry.key),
		...ConfigurableReportChannels.map((entry) => entry.key),
		...ConfigurableReportRoles.map((entry) => entry.key),
	],
	toggles: [
		...ConfigurableModerationToggles.map((entry) => entry.key),
		...ConfigurableReportToggles.map((entry) => entry.key),
	],
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.moderation-card-heading {
	@apply flex items-center gap-3;
}

.moderation-card-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.moderation-card-heading span {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

/* Two fields share a row from `md` up, as in the design; one keeps its half. */
.moderation-fields {
	@apply mt-4 grid gap-5 md:grid-cols-2;
}
</style>
