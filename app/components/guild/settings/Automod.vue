<template>
	<GuildSettingsSection
		:title="ts('guild_settings.automod.title')"
		:description="ts('guild_settings.automod.subtitle')"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.automod.form_aria')"
			class="space-y-6"
			@error="onError"
		>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				<SelectChannel
					v-for="config in ConfigurableAutomodChannels"
					:key="config.key"
					v-model="state[config.key]"
					:guild="guildData"
					:label="translateEntry(config, 'name')"
					:tooltip-title="translateEntry(config, 'description')"
				/>
			</div>

			<div class="grid grid-cols-1 gap-x-7 md:grid-cols-2">
				<GuildSettingsToggleRow
					v-for="config in ConfigurableAutomodToggles"
					:key="config.key"
					v-model="state[config.key]"
					:name="config.key"
					:title="translateEntry(config, 'name')"
					:description="translateEntry(config, 'description')"
				/>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>

	<GuildAutomodRules />
</template>

<script setup lang="ts">
import {
	ConfigurableAutomodChannels,
	ConfigurableAutomodToggles,
} from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableAutomodChannels.map((entry) => entry.key),
	toggles: ConfigurableAutomodToggles.map((entry) => entry.key),
});
</script>
