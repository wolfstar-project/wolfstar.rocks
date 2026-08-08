<template>
	<GuildSettingsSection
		:title="t('guild_settings.channels.title')"
		:description="t('guild_settings.channels.subtitle')"
	>
		<GuildSettingsForm
			:state="state"
			:schema="schema"
			:map-to-guild-data="mapToGuildData"
			:aria-label="t('guild_settings.channels.form_aria')"
			class="space-y-8"
			@error="onError"
		>
			<div class="space-y-4">
				<div class="gap-2 flex items-center">
					<Icon name="i-heroicons-document-text" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.channels.logging_channels") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ t("guild_settings.channels.logging_channels_help") }}
				</p>

				<div class="gap-4 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
					<div v-for="config in ConfigurableLoggingChannels" :key="config.key">
						<SelectChannel
							v-model="state[config.key] as string | null"
							:guild="guildData"
							:name="translateEntry(config, 'name')"
							:label="translateEntry(config, 'name')"
							:description="translateEntry(config, 'description')"
						/>
					</div>
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<div class="gap-2 flex items-center">
					<Icon name="heroicons:eye-slash" class="size-5 text-warning" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.channels.excluded_channels") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					{{ t("guild_settings.channels.excluded_channels_help") }}
				</p>

				<div class="gap-4 md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1">
					<div v-for="config in ConfigurableIgnoreChannels" :key="config.key">
						<SelectChannels
							v-model="state[config.key] as string[]"
							:guild="guildData"
							:label="translateEntry(config, 'name')"
						/>
					</div>
				</div>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "#shared/types/ui";
import { ChannelsSettingsSchema, type ChannelsSettingsSchemaType } from "#shared/schemas";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";
// Explicit import: unimport misses identifiers referenced only inside nested
// functions and the template, leaving them unbound in the compiled module.
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
} from "#shared/utils/settingsDataEntries";

const { t } = useI18n();
const { translateEntry } = useSettingsEntryI18n();

const { guildData } = useGuildData();
const { guildSettings: _guildSettings } = useGuildSettings();
const toast = useToast();

const schema = ChannelsSettingsSchema;

const createDefaultState = (): ChannelsSettingsSchemaType => {
	const defaults: ChannelsSettingsSchemaType = {} as ChannelsSettingsSchemaType;
	for (const config of ConfigurableLoggingChannels) {
		defaults[config.key] = null;
	}
	for (const config of ConfigurableIgnoreChannels) {
		defaults[config.key] = [];
	}
	return defaults;
};

const state = reactive<ChannelsSettingsSchemaType>(createDefaultState());

function mapToGuildData(formState: ChannelsSettingsSchemaType): Partial<GuildData> {
	const changes: Partial<GuildData> = {};

	for (const config of ConfigurableLoggingChannels) {
		const value = formState[config.key] as string | null | undefined;
		// Include null values for nullable fields (user explicitly cleared)
		// Only exclude undefined (form doesn't control this key)
		if (value !== undefined) {
			setGuildDataChange(changes, config.key, value);
		}
	}

	for (const config of ConfigurableIgnoreChannels) {
		const value = formState[config.key] as string[] | undefined;
		// Include empty arrays (user explicitly cleared all ignored channels)
		if (value !== undefined) {
			setGuildDataChange(changes, config.key, value);
		}
	}

	return changes;
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: errorMessage ?? t("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
	});
}
</script>
