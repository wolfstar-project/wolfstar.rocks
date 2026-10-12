<template>
	<header class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
		<div class="min-w-0">
			<h2 class="text-xl font-bold tracking-[0.01em]">
				{{ ts("guild_settings.general.overview_title") }}
			</h2>
			<p class="mt-1 text-[0.8125rem] leading-normal text-muted">
				{{
					ts("guild_settings.general.overview_subtitle", { name: guildData?.name ?? "" })
				}}
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-1">
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				:icon="copied ? 'ic:round-check' : 'ic:round-content-copy'"
				@click="copyServerId"
			>
				{{ copied ? ts("common.copied") : ts("guild_settings.general.copy_server_id") }}
			</UButton>
			<UButton
				color="neutral"
				variant="ghost"
				size="sm"
				icon="ic:round-help-outline"
				to="https://discord.gg/gqAnRyUXG8"
				target="_blank"
				rel="noopener noreferrer"
			>
				{{ ts("guild_settings.general.need_help") }}
			</UButton>
		</div>
	</header>

	<dl
		class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5"
		:aria-label="ts('guild_settings.general.server_stats_aria')"
	>
		<div v-for="stat in serverStats" :key="stat.label" class="stat-card">
			<dt class="truncate text-xs font-semibold text-toned">{{ stat.label }}</dt>
			<dd class="mt-1 font-mono text-xl font-bold">{{ stat.value }}</dd>
			<dd class="mt-0.5 min-h-4 text-xs" :class="stat.noteClass ?? 'text-muted'">
				{{ stat.note }}
			</dd>
		</div>
	</dl>

	<div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<section class="console-card" :aria-labelledby="chartHeadingId">
			<div class="mb-4.5 flex items-baseline justify-between gap-3">
				<h3 :id="chartHeadingId" class="text-base font-semibold">
					{{ ts("guild_settings.general.mod_actions_title") }}
				</h3>
				<span class="font-mono text-xs text-muted">
					{{ ts("guild_settings.general.mod_actions_total", { count: moderationTotal }) }}
				</span>
			</div>
			<div
				role="img"
				:aria-label="chartAria"
				class="flex h-30 items-end gap-1.5 border-b border-base-content/15 pb-2 lg:h-45 lg:gap-3.5"
			>
				<div
					v-for="day in activityDays"
					:key="day.key"
					class="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
				>
					<span class="font-mono text-[0.6875rem] text-toned">{{ day.count }}</span>
					<div
						class="w-full max-w-11 rounded-t-[4px] transition-[height]"
						:class="
							day.count === peakCount && day.count > 0
								? 'bg-primary'
								: 'bg-primary/45'
						"
						:style="{ height: `${barHeight(day.count)}%` }"
					></div>
				</div>
			</div>
			<div class="flex gap-1.5 pt-2 lg:gap-3.5" aria-hidden="true">
				<span
					v-for="day in activityDays"
					:key="day.key"
					class="flex-1 text-center font-mono text-[0.6875rem] text-muted"
				>
					{{ day.label }}
				</span>
			</div>
			<p v-if="isChartPartial" class="mt-3 text-xs text-muted">
				{{ ts("guild_settings.general.mod_actions_partial", { count: CHART_ENTRY_LIMIT }) }}
			</p>
		</section>

		<GuildModulesSummary />
	</div>

	<section class="console-card" :aria-labelledby="settingsHeadingId">
		<div class="flex items-center gap-3">
			<h3 :id="settingsHeadingId" class="text-[1.0625rem] font-semibold whitespace-nowrap">
				{{ ts("guild_settings.general.title") }}
			</h3>
			<span class="h-px flex-1 bg-base-content/15" aria-hidden="true"></span>
		</div>
		<GuildSettingsForm
			:schema="schema"
			:state="state"
			:map-to-guild-data="mapToGuildData"
			class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2"
			:aria-label="ts('guild_settings.general.form_aria')"
			@error="onError"
		>
			<UFormField :label="ts('guild_settings.general.prefix')" name="prefix">
				<UInput
					id="prefix"
					v-model="state.prefix"
					:placeholder="ts('guild_settings.general.prefix_placeholder')"
					color="primary"
					class="w-full"
					aria-describedby="prefix-description character-count"
					:aria-label="ts('guild_settings.general.prefix_aria')"
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
					<p id="prefix-description" class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.general.prefix_description") }}
					</p>
				</template>
			</UFormField>
			<UFormField :label="ts('guild_settings.general.language')" name="language">
				<template #description>
					<p id="language-description" class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.general.language_description") }}
					</p>
				</template>
				<USelectMenu
					id="language"
					v-model="state.language"
					color="primary"
					:placeholder="ts('guild_settings.general.language_placeholder')"
					class="w-full"
					:items="items"
					value-attribute="value"
					:aria-label="ts('guild_settings.general.language_aria')"
					aria-describedby="language-description"
				/>
				<template #error="{ error }">
					<p class="text-sm text-error">{{ error }}</p>
				</template>
			</UFormField>
		</GuildSettingsForm>
	</section>

	<ActivitySection
		:title="ts('guild_settings.general.recent_activity')"
		:total="auditLogTotal"
		:status="auditLogStatus"
		:item-count="auditEntries.length"
		:max-visible="0"
		empty-icon="heroicons:clipboard-document-list"
		:empty-title="ts('guild_settings.general.no_activity')"
		:empty-description="ts('guild_settings.general.no_activity_description')"
		:refresh-label="ts('guild_logs.refresh_audit')"
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
				thead: '[&>tr]:bg-base-content/5 [&>tr]:after:content-none',
				tbody: '[&>tr]:last:[&>td]:border-b-0',
				th: 'py-2 text-[0.6875rem] font-bold tracking-[0.06em] uppercase first:rounded-l-lg last:rounded-r-lg',
				td: 'border-b border-(--home-border-subtle)',
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

