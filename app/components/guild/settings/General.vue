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
		class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7"
		:aria-label="ts('guild_settings.general.server_stats_aria')"
	>
		<div
			v-for="stat in serverStats"
			:key="stat.label"
			class="stat-card"
			:class="{ 'stat-card--placeholder': stat.placeholder }"
		>
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
			<UFormField :label="ts('guild_settings.general.language')" name="language">
				<template #description>
					<p id="language-description" class="text-[0.8125rem] text-muted">
						{{ ts("guild_settings.general.language_description") }}
					</p>
				</template>
				<SelectBase
					id="language"
					v-model="languageValue"
					:options="items"
					:clearable="false"
					:placeholder="ts('guild_settings.general.language_placeholder')"
					class="w-full"
					:aria-label="ts('guild_settings.general.language_aria')"
					aria-describedby="language-description"
				/>
				<template #error="{ error }">
					<p class="text-sm text-error">{{ error }}</p>
				</template>
			</UFormField>
			<UFormField :label="ts('dashboard.coming_soon.time_zone')">
				<template #description>
					<p class="text-[0.8125rem] text-muted">
						{{ ts("dashboard.coming_soon.time_zone_description") }}
					</p>
				</template>
				<UInput
					disabled
					class="w-full"
					icon="ic:round-access-time"
					:model-value="ts('dashboard.coming_soon.badge')"
					:aria-label="ts('dashboard.coming_soon.time_zone')"
				/>
			</UFormField>
		</GuildSettingsForm>
	</section>

	<ActivitySection
		:title="ts('guild_settings.general.recent_activity')"
		:total="auditLogTotal"
		:status="auditLogStatus"
		:item-count="auditEntries.length"
		:empty-title="
			hasNoActivityEver
				? ts('guild_settings.general.no_activity_yet')
				: ts('guild_settings.general.no_activity')
		"
		:empty-description="
			hasNoActivityEver
				? ts('guild_settings.general.no_activity_yet_description')
				: ts('guild_settings.general.no_activity_description', { count: CHART_DAYS })
		"
		:empty-note="lastChangeNote"
		:refresh-label="ts('guild_logs.refresh_audit')"
		@refresh="refreshAuditLog()"
	>
		<div class="activity-table">
			<table :aria-label="ts('guild_settings.general.recent_activity')">
				<thead>
					<tr>
						<th scope="col">{{ ts("guild_logs.columns.date") }}</th>
						<th scope="col">{{ ts("guild_logs.columns.user") }}</th>
						<th scope="col">{{ ts("guild_logs.columns.action") }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="entry in auditEntries" :key="entry.id">
						<td>
							<time
								class="font-mono text-xs whitespace-nowrap text-toned"
								:datetime="new Date(entry.timestamp).toISOString()"
								:title="new Date(entry.timestamp).toLocaleString(locale)"
							>
								{{ formatActivityTime(entry.timestamp, now, locale) }}
							</time>
						</td>
						<td>
							<div class="flex min-w-0 items-center gap-2.5">
								<UAvatar
									v-bind="auditLogMemberAvatar(entry.member)"
									size="md"
									class="shrink-0"
								/>
								<div class="min-w-0">
									<p class="truncate text-sm font-semibold">
										{{ auditLogMemberName(entry.member) }}
									</p>
									<p class="truncate text-xs text-muted">
										@{{ entry.member.user?.username }}
									</p>
								</div>
							</div>
						</td>
						<td>
							<div class="flex min-w-0 items-center gap-2.5">
								<span
									class="min-w-0 flex-auto text-[0.8125rem] leading-[1.45] text-toned"
								>
									<span
										v-for="(part, index) in auditLogActionParts(
											entry,
											auditResolver,
										)"
										:key="index"
										:class="{ 'activity-table-strong': part.strong }"
										>{{ part.text }}</span
									>
								</span>
								<GuildAuditChanges :entry :resolver="auditResolver" />
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</ActivitySection>
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

const { tc, ts } = useI18n();
const { guildSettings } = useGuildSettings();
const { guildData } = useGuildData();

const toast = useToast();

const { copy, copied } = useClipboard();

// The log is asked for the last seven days only; its own total is exact even
// when the page of entries below is not.
const CHART_DAYS = 7;
const CHART_ENTRY_LIMIT = 100;
const now = ref(new Date());
const activityFrom = computed(() => moderationActivityStart(now.value, CHART_DAYS).toISOString());

// Recent activity is the same seven days. When they were quiet, the newest
// entry of all says when the settings last changed, and who changed them.
const {
	entries: auditEntries,
	total: auditLogTotal,
	refresh: refreshAuditLog,
	status: auditLogStatus,
} = useAuditLog({
	guildId: () => guildData.value?.id,
	limit: 10,
	filters: computed(() => ({ from: activityFrom.value })),
});
// Channel and role ids in a change read as their names when the guild has them.
const auditResolver = computed(() => ({
	channels: new Map((guildData.value?.channels ?? []).map((item) => [item.id, item])),
	roles: new Map((guildData.value?.roles ?? []).map((item) => [item.id, item])),
}));
const { entries: latestAuditEntries, status: latestAuditStatus } = useAuditLog({
	guildId: () => guildData.value?.id,
	limit: 1,
});

