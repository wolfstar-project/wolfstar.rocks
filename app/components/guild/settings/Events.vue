<template>
	<GuildSettingsSection
		:title="t('guild_settings.events.title')"
		:description="t('guild_settings.events.subtitle')"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			:aria-label="t('guild_settings.events.form_aria')"
			class="space-y-8"
			@error="onError"
		>
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:shield-check" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.events.moderation_events") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					<i18n-t keypath="guild_settings.events.moderation_events_help" tag="span">
						<template #channelsPage>
							<NuxtLink
								:to="channelsPageLink"
								class="text-primary underline hover:no-underline"
							>
								{{ t("guild_settings.events.channels_page_link") }}
							</NuxtLink>
						</template>
					</i18n-t>
				</p>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<UFormField
					v-for="event in ConfigurableModerationEvents"
					:key="`form-field-${event.key}`"
					:label="translateEntry(event, 'title')"
					:name="event.key"
				>
					<template #description>
						<p class="text-sm text-base-content/70">
							{{ translateEntry(event, "description") }}
						</p>
					</template>
					<USwitch
						v-model="state[event.key]"
						:aria-label="
							t('guild_settings.events.toggle_aria', {
								title: translateEntry(event, 'title'),
							})
						"
					/>
				</UFormField>
			</div>

			<Separator />

			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<UIcon name="heroicons:chat-bubble-left-right" class="size-5 text-primary" />
					<h3 class="text-lg font-semibold text-base-content">
						{{ t("guild_settings.events.message_events") }}
					</h3>
				</div>
				<p class="text-sm text-base-content/70">
					<i18n-t keypath="guild_settings.events.message_events_help" tag="span">
						<template #channelsPage>
							<NuxtLink
								:to="channelsPageLink"
								class="text-primary underline hover:no-underline"
							>
								{{ t("guild_settings.events.channels_page_link") }}
							</NuxtLink>
						</template>
					</i18n-t>
				</p>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<UFormField
					v-for="event in ConfigurableMessageEvents"
					:key="`form-field-${event.key}`"
					:label="translateEntry(event, 'title')"
					:name="event.key"
				>
					<template #description>
						<p class="text-sm text-base-content/70">
							{{ translateEntry(event, "description") }}
						</p>
					</template>
					<USwitch
						v-model="state[event.key]"
						:aria-label="
							t('guild_settings.events.toggle_aria', {
								title: translateEntry(event, 'title'),
							})
						"
					/>
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script setup lang="ts">
import type { GuildData } from "#shared/types";
import type { FormErrorEvent } from "@nuxt/ui";
import { EventsSettingsSchema, type EventsSettingsSchemaType } from "#shared/schemas";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";

const { t } = useI18n();
const { translateEntry } = useSettingsEntryI18n();

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
	for (const event of allEvents) {
		setGuildDataChange(result, event.key, stateData[event.key]);
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
		description: errorMessage ?? t("guild_settings.please_try_again"),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
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
