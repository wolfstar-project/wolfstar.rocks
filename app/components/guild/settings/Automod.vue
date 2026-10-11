<template>
	<DashboardPageHeader
		:title="ts('guild_settings.automod.title')"
		:description="ts('guild_settings.automod.subtitle')"
	/>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.automod.form_aria')"
		class="space-y-4"
		@error="onError"
	>
		<section class="console-card flex items-center gap-3.5 border-l-[3px] border-l-primary">
			<span
				class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
				aria-hidden="true"
			>
				<UIcon name="ic:round-shield" class="size-5.5" />
			</span>
			<div class="min-w-0 flex-1">
				<h3 class="text-base font-bold">{{ ts("dashboard.nav.automod") }}</h3>
				<p class="text-[0.8125rem] text-muted">
					{{ ts("guild_settings.automod.module_hint") }}
				</p>
			</div>
			<USwitch
				v-model="state.modulesAutomod"
				:aria-label="
					ts('guild_settings.modules.toggle_aria', { title: ts('dashboard.nav.automod') })
				"
			/>
		</section>

		<section class="console-card" aria-labelledby="automod-settings">
			<div class="flex items-center gap-3">
				<h3 id="automod-settings" class="text-[1.0625rem] font-semibold whitespace-nowrap">
					{{ ts("guild_settings.automod.module_settings") }}
				</h3>
				<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
			</div>
			<div class="mt-4 space-y-3">
				<SelectChannel
					v-for="config in ConfigurableAutomodChannels"
					:key="config.key"
					v-model="state[config.key]"
					layout="row"
					:guild="guildData"
					:label="translateEntry(config, 'name')"
					:tooltip-title="translateEntry(config, 'description')"
				/>
			</div>
			<div class="mt-3">
				<GuildSettingsToggleRow
					v-for="config in ConfigurableAutomodToggles"
					:key="config.key"
					v-model="state[config.key]"
					:name="config.key"
					:title="translateEntry(config, 'name')"
					:description="translateEntry(config, 'description')"
				/>
			</div>
		</section>
	</GuildSettingsForm>

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
	toggles: [...ConfigurableAutomodToggles.map((entry) => entry.key), "modulesAutomod"],
});
</script>