const { entries: moderationEntries, total: moderationTotal } = useModerationLog({
	guildId: () => guildData.value?.id,
	limit: CHART_ENTRY_LIMIT,
	filters: computed(() => ({ from: activityFrom.value })),
});
const { total: commandTotal } = useCommandLog({
	guildId: () => guildData.value?.id,
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

// A server nobody has changed yet reads differently from a quiet week.
const hasNoActivityEver = computed(
	() => latestAuditStatus.value === "success" && latestAuditEntries.value.length === 0,
);

const lastChangeNote = computed(() => {
	const latest = latestAuditEntries.value[0];
	if (!latest) return undefined;
	return ts("guild_settings.general.last_change", {
		name: auditLogMemberName(latest.member),
		when: formatDaysAgo(latest.timestamp, now.value, locale.value),
	});
});

const chartAria = computed(() =>
	ts("guild_settings.general.mod_actions_aria", {
		days: activityDays.value.map((day) => `${day.label} ${day.count}`).join(", "),
	}),
);

const chartHeadingId = useId();
const settingsHeadingId = useId();

const STAT_PLACEHOLDER = "—";

const channelCounts = computed(() => {
	const channels = guildData.value?.channels ?? [];
	return {
		categories: channels.filter((c) => c.type === ChannelType.GuildCategory).length,
		total: channels.filter((c) => c.type !== ChannelType.GuildCategory).length,
	};
});

const serverStats = computed(() => {
	const guild = guildData.value;
	const online = guild?.approximatePresenceCount ?? 0;
	return [
		{
			label: ts("guild_settings.general.stat_members"),
			note: online > 0 ? ts("guild_settings.general.stat_online", { count: online }) : "",
			// The success green is too light to read on a white card.
			noteClass: "text-toned theme-dark:text-success",
			value: (guild?.approximateMemberCount ?? 0).toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_cases"),
			note: ts("guild_settings.general.stat_last_days", { count: CHART_DAYS }),
			value: moderationTotal.value.toLocaleString(),
		},
		// Not counted anywhere the dashboard can read yet.
		{
			label: ts("dashboard.coming_soon.stat_automod_hits"),
			note: ts("dashboard.coming_soon.badge"),
			placeholder: true,
			value: STAT_PLACEHOLDER,
		},
		{
			label: ts("dashboard.coming_soon.stat_open_reports"),
			note: ts("dashboard.coming_soon.badge"),
			placeholder: true,
			value: STAT_PLACEHOLDER,
		},
		{
			label: ts("guild_settings.general.stat_commands"),
			note: ts("guild_settings.general.stat_last_days", { count: CHART_DAYS }),
			value: commandTotal.value.toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_channels"),
			note: tc("guild_settings.general.stat_categories_note", channelCounts.value.categories),
			value: channelCounts.value.total.toLocaleString(),
		},
		{
			label: ts("guild_settings.general.stat_roles"),
			note: "",
			value: (guild?.roles.length ?? 0).toLocaleString(),
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
			label: englishName ?? nativeName,
			// The name speakers use, then the tag the bot stores.
			note: `${nativeName} \u00B7 ${langKey}`,
			value: langKey,
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
});

// The form keeps the chosen option; the select works with its tag.
const languageValue = computed<string | string[] | null>({
	get: () => state.language?.value ?? null,
	set: (value) => {
		const option = items.value.find((item) => item.value === value);
		if (option) state.language = { label: option.label, value: option.value };
	},
});

function mapToGuildData(formState: Schema): Partial<GuildData> {
	const changes: Partial<GuildData> = {};

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

.stat-card--placeholder {
	border-style: dashed;
	color: var(--ui-text-muted);
}

.stat-card {
	@apply min-w-0 rounded-[8px] px-3.5 py-3;
	background-color: var(--console-surface);
	border: 1px solid var(--home-border-subtle);
}

/* Radii are spelled in pixels: this app's `rounded-lg` is 16px, twice the
   design's 8px.
   Date, user, action: a fixed first column and a 2:3 split of the rest. On
   narrow screens the table scrolls sideways instead of crushing the columns. */
.activity-table {
	@apply overflow-x-auto rounded-[8px];
	border: 1px solid var(--console-border);
}

.activity-table table {
	@apply w-full min-w-140 table-fixed border-collapse text-left;
}

.activity-table th {
	@apply px-3.5 py-2 text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase;
	background-color: var(--console-active);
}

.activity-table th:first-child {
	width: 9.375rem;
}

.activity-table th:nth-child(2) {
	width: calc((100% - 9.375rem) * 0.4);
}

.activity-table td {
	@apply px-3.5 py-2.5 align-middle;
	border-top: 1px solid var(--home-border-subtle);
}

.activity-table-strong {
	@apply font-semibold text-primary theme-light:text-default;
}
</style>
