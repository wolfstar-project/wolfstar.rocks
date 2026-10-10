<template>
	<GuildSettingsSection
		:title="ts('guild_settings.channels.title')"
		:description="ts('guild_settings.channels.subtitle')"
	>
		<GuildSettingsForm
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.channels.form_aria')"
			class="space-y-8"
			@error="onError"
		>
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon
						name="i-heroicons-document-text"
						class="size-5 text-primary"
						aria-hidden="true"
					/>
					<h3 class="text-lg font-semibold text-base-content">
						{{ ts("guild_settings.channels.logging_channels") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ ts("guild_settings.channels.logging_channels_help") }}
				</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<SelectChannel
						v-for="config in ConfigurableLoggingChannels"
						:key="config.key"
						v-model="state[config.key]"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
				</div>

				<div>
					<GuildSettingsToggleRow
						v-for="config in ConfigurableLogToggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<UIcon
						name="heroicons:eye-slash"
						class="size-5 text-warning"
						aria-hidden="true"
					/>
					<h3 class="text-lg font-semibold text-base-content">
						{{ ts("guild_settings.channels.excluded_channels") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ ts("guild_settings.channels.excluded_channels_help") }}
				</p>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					<SelectChannels
						v-for="config in ConfigurableIgnoreChannels"
						:key="config.key"
						v-model="state[config.key]"
						:guild="guildData"
						:label="translateEntry(config, 'name')"
						:tooltip-title="translateEntry(config, 'description')"
					/>
				</div>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
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
</script>
