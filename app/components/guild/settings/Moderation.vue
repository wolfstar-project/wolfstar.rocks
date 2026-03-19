<template>
	<GuildSettingsSection
		title="Punishment Settings"
		description="Configure how WolfStar handles moderation actions like bans, kicks, and mutes."
	>
		<GuildSettingsForm
			:schema="ModerationSettingsSchema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			aria-label="Moderation settings form"
			class="space-y-4"
			@error="onError"
		>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<UFormField
					v-for="setting in ConfigurableModerationKeys"
					:key="`form-field-${setting.key}`"
					:label="setting.name"
					:name="setting.key"
				>
					<template #description>
						<p class="text-sm text-base-content/70">{{ setting.description }}</p>
					</template>
					<USwitch v-model="state[setting.key]" :aria-label="`Toggle ${setting.name}`" />
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData, GuildDataKey } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { ModerationSettingsSchema, type ModerationSettingsSchemaType } from "#shared/schemas";

const { guildSettings } = useGuildSettings();
const toast = useToast();

const createDefaultState = (): ModerationSettingsSchemaType => {
	const defaults: Partial<ModerationSettingsSchemaType> = {};
	for (const setting of ConfigurableModerationKeys) {
		defaults[setting.key] =
			(guildSettings.value?.[setting.key as GuildDataKey] as boolean | undefined) ?? false;
	}
	return defaults as ModerationSettingsSchemaType;
};

const state = reactive<ModerationSettingsSchemaType>(createDefaultState());

function mapToGuildData(stateData: ModerationSettingsSchemaType): Partial<GuildData> {
	const result: Partial<GuildData> = {};
	for (const setting of ConfigurableModerationKeys) {
		result[setting.key as GuildDataKey] = stateData[setting.key] as never;
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
		description: `Could not save moderation settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}

watch(
	guildSettings,
	(newSettings) => {
		if (newSettings) {
			for (const setting of ConfigurableModerationKeys) {
				state[setting.key] =
					(newSettings[setting.key as GuildDataKey] as boolean | undefined) ?? false;
			}
		}
	},
	{ deep: true },
);
</script>
