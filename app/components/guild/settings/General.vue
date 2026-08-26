<template>
	<GuildSettingsSection
		headingLevel="h1"
		:title="t('guild_settings.general.server_info')"
		:description="t('guild_settings.general.server_info_description')"
		:ui="{ heading: 'text-xl font-bold tracking-wide' }"
	>
		<dl
			class="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 md:gap-x-8 md:gap-y-4"
			:aria-label="t('guild_settings.general.server_stats_aria')"
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
				{{ copied ? t("common.copied") : t("guild_settings.general.copy_server_id") }}
			</UButton>
			<UButton
				color="neutral"
				variant="link"
				icon="heroicons:question-mark-circle"
				to="https://discord.gg/gqAnRyUXG8"
				target="_blank"
				rel="noopener noreferrer"
			>
				{{ t("guild_settings.general.need_help") }}
			</UButton>
		</div>
	</GuildSettingsSection>

	<GuildSettingsSection
		:title="t('guild_settings.general.title')"
		class="rounded-md border border-base-200 bg-base-200/30 p-3 sm:border-2 sm:p-4 md:p-6"
		:ui="{ heading: 'text-xl font-bold tracking-wide' }"
	>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			class="grid grid-cols-1 gap-6 md:grid-cols-2"
			:aria-label="t('guild_settings.general.form_aria')"
			@error="onError"
		>
			<div>
				<UFormField :label="t('guild_settings.general.prefix')" name="prefix">
					<UInput
						id="prefix"
						v-model="state.prefix"
						:placeholder="t('guild_settings.general.prefix_placeholder')"
						color="primary"
						class="w-full"
						aria-describedby="prefix-description character-count"
						:aria-label="t('guild_settings.general.prefix_aria')"
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
							{{ t("guild_settings.general.prefix_description") }}
						</p>
					</template>
				</UFormField>
			</div>

			<div>
				<UFormField :label="t('guild_settings.general.language')" name="language">
					<template #description>
						<p id="language-description" class="text-sm text-base-content/70">
							{{ t("guild_settings.general.language_description") }}
						</p>
					</template>
					<USelectMenu
						id="language"
						v-model="state.language"
						color="primary"
						:placeholder="t('guild_settings.general.language_placeholder')"
						class="w-full"
						:items="items"
						value-attribute="value"
						:aria-label="t('guild_settings.general.language_aria')"
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
		:title="t('guild_settings.general.recent_activity')"
		:total="auditLogTotal"
		:status="auditLogStatus"
		:item-count="auditEntries.length"
		:max-visible="0"
		empty-icon="heroicons:clipboard-document-list"
		:empty-title="t('guild_settings.general.no_activity')"
		:empty-description="t('guild_settings.general.no_activity_description')"
		:refresh-label="t('guild_logs.refresh_audit')"
		class="rounded-md border border-base-200 bg-base-200/30 p-3 sm:border-2 sm:p-4 md:p-6"
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
				thead: '[&>tr]:bg-base-200/50 [&>tr]:after:content-none',
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

const { ts: t } = useI18n();
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

const auditLogColumns = computed<TableColumn<(typeof auditEntries.value)[number]>[]>(() => [
	{
		accessorKey: "timestamp",
		header: t("guild_logs.columns.date"),
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
		header: t("guild_logs.columns.user"),
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
		header: t("guild_logs.columns.action"),
		cell: ({ row }) => auditLogActionDescription(row.original),
	},
]);

const serverStats = computed(() => {
	const guild = guildData.value;
	const channels = guild?.channels ?? [];
	return [
		{
			label: t("guild_settings.general.stat_members"),
			value: guild?.approximateMemberCount ?? 0,
		},
		{
			label: t("guild_settings.general.stat_categories"),
			value: channels.filter((c) => c.type === ChannelType.GuildCategory).length,
		},
		{
			label: t("guild_settings.general.stat_text_channels"),
			value: channels.filter(
				(c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement,
			).length,
		},
		{
			label: t("guild_settings.general.stat_voice_channels"),
			value: channels.filter(
				(c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice,
			).length,
		},
		{ label: t("guild_settings.general.stat_roles"), value: guild?.roles.length ?? 0 },
	];
});

function copyServerId() {
	const id = guildData.value?.id;
	if (id) {
		copy(id, {
			title: t("guild_settings.general.server_id_copied_title"),
			description: t("guild_settings.general.server_id_copied_description"),
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
			value: langKey,
			label: englishName ?? nativeName,
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
		description: t("guild_settings.general.save_failed_message", {
			message: errorMessage ?? t("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: t("guild_settings.save_failed"),
	});
}
</script>
