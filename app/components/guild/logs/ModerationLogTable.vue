<template>
	<GuildLogsShell
		v-model:search="query"
		v-model:page="page"
		:status="status"
		:total="total"
		:shown="rows.length"
		:page-size="limit"
		:refresh-label="ts('guild_logs.refresh_moderation')"
		empty-icon="ic:round-gavel"
		:empty-title="
			warningsOnly ? ts('guild_logs.no_warnings') : ts('guild_logs.no_moderation_cases')
		"
		:empty-description="isFiltered ? ts('guild_logs.no_filter_match') : undefined"
		@refresh="refresh()"
	>
		<template v-if="!warningsOnly" #filter>
			<USelect
				v-model="selectedTypeCode"
				:items="actionTypeItems"
				:aria-label="ts('guild_logs.filter_action')"
				:ui="LOGS_FILTER_UI"
			/>
		</template>

		<UTable
			:data="rows"
			:columns="columns"
			:aria-label="tableLabel"
			:style="tableStyle"
			:ui="LOGS_TABLE_UI"
		/>

		<ul class="logs-table md:hidden" :aria-label="tableLabel">
			<li v-for="row in rows" :key="row.caseId" class="logs-card">
				<div class="logs-line">
					<span class="logs-case">#{{ row.caseId }}</span>
					<div class="logs-member">
						<UAvatar v-bind="row.targetAvatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm font-semibold">{{ row.target }}</span>
					</div>
					<span class="grow"></span>
					<GuildLogsPill :tone="row.tone">{{ row.action }}</GuildLogsPill>
				</div>
				<span class="block text-[0.8125rem] leading-[1.45] text-toned">{{
					row.reason
				}}</span>
				<div class="logs-line">
					<span class="truncate text-xs text-muted">
						{{ ts("guild_logs.by_moderator", { name: row.moderator }) }}
					</span>
					<span class="grow"></span>
					<span v-if="!warningsOnly" class="logs-mono">{{ row.duration }}</span>
					<time class="logs-mono" :datetime="row.datetime" :title="row.fullDate">
						{{ row.at }}
					</time>
				</div>
			</li>
		</ul>
	</GuildLogsShell>
</template>

<script setup lang="ts">
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { TableColumn } from "@nuxt/ui";
import type { LogsPillTone } from "./Pill.vue";
import { MODERATION_TYPE_FILTER_VALUES } from "#shared/types/moderation-types";

const { warningsOnly } = defineProps<{
	warningsOnly?: boolean;
}>();

const { guildData } = useGuildData();
const { ts } = useI18n();
const { timeLocale } = useAppLocale();

const page = ref(1);
const limit = ref(LOGS_PAGE_SIZE);
const offset = computed(() => (page.value - 1) * limit.value);

const filters = ref<{ q?: string; typeCode?: number }>({});
if (warningsOnly) {
	filters.value.typeCode = 1;
}

const selectedTypeCode = ref<number | null>(null);
const actionTypeItems = computed(() => [
	{ label: ts("guild_logs.all_actions"), value: null },
	...MODERATION_TYPE_FILTER_VALUES,
]);

watch(selectedTypeCode, (value) => {
	filters.value.typeCode = value ?? undefined;
	page.value = 1;
});

const query = ref("");
const debouncedQuery = refDebounced(query, 300);
watch(debouncedQuery, (value) => {
	filters.value.q = value || undefined;
	page.value = 1;
});

const isFiltered = computed(() => Boolean(debouncedQuery.value) || selectedTypeCode.value !== null);

const guildId = computed(() => guildData.value?.id);
const { entries, total, status, refresh } = useModerationLog({
	guildId,
	limit,
	offset,
	filters,
});

const tableLabel = computed(() =>
	warningsOnly ? ts("guild_logs.tab_warnings") : ts("guild_logs.tab_moderation"),
);

const tableStyle = computed(() => ({
	"--logs-min-width": warningsOnly ? "51.25rem" : "56.25rem",
}));

// Punishments that hold until someone lifts them when no duration was given.
const OPEN_ENDED_TYPES = new Set<string>([
	"Ban",
	"Mute",
	"VoiceMute",
	"RestrictedReaction",
	"RestrictedEmbed",
	"RestrictedAttachment",
	"RestrictedVoice",
	"RestrictedEmoji",
]);