const { tc, ts } = useI18n();
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
		header: ts("guild_logs.columns.date"),
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
		header: ts("guild_logs.columns.user"),
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
		header: ts("guild_logs.columns.action"),
		cell: ({ row }) => auditLogActionDescription(row.original),
	},
]);

const channelCounts = computed(() => {
	const channels = guildData.value?.channels ?? [];
	return {
		categories: channels.filter((c) => c.type === ChannelType.GuildCategory).length,
		total: channels.filter((c) => c.type !== ChannelType.GuildCategory).length,
	};
});

// The log is asked for the last seven days only; its own total is exact even
// when the page of entries below is not.
const CHART_DAYS = 7;
const CHART_ENTRY_LIMIT = 100;
const now = ref(new Date());
const activityFrom = computed(() => moderationActivityStart(now.value, CHART_DAYS).toISOString());

const { entries: moderationEntries, total: moderationTotal } = useModerationLog({
	guildId: guildData.value.id,
	limit: CHART_ENTRY_LIMIT,
	filters: computed(() => ({ from: activityFrom.value })),
});
const { total: commandTotal } = useCommandLog({
	guildId: guildData.value.id,
	limit: 1,
	filters: computed(() => ({ from: activityFrom.value })),
});

const { locale } = useAppLocale();
const activityDays = computed(() =>
	bucketModerationActivity(moderationEntries.value, {
		days: CHART_DAYS,
		locale: locale.value,
		now: now.value,
	}),
);
const peakCount = computed(() => Math.max(0, ...activityDays.value.map((day) => day.count)));
const isChartPartial = computed(() => moderationTotal.value > moderationEntries.value.length);

function barHeight(count: number) {
	return peakCount.value === 0 ? 0 : Math.max(4, Math.round((count / peakCount.value) * 100));
}

const chartAria = computed(() =>
	ts("guild_settings.general.mod_actions_aria", {
		days: activityDays.value.map((day) => `${day.label} ${day.count}`).join(", "),
	}),
);

const chartHeadingId = useId();
const settingsHeadingId = useId();

const serverStats = computed(() => {
	const guild = guildData.value;
	const roles = guild?.roles.length ?? 0;
	const online = guild?.approximatePresenceCount ?? 0;
	return [
		{
			label: ts("guild_settings.general.stat_members"),
			note: online > 0 ? ts("guild_settings.general.stat_online", { count: online }) : "",
			noteClass: "text-success",
			value: (guild?.approximateMemberCount ?? 0).toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_channels"),
			note: tc("guild_settings.general.stat_categories_note", channelCounts.value.categories),
			value: channelCounts.value.total.toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_roles"),
			note: "",
			value: roles.toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_cases"),
			note: ts("guild_settings.general.stat_last_days", { count: CHART_DAYS }),
			value: moderationTotal.value.toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_commands"),
			note: ts("guild_settings.general.stat_last_days", { count: CHART_DAYS }),
			value: commandTotal.value.toLocaleString(),
		},
	];
});

function copyServerId() {
	const id = guildData.value?.id;
	if (id) {
		copy(id, {
			title: ts("guild_settings.general.server_id_copied_title"),
			description: ts("guild_settings.general.server_id_copied_description"),
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
		description: ts("guild_settings.general.save_failed_message", {
			message: errorMessage ?? ts("guild_settings.please_try_again"),
		}),
		icon: "heroicons:x-circle",
		title: ts("guild_settings.save_failed"),
	});
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.stat-card {
	@apply min-w-0 rounded-lg px-3.5 py-3;
	background-color: var(--console-surface);
	border: 1px solid var(--home-border-subtle);
}
</style>
