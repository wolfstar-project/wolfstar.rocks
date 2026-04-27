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
				<dt class="truncate text-sm font-semibold text-base-content/70 md:text-base">
					{{ stat.label }}:
				</dt>
				<dd class="shrink-0 text-base font-bold text-base-content md:text-lg">
					{{ stat.value.toLocaleString() }}
				</dd>
			</div>
		</dl>

		<div class="mt-4 flex flex-col items-start gap-3 md:flex-row">
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
		</div>
	</GuildSettingsSection>

	<GuildSettingsSection
		title="General Settings"
		class="rounded-md border border-base-200 bg-base-200/30 p-3 sm:border-2 sm:p-4 md:p-6"
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
		class="rounded-md border border-base-200 bg-base-200/30 p-3 sm:border-2 sm:p-4 md:p-6"
		@refresh="refreshAuditLog()"
	>
		<div class="flex items-center justify-between gap-1.5">
			<UInput
				v-model="globalFilter"
				class="max-w-sm"
				icon="i-lucide-search"
				placeholder="Filter..."
			/>
		</div>

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
				thead: '[&>tr]:bg-base-200/50 [&>tr]:after:content-none',
				tbody: '[&>tr]:last:[&>td]:border-b-0',
				th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
				td: 'border-b border-default',
				separator: 'h-0',
			}"
		/>
		<div
			v-if="auditLogTotal > auditLogPageSize"
			class="mt-4 flex items-center justify-between border-t border-default pt-4"
		>
			<p class="text-sm text-muted">
				Showing
				{{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
				{{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} entries
			</p>
			<UPagination
				:default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
				:items-per-page="table?.tableApi?.getState().pagination.pageSize"
				:total="table?.tableApi?.getFilteredRowModel().rows.length"
				@update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
			/>
		</div>
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
import { formatTimeAgo } from "@vueuse/core";
import { ChannelType } from "discord-api-types/v10";

const { languages } = defineProps<{
	languages: string[];
}>();

const { guildSettings } = useGuildSettings();
const { guildData } = useGuildData();

const toast = useToast();
const table = useTemplateRef("table");

const { copy, copied } = useClipboard();

const UAvatar = resolveComponent("UAvatar");

const auditLogPage = ref(1);
const globalFilter = ref("");
const auditLogPageSize = 10;
const auditLogOffset = computed(() => (auditLogPage.value - 1) * auditLogPageSize);

const {
	entries: auditEntries,
	total: auditLogTotal,
	refresh: refreshAuditLog,
	status: auditLogStatus,
} = useAuditLog({
	guildId: guildData.value.id,
	limit: auditLogPageSize,
	offset: auditLogOffset,
});

const auditLogColumns: TableColumn<(typeof auditEntries.value)[number]>[] = [
	{
		accessorKey: "id",
		header: "Case",
	},
	{
		accessorKey: "member",
		header: "Member",
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
	{
		accessorKey: "timestamp",
		header: "When",
		cell: ({ row }) => {
			return h(
				"time",
				{
					class: "whitespace-nowrap text-xs text-base-content/50",
					datetime: new Date(row.original.timestamp).toISOString(),
				},
				formatTimeAgo(new Date(row.original.timestamp)),
			);
		},
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
