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
			<GuildModuleBanner
				icon="lucide:gavel"
				:title="ts('dashboard.nav.moderation')"
				:hint="ts('guild_settings.moderation.module_hint')"
				:on="state.modulesModeration === true"
			>
				<USwitch
					v-model="state.modulesModeration"
					:aria-label="
						ts('guild_settings.modules.toggle_aria', {
							title: ts('dashboard.nav.moderation'),
						})
					"
				/>
			</GuildModuleBanner>

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
					<GuildSettingsNumberField
						v-for="config in ConfigurableModerationNumbers"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:label="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
						:unit="ts('guild_settings.moderation.minutes')"
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

			<section class="console-card" :aria-labelledby="lockdownHeadingId">
				<div class="moderation-card-heading">
					<h2 :id="lockdownHeadingId">
						{{ ts("guild_settings.moderation.lockdown_title") }}
					</h2>
					<span aria-hidden="true"></span>
				</div>
				<p class="mt-1.5 text-[0.8125rem] text-muted">
					{{ ts("guild_settings.moderation.lockdown_help") }}
				</p>
				<div class="mt-4">
					<SelectChannels
						v-model="state.moderationLockdownChannels"
						layout="chips"
						:guild="guildData"
						:channel-types="LOCKDOWN_CHANNEL_TYPES"
						:label="translateEntry(ModerationLockdownChannels, 'name')"
						:tooltip-title="translateEntry(ModerationLockdownChannels, 'description')"
						:empty-label="ts('guild_settings.moderation.lockdown_empty')"
						:dialog-title="ts('guild_settings.moderation.lockdown_dialog_title')"
						:search-placeholder="ts('guild_settings.moderation.lockdown_search')"
						:count-label="
							(count) =>
								ts('guild_settings.moderation.lockdown_count', {
									count,
									maximum: MAXIMUM_LOCKDOWN_CHANNELS,
								})
						"
					/>
				</div>
			</section>

			<section class="console-card" :aria-labelledby="responsesHeadingId">
				<div class="moderation-card-heading">
					<h2 :id="responsesHeadingId">
						{{ ts("guild_settings.moderation.responses_title") }}
					</h2>
					<span aria-hidden="true"></span>
				</div>
				<p class="mt-1.5 text-[0.8125rem] text-muted">
					{{
						ts("guild_settings.moderation.responses_help", {
							placeholders: responsePlaceholders,
						})
					}}
				</p>

				<div class="moderation-fields">
					<UFormField
						v-for="config in ConfigurableModerationResponses"
						:key="config.key"
						:name="config.key"
						:label="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
						:hint="`${state[config.key].trim().length}/${SETTING_TEXT_LIMITS[config.key]}`"
					>
						<UInput
							v-model="state[config.key]"
							:maxlength="SETTING_TEXT_LIMITS[config.key]"
							autocomplete="off"
							class="w-full"
						/>
					</UFormField>
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

	<!-- Not a setting: the reports those settings route, to review. -->
	<GuildReviewQueue />
</template>

<script setup lang="ts">
import {
	MODERATION_RESPONSE_PLACEHOLDERS,
	SETTING_LIST_LIMITS,
	SETTING_TEXT_LIMITS,
} from "#shared/utils/settings-choices";
import {
	ConfigurableModerationChannels,
	ConfigurableModerationResponses,
	ConfigurableModerationNumbers,
	ConfigurableModerationToggles,
	ConfigurableReportChannels,
	ConfigurableReportRoles,
	ConfigurableReportToggles,
	ModerationLockdownChannels,
} from "#shared/utils/settingsDataEntries";
import { ChannelType } from "discord-api-types/v10";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const casesHeadingId = useId();
const lockdownHeadingId = useId();
const responsesHeadingId = useId();
const reportsHeadingId = useId();

const MAXIMUM_LOCKDOWN_CHANNELS = SETTING_LIST_LIMITS.moderationLockdownChannels;

// What `/lockdown channel:` takes, but the threads, which a lockdown locks one
// by one. Read in setup, not at module scope: see the `discord-api-types` SSR
// note in CLAUDE.md.
const LOCKDOWN_CHANNEL_TYPES = [
	ChannelType.GuildText,
	ChannelType.GuildAnnouncement,
	ChannelType.GuildVoice,
	ChannelType.GuildStageVoice,
	ChannelType.GuildCategory,
	ChannelType.GuildForum,
	ChannelType.GuildMedia,
];

// Written out as the bot reads them, so they are not translated.
const responsePlaceholders = MODERATION_RESPONSE_PLACEHOLDERS.map((name) => `{${name}}`).join(", ");

// Reports are reviewed by the same moderators and can close into a case, so
// they are set up on this page rather than on one of their own.
const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: [
		...ConfigurableModerationChannels.map((entry) => entry.key),
		...ConfigurableReportChannels.map((entry) => entry.key),
		...ConfigurableReportRoles.map((entry) => entry.key),
	],
	toggles: [
		"modulesModeration",
		...ConfigurableModerationToggles.map((entry) => entry.key),
		...ConfigurableReportToggles.map((entry) => entry.key),
	],
	many: ["moderationLockdownChannels"],
	numbers: ConfigurableModerationNumbers.map((entry) => entry.key),
	texts: ConfigurableModerationResponses.map((entry) => entry.key),
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
