<template>
	<GuildSettingsSection
		headingLevel="h1"
		title="Server Info"
		description="Your server at a glance. Adjust settings below or explore sections in the sidebar."
		:ui="{ heading: 'text-xl font-bold tracking-wide' }"
	>
		<dl
			class="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 md:gap-x-8 md:gap-y-4"
			aria-label="Server statistics"
		>
			<div
				v-for="stat in serverStats"
				:key="stat.label"
				class="flex min-w-0 items-baseline justify-between md:justify-start md:gap-2"
			>
				<dt class="truncate text-sm font-semibold text-toned md:text-base">
					{{ stat.label }}:
				</dt>
				<dd class="shrink-0 text-base font-bold text-default md:text-lg">
					{{ stat.value.toLocaleString() }}
				</dd>
			</div>
		</dl>

		<UFieldGroup class="mt-4 flex-col items-start md:flex-row">
			<UButton
				color="neutral"
				variant="link"
				:icon="copied ? 'heroicons:check' : 'heroicons:clipboard-document'"
				@click="copyServerId"
			>
				{{ copied ? "Copied!" : "Copy Server ID" }}
			</UButton>
			<UButton
				color="neutral"
				variant="link"
				icon="heroicons:question-mark-circle"
				to="https://discord.gg/gqAnRyUXG8"
				target="_blank"
				rel="noopener noreferrer"
			>
				Need Help?
			</UButton>
		</UFieldGroup>
	</GuildSettingsSection>

	<GuildSettingsSection
		title="General Settings"
		class="rounded-md border border-muted bg-muted/30 p-3 sm:border-2 sm:p-4 md:p-6"
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
						placeholder="Select a command prefix"
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
						<p id="prefix-description" class="text-sm text-toned">
							The prefix used to trigger WolfStar commands in this server.
						</p>
					</template>
				</UFormField>
			</div>

			<div>
				<UFormField label="Language" name="language">
					<template #description>
						<p id="language-description" class="text-sm text-toned">
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

	<ActivitySection
		title="Recent Activity"
		:total="auditLogTotal"
		:status="auditLogStatus"
		:item-count="auditEntries.length"
		:max-visible="0"
		empty-icon="heroicons:clipboard-document-list"
		empty-title="No settings changes yet"
		empty-description="Changes you make to this server's settings will appear here so you can track who changed what."
		refresh-label="Refresh audit log"
		class="rounded-md border border-muted bg-muted/30 p-3 sm:border-2 sm:p-4 md:p-6"
		@refresh="refreshAuditLog()"
	>
		<UTable
			ref="table"
			:data="auditEntries"
			:columns="auditLogColumns"
			:loading="auditLogStatus === 'pending'"
			:pagination-options="{
				getPaginationRowModel: getPaginationRowModel(),
			}"
			class="shrink-0"
			:ui="{
				base: 'table-fixed border-separate border-spacing-0',
				thead: '[&>tr]:bg-muted/50 [&>tr]:after:content-none',
				tbody: '[&>tr]:last:[&>td]:border-b-0',
				th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
				td: 'border-b border-default',
				separator: 'h-0',
			}"
		/>
	</ActivitySection>
</template>

<script lang="ts" setup>
import type { GuildData } from "#server/database";
import type { FormErrorEvent } from "@nuxt/ui";
import type { TableColumn } from "@nuxt/ui";
import {
	GeneralSettingsSchema as schema,
	type GeneralSettingsSchemaType as Schema,
} from "#shared/schemas";
import { getPaginationRowModel } from "@tanstack/table-core";
import { ChannelType } from "discord-api-types/v10";

const { languages } = defineProps<{
	languages: string[];
}>();

const { guildSettings } = useGuildSettings();
const { guildData } = useGuildData();

const toast = useToast();

const { copy, copied } = useClipboard();

const UAvatar = resolveComponent("UAvatar");

const auditLogPage = ref(1);
const page = ref(10);
const offset = computed(() => (auditLogPage.value - 1) * page.value);

const {
	entries: auditEntries,
	total: auditLogTotal,
	refresh: refreshAuditLog,
	status: auditLogStatus,
} = useAuditLog({
	guildId: guildData.value.id,
	limit: page,
	offset,
});

const auditLogColumns: TableColumn<(typeof auditEntries.value)[number]>[] = [
	{
		accessorKey: "timestamp",
		header: "Date",
		cell: ({ row }) => {
			return h(
				"time",
				{
					class: "whitespace-nowrap text-xs text-highlighted",
					datetime: new Date(row.original.timestamp).toISOString(),
				},
				new Date(row.original.timestamp).toLocaleString(),
			);
		},
	},
	{
		accessorKey: "member",
		header: "User",
		cell: ({ row }) => {
			return h("div", { class: "flex items-center gap-3" }, [
				h(UAvatar, {
					...auditLogMemberAvatar(row.original.member),
					size: "lg",
				}),
				h("div", undefined, [
					h(
						"p",
						{ class: "font-medium text-highlighted" },
						auditLogMemberName(row.original.member),
					),
					h("p", { class: "" }, `@${row.original.member.user.username}`),
				]),
			]);
		},
	},
	{
		id: "description",
		header: "Action",
		cell: ({ row }) => auditLogActionDescription(row.original),
	},
];

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