function durationLabel(entry: ModerationLogEntry): string {
	// The table stores seconds, and `0` for a case that is not temporary.
	if (entry.duration > 0) return formatCompactDuration(entry.duration * 1000);
	return !entry.metadata.undo && OPEN_ENDED_TYPES.has(entry.typeName)
		? ts("guild_logs.permanent")
		: "\u2013";
}

const now = new Date();

const rows = computed(() =>
	entries.value.map((entry) => {
		const { metadata, typeName } = entry;
		const created = entry.createdAt ? new Date(entry.createdAt) : null;
		const target = entry.targetMember?.user?.username;
		return {
			// A case that reverses another one (an unban, an unmute) carries the
			// same type with the undo flag, so it is told apart here.
			action: metadata.undo ? ts("guild_logs.undo_action", { action: typeName }) : typeName,
			at: created ? formatActivityTime(created, now, timeLocale.value) : "\u2013",
			caseId: entry.caseId,
			datetime: entry.createdAt ?? undefined,
			duration: durationLabel(entry),
			fullDate: created?.toLocaleString(timeLocale.value),
			moderator: entry.moderatorMember
				? auditLogMemberName(entry.moderatorMember)
				: ts("guild_logs.unknown"),
			moderatorAvatar: auditLogMemberAvatar(entry.moderatorMember),
			reason: entry.reason ?? ts("guild_logs.no_reason"),
			target: target ? `@${target}` : ts("guild_logs.unknown"),
			targetAvatar: auditLogMemberAvatar(entry.targetMember),
			tone: (metadata.undo ? "success" : moderationActionVariant(typeName)) as LogsPillTone,
		};
	}),
);

type Row = (typeof rows.value)[number];

const UAvatar = resolveComponent("UAvatar");
const GuildLogsPill = resolveComponent("GuildLogsPill");

function memberCell(avatar: Row["targetAvatar"], name: string, strong: boolean) {
	return h("div", { class: "logs-member" }, [
		h(UAvatar, { ...avatar, class: "shrink-0", size: "xs" }),
		h(
			"span",
			{ class: ["truncate text-sm text-highlighted", strong ? "font-semibold" : ""] },
			name,
		),
	]);
}

function dateCell(row: Row) {
	return h("time", { class: "logs-mono", datetime: row.datetime, title: row.fullDate }, row.at);
}

const columns = computed<TableColumn<Row>[]>(() => [
	{
		accessorKey: "caseId",
		header: ts("guild_logs.columns.case"),
		meta: logsColumnWidth("w-16"),
		cell: ({ row }) => h("span", { class: "logs-case" }, `#${row.original.caseId}`),
	},
	{
		accessorKey: "target",
		header: ts("guild_logs.columns.user"),
		cell: ({ row }) => memberCell(row.original.targetAvatar, row.original.target, true),
	},
	{
		accessorKey: "moderator",
		header: ts("guild_logs.columns.moderator"),
		cell: ({ row }) => memberCell(row.original.moderatorAvatar, row.original.moderator, false),
	},
	{
		accessorKey: "action",
		header: ts("guild_logs.columns.action"),
		meta: logsColumnWidth("w-32"),
		cell: ({ row }) => h(GuildLogsPill, { tone: row.original.tone }, () => row.original.action),
	},
	{
		accessorKey: "reason",
		header: ts("guild_logs.columns.reason"),
		meta: logsColumnWidth("w-[28%]"),
		cell: ({ row }) =>
			h("span", { class: "block truncate", title: row.original.reason }, row.original.reason),
	},
	// A warning has no duration to show.
	...(warningsOnly
		? []
		: [
				{
					accessorKey: "duration",
					header: ts("guild_logs.columns.duration"),
					meta: logsColumnWidth("w-24"),
					cell: ({ row }) => h("span", { class: "logs-mono" }, row.original.duration),
				} satisfies TableColumn<Row>,
			]),
	{
		accessorKey: "at",
		header: ts("guild_logs.columns.date"),
		meta: logsColumnWidth("w-38"),
		cell: ({ row }) => dateCell(row.original),
	},
]);
</script>
