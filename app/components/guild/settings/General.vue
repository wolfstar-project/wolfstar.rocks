<template>
	<GuildSettingsSection
		headingLevel="h1"
		title="Server Info"
		class="overflow-hidden rounded-md border-2 border-base-200 bg-base-200/30 p-6"
		:ui="{ heading: 'text-xl font-bold tracking-wide' }"
	>
		<dl class="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3" aria-label="Server statistics">
			<div
				v-for="stat in serverStats"
				:key="stat.label"
				class="flex items-baseline justify-between md:justify-start md:gap-2"
			>
				<dt class="font-semibold text-base-content/70">{{ stat.label }}:</dt>
				<dd class="text-lg font-bold text-base-content">
					{{ stat.value.toLocaleString() }}
				</dd>
			</div>
		</dl>

		<div class="mt-6 flex flex-col items-center gap-3 md:flex-row md:items-start">
			<UButton
				color="error"
				variant="link"
				:icon="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
				@click="copyServerId"
			>
				{{ copied ? "Copied!" : "Copy Server ID" }}
			</UButton>
			<UButton
				color="error"
				variant="link"
				icon="heroicons:question-mark-circle"
				to="https://discord.gg/gqAnRyUXG8"
				target="_blank"
				rel="noopener noreferrer"
			>
				Need Help?
			</UButton>
		</div>
	</GuildSettingsSection>
	<GuildSettingsSection
		title="General Settings"
		class="overflow-hidden rounded-md border-2 border-base-200 bg-base-200/30 p-6"
		:ui="{ heading: 'text-xl font-bold tracking-wide' }"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			class="grid grid-cols-1 gap-6 md:grid-cols-2"
			aria-label="General guild settings form"
			@error="onError"
		>
			<div>
				<UFormField label="Prefix" name="prefix">
					<UInput
						id="prefix"
						v-model="state.prefix"
						placeholder="!"
						color="primary"
						class="w-full"
						aria-describedby="prefix-description character-count"
						aria-label="Bot command prefix"
					>
						<template #trailing>
							<div
								id="character-count"
								class="text-xs text-muted tabular-nums"
								aria-live="polite"
								role="status"
							>
								{{ state.prefix?.length }}/10
							</div>
						</template>
					</UInput>
					<template #error="{ error }">
						<p class="text-sm text-error">{{ error }}</p>
					</template>
					<template #description>
						<p id="prefix-description" class="text-sm text-base-content/70">
							The prefix used to trigger WolfStar commands in this server.
						</p>
					</template>
				</UFormField>
			</div>

			<div>
				<UFormField label="Language" name="language">
					<template #description>
						<p id="language-description" class="text-sm text-base-content/70">
							The language WolfStar uses for responses in this server.
						</p>
					</template>
					<USelectMenu
						id="language"
						v-model="state.language"
						color="primary"
						placeholder="Select language..."
						class="w-full"
						:items="items"
						value-attribute="value"
						aria-label="Select bot language"
						aria-describedby="language-description"
					/>
					<template #error="{ error }">
						<p class="text-sm text-error">{{ error }}</p>
					</template>
				</UFormField>
			</div>
		</GuildSettingsForm>
	</GuildSettingsSection>
</template>

<script lang="ts" setup>
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import {
	GeneralSettingsSchema as schema,
	type GeneralSettingsSchemaType as Schema,
} from "#shared/schemas";
import { ChannelType } from "discord-api-types/v10";

const { languages } = defineProps<{
	languages: string[];
}>();

const { guildSettings } = useGuildSettings();
const { guildData } = useGuildData();
const toast = useToast();
const { copy, copied } = useClipboard();

const serverStats = computed(() => {
	const guild = guildData.value;
	const channels = guild?.channels ?? [];
	return [
		{ label: "Members", value: guild?.approximateMemberCount ?? 0 },
		{
			label: "Categories",
			value: channels.filter((c) => c.type === ChannelType.GuildCategory).length,
		},
		{
			label: "Text Channels",
			value: channels.filter(
				(c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement,
			).length,
		},
		{
			label: "Voice Channels",
			value: channels.filter(
				(c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice,
			).length,
		},
		{ label: "Roles", value: guild?.roles.length ?? 0 },
	];
});

function copyServerId() {
	const id = guildData.value?.id;
	if (id) {
		copy(id, {
			title: "Server ID Copied",
			description: "The server ID has been copied to your clipboard.",
			icon: "heroicons:check",
			color: "success",
		});
	}
}

function mapLanguageKeysToNames(langKey: string): [string] | [string, string] {
	const supportedLanguagesMap: Record<string, [string] | [string, string]> = {
		"ckb-IR": ["Kurdîya Navîn (Iran)", "Kurdish"],
		"de-DE": ["Deutsch", "German"],
		"en-GB": ["British English", "English, United Kingdom"],
		"en-US": ["American English", "English, United States"],
		"es-ES": ["Español", "Spanish"],
		"fa-IR": ["فارسی", "Persian"],
		"fr-FR": ["Français", "French"],
		"hi-IN": ["हिंदी", "Hindi"],
		"hi-Latn-IN": ["Hinglish", "Hindi (Latin Alphabet)"],
		"it-IT": ["Italiano", "Italian"],
		"ja-JP": ["日本語", "Japanese"],
		"nb-NO": ["Bokmål", "Norwegian Bokmål"],
		"nl-NL": ["Nederlands", "Dutch"],
		"pt-BR": ["Português Brasileiro", "Portuguese, Brazilian"],
		"ro-RO": ["Română", "Romanian"],
		"ru-RU": ["Русский", "Russian"],
		"sl-SI": ["Slovenščina", "Slovenian"],
		"tr-TR": ["Türkçe", "Turkish"],
	};
	return supportedLanguagesMap[langKey] ?? [langKey];
}

const items = computed(() =>
	languages.map((langKey) => {
		const mapping = mapLanguageKeysToNames(langKey);
		const nativeName = mapping[0];
		const englishName = mapping[1];

		return {
			value: langKey, // Use the actual language key
			label: englishName ?? nativeName, // Use English name if available, otherwise native name
		};
	}),
);

const state = reactive<Schema>({
	language: (() => {
		const currentLangKey = guildSettings.value!.language;
		const mapping = mapLanguageKeysToNames(currentLangKey);
		return {
			label: mapping[1] ?? mapping[0],
			value: currentLangKey,
		};
	})(),
	prefix: guildSettings.value!.prefix,
});

function mapToGuildData(formState: Schema): Partial<GuildData> {
	const changes: Partial<GuildData> = {};

	if (formState.prefix) {
		changes.prefix = formState.prefix;
	}

	if (formState.language) {
		changes.language = formState.language.value;
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
		description: `Couldn't save general settings. ${errorMessage ?? "Please try again."}`,
		icon: "heroicons:x-circle",
		title: "Save Failed",
	});
}
</script>
