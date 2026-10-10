<template>
	<GuildSettingsSection
		:title="ts('guild_settings.moderation.title')"
		:description="ts('guild_settings.moderation.subtitle')"
	>
		<GuildSettingsForm
			:schema="ModerationSettingsSchema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			:aria-label="ts('guild_settings.moderation.form_aria')"
			class="space-y-4"
			@error="onError"
		>
			<div class="grid grid-cols-1 gap-x-7 md:grid-cols-2">
				<UFormField
					v-for="setting in ConfigurableModerationKeys"
					:key="`form-field-${setting.key}`"
					:name="setting.key"
					class="border-t border-base-300/60"
				>
					<div class="flex items-center justify-between gap-4 py-3">
						<div class="min-w-0">
							<p class="text-sm font-semibold text-base-content">
								{{ translateEntry(setting, "name") }}
							</p>
							<p class="mt-0.5 text-xs leading-relaxed text-base-content/70">
								{{ translateEntry(setting, "description") }}
							</p>
						</div>
						<USwitch
							v-model="state[setting.key]"
							class="shrink-0"
							:aria-label="
								ts('guild_settings.events.toggle_aria', {
									title: translateEntry(setting, 'name'),
								})
							"
						/>
					</div>
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { ModerationSettingsSchema, type ModerationSettingsSchemaType } from "#shared/schemas";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";
import { ConfigurableModerationKeys } from "#shared/utils/settingsDataEntries";

const { ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();

const { guildSettings } = useGuildSettings();
const toast = useToast();

const createDefaultState = (): ModerationSettingsSchemaType => {
	const defaults: Partial<ModerationSettingsSchemaType> = {};
	for (const setting of ConfigurableModerationKeys) {
		defaults[setting.key] = guildSettings.value?.[setting.key] ?? false;
	}
	return defaults as ModerationSettingsSchemaType;
};

const state = reactive<ModerationSettingsSchemaType>(createDefaultState());

function mapToGuildData(stateData: ModerationSettingsSchemaType): Partial<GuildData> {
	const result: Partial<GuildData> = {};
	for (const setting of ConfigurableModerationKeys) {
		setGuildDataChange(result, setting.key, stateData[setting.key]);
	}
	return result;
}

async function onError(event: FormErrorEvent) {
	const element =
		event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
	element?.scrollIntoView({ behavior: "smooth", block: "center" });
	const errorMessage = event.errors[0]?.message;
	toast.add({
		color: "error",
		description: errorMessage ?? ts("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}

watch(
	guildSettings,
	(newSettings) => {
		if (newSettings) {
			for (const setting of ConfigurableModerationKeys) {
				state[setting.key] = newSettings[setting.key] ?? false;
			}
		}
	},
	{ deep: true },
);
</script>
