<template>
	<DashboardPageHeader
		:title="ts('guild_settings.channels.title')"
		:description="ts('guild_settings.channels.subtitle')"
	>
		<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
			{{
				ts("guild_settings.channels.routed_count", {
					routed: routedCount,
					total: ConfigurableLoggingChannels.length,
				})
			}}
		</UBadge>
	</DashboardPageHeader>

	<GuildSettingsForm
		:state="state"
		:schema="schema"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.channels.form_aria')"
		class="space-y-4"
		@error="onError"
	>
		<p class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.channels.logging_channels_help") }}
		</p>

		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			<section
				v-for="group in loggingGroups"
				:key="group.id"
				class="console-card"
				:aria-labelledby="`channels-${group.id}`"
			>
				<h3 :id="`channels-${group.id}`" class="mb-3 console-label">{{ group.title }}</h3>
				<div class="space-y-2">
					<SelectChannel
						v-for="config in group.entries"
						:key="config.key"
						v-model="state[config.key]"
						layout="row"
						:empty-label="ts('guild_settings.channels.not_logged')"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
				</div>
				<div v-if="group.toggles.length > 0" class="mt-3">
					<GuildSettingsToggleRow
						v-for="config in group.toggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</section>
		</div>

		<section class="console-card" aria-labelledby="channels-excluded">
			<h3 id="channels-excluded" class="console-label">
				{{ ts("guild_settings.channels.excluded_channels") }}
			</h3>
			<p class="mt-1 mb-3 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.channels.excluded_channels_help") }}
			</p>
			<div class="space-y-2">
				<SelectChannels
					v-for="config in ConfigurableIgnoreChannels"
					:key="config.key"
					v-model="state[config.key]"
					layout="row"
					:guild="guildData"
					:label="translateEntry(config, 'name')"
					:tooltip-title="translateEntry(config, 'description')"
				/>
			</div>
		</section>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
// Explicit import: unimport misses identifiers referenced only inside nested
// functions and the template, leaving them unbound in the compiled module.
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
	ConfigurableLogToggles,
} from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableLoggingChannels.map((entry) => entry.key),
	many: ConfigurableIgnoreChannels.map((entry) => entry.key),
	toggles: ConfigurableLogToggles.map((entry) => entry.key),
});

// One card per kind of event, in the order the events are written to the log.
const LOGGING_GROUPS = [
	{ id: "members", pattern: /^logs(Member|Prune)/ },
	{ id: "messages", pattern: /^logs(Message|Image)/ },
	{ id: "reactions", pattern: /^logsReaction/ },
	{ id: "roles", pattern: /^logsRole/ },
	{ id: "channels", pattern: /^logsChannel/ },
	{ id: "emojis", pattern: /^logsEmoji/ },
	{ id: "server", pattern: /^logs(Server|Command|Settings)/ },
] as const;

const loggingGroups = computed(() =>
	LOGGING_GROUPS.map((group) => ({
		entries: ConfigurableLoggingChannels.filter((entry) => group.pattern.test(entry.key)),
		id: group.id,
		title: ts(`guild_settings.channels.groups.${group.id}`),
		toggles: ConfigurableLogToggles.filter((entry) => group.pattern.test(entry.key)),
	})).filter((group) => group.entries.length > 0),
);

const routedCount = computed(
	() => ConfigurableLoggingChannels.filter((entry) => state[entry.key]).length,
);
</script>
