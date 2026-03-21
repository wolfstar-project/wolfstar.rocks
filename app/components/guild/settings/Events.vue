<template>
	<GuildSettingsSection
		title="Event Settings"
		description="Configure which events should be logged and tracked"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			aria-label="Events settings form"
			class="space-y-8"
			@error="onError"
		>
			<div class="flex items-center gap-2">
				<UIcon name="heroicons:shield-check" class="size-5 text-primary" />
				<h3 class="text-lg font-semibold text-base-content">Moderation Events</h3>
			</div>
			<p class="text-sm text-base-content/70">
				These events involve moderation actions and require that you setup the Moderation
				Logs channel on
				<NuxtLink :to="channelsPageLink" class="text-primary hover:underline">
					the Channels page
				</NuxtLink>
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<UFormField
					v-for="event in ConfigurableModerationEvents"
					:key="`form-field-${event.key}`"
					:label="event.title"
					:name="event.key"
				>
					<template #description>
						<p class="text-sm text-base-content/70">{{ event.description }}</p>
					</template>
					<USwitch v-model="state[event.key]" :aria-label="`Toggle ${event.title}`" />
				</UFormField>
			</div>

			<Separator />

			<div class="flex items-center gap-2">
				<UIcon name="heroicons:chat-bubble-left-right" class="size-5 text-primary" />
				<h3 class="text-lg font-semibold text-base-content">Message Events</h3>
			</div>
			<p class="text-sm text-base-content/70">
				These events involve message events, the channels to set up vary on the type of
				event and each channel can be configured on
				<NuxtLink :to="channelsPageLink" class="text-primary hover:underline">
					the Channels page
				</NuxtLink>
			</p>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<UFormField
					v-for="event in ConfigurableMessageEvents"
					:key="`form-field-${event.key}`"
					:label="event.title"
					:name="event.key"
				>
					<template #description>
						<p class="text-sm text-base-content/70">{{ event.description }}</p>
					</template>
					<USwitch v-model="state[event.key]" :aria-label="`Toggle ${event.title}`" />
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData, GuildDataKey } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import { EventsSettingsSchema, type EventsSettingsSchemaType } from "#shared/schemas";

const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const toast = useToast();


const allEvents = [...ConfigurableModerationEvents, ...ConfigurableMessageEvents];


const schema = EventsSettingsSchema;


const createDefaultState = (): EventsSettingsSchemaType => {
	const defaults: EventsSettingsSchemaType = {} as EventsSettingsSchemaType;
	for (const event of allEvents) {
		defaults[event.key] = guildSettings.value?.[event.key] ?? false;
	}
	return defaults;
};


const state = reactive<EventsSettingsSchemaType>(createDefaultState());


function mapToGuildData(stateData: EventsSettingsSchemaType): Partial<GuildData> {
	const result: Partial<GuildData> = {};
	for (const key in stateData) {
		result[key as GuildDataKey] = stateData[key] as never;
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
		description: `Could not save event settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}


const channelsPageLink = computed(() => `/guilds/${guildData.value.id}/manage/channels`);


watch(
	guildSettings,
	(newSettings) => {
		if (newSettings) {
			for (const event of allEvents) {
				state[event.key] = newSettings[event.key] ?? false;
			}
		}
	},
	{ deep: true },
);
</script>
