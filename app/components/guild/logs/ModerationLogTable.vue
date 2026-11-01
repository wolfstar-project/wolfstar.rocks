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
		<template #filter>
			<USelect
				v-if="!warningsOnly"
				v-model="selectedTypeCode"
				:items="actionTypeItems"
				:aria-label="ts('guild_logs.filter_action')"
				:ui="LOGS_FILTER_UI"
			/>
			<USelect
				v-model="selectedStatus"
				:items="statusItems"
				:aria-label="ts('guild_logs.filter_case_status')"
				:ui="LOGS_FILTER_UI"
			/>
			<div ref="memberFiltersRoot" class="contents">
				<UButton
					v-for="chip in memberChips"
					:key="chip.key"
					color="neutral"
					variant="outline"
					size="sm"
					trailing-icon="ic:round-close"
					class="h-10 rounded-[6px]"
					:aria-label="ts('guild_logs.remove_filter', { filter: chip.label })"
					@click="clearMemberFilter(chip.key)"
				>
					{{ chip.label }}
				</UButton>
			</div>
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
					<button
						type="button"
						class="logs-case case-open"
						aria-haspopup="dialog"
						:aria-label="ts('guild_logs.open_case', { id: row.caseId })"
						@click="openCase(row.caseId, $event)"
					>
						#{{ row.caseId }}
					</button>
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
					<GuildLogsPill :tone="row.statusTone">{{ row.statusLabel }}</GuildLogsPill>
					<span v-if="!warningsOnly" class="logs-mono">{{ row.duration }}</span>
					<time class="logs-mono" :datetime="row.datetime" :title="row.fullDate">
						{{ row.at }}
					</time>
				</div>
			</li>
		</ul>
	</GuildLogsShell>

	<USlideover
		v-model:open="caseOpen"
		:title="selectedCase ? ts('guild_logs.case.title', { id: selectedCase.caseId }) : ''"
		:description="ts('guild_logs.case.description')"
		:content="{ onCloseAutoFocus: returnFocus }"
		:ui="{ content: 'max-w-md' }"
	>
		<template #body>
			<GuildLogsCaseDetail
				v-if="selectedCase"
				:entry="selectedCase"
				@filter-member="(id, name) => applyMemberFilter('userId', id, name)"
				@filter-moderator="(id, name) => applyMemberFilter('moderatorId', id, name)"
			/>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { ModerationCaseStatus } from "#shared/types/moderation-types";
import type { TableColumn } from "@nuxt/ui";
import {
	MODERATION_CASE_STATUSES,
	MODERATION_TYPE_FILTER_VALUES,
} from "#shared/types/moderation-types";

const { warningsOnly } = defineProps<{
	warningsOnly?: boolean;
}>();

const { guildData } = useGuildData();
const { ts } = useI18n();
const { timeLocale } = useAppLocale();

const page = ref(1);
const limit = ref(LOGS_PAGE_SIZE);
const offset = computed(() => (page.value - 1) * limit.value);

type MemberFilterKey = "userId" | "moderatorId";

const filters = ref<{
	q?: string;
	typeCode?: number;
	status?: ModerationCaseStatus;
	userId?: string;
	moderatorId?: string;
}>({});
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

const selectedStatus = ref<ModerationCaseStatus | null>(null);
const statusItems = computed(() => [
	{ label: ts("guild_logs.all_statuses"), value: null },
	...MODERATION_CASE_STATUSES.map((value) => ({
		label: ts(MODERATION_CASE_STATUS_KEY[value]),
		value,
	})),
]);

watch(selectedStatus, (value) => {
	filters.value.status = value ?? undefined;
	page.value = 1;
});

// The member filters are set from a case's detail, with the name it showed,
// and each one is a removable button in the toolbar.
const memberFilterNames = ref<Partial<Record<MemberFilterKey, string>>>({});
const memberChips = computed(() =>
	(["userId", "moderatorId"] as const).flatMap((key) => {
		const name = memberFilterNames.value[key];
		if (!filters.value[key] || name === undefined) return [];
		const label =
			key === "userId"
				? ts("guild_logs.filter_member", { name })
				: ts("guild_logs.filter_moderator", { name });
		return [{ key, label }];
	}),
);

const memberFiltersRoot = useTemplateRef<HTMLElement>("memberFiltersRoot");

function clearMemberFilter(key: MemberFilterKey) {
	filters.value[key] = undefined;
	memberFilterNames.value = { ...memberFilterNames.value, [key]: undefined };
	page.value = 1;
}

const query = ref("");
const debouncedQuery = refDebounced(query, 300);
watch(debouncedQuery, (value) => {
	filters.value.q = value || undefined;
	page.value = 1;
});

const isFiltered = computed(
	() =>
		Boolean(debouncedQuery.value) ||
		selectedTypeCode.value !== null ||
		selectedStatus.value !== null ||
		memberChips.value.length > 0,
);

const guildId = computed(() => guildData.value?.id);
const { entries, total, status, refresh } = useModerationLog({
	guildId,
	limit,
	offset,
	filters,
});

// The case shown in the slideover. It stays set while the slideover closes,
// so its content does not empty out during the transition.
const selectedCase = ref<ModerationLogEntry | null>(null);
const caseOpen = ref(false);
// Opened by code rather than through a trigger, the dialog has nothing to give
// focus back to on its own: the button that opened it is kept for that.
let opener: HTMLElement | null = null;
let focusFiltersOnClose = false;

function openCase(caseId: number, event: Event) {
	const entry = entries.value.find((item) => item.caseId === caseId);
	if (!entry) return;
	opener = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
	selectedCase.value = entry;
	caseOpen.value = true;
}

function applyMemberFilter(key: MemberFilterKey, id: string, name: string) {
	filters.value[key] = id;
	memberFilterNames.value = { ...memberFilterNames.value, [key]: name };
	page.value = 1;
	// The rows change under the filter, so focus lands on the filter it added.
	focusFiltersOnClose = true;
	caseOpen.value = false;
}

function returnFocus(event: Event) {
	event.preventDefault();
	const target = focusFiltersOnClose
		? memberFiltersRoot.value?.querySelector<HTMLElement>("button")
		: opener;
	focusFiltersOnClose = false;
	if (target?.isConnected) target.focus();
}

const tableLabel = computed(() =>
	warningsOnly ? ts("guild_logs.tab_warnings") : ts("guild_logs.tab_moderation"),
);

const tableStyle = computed(() => ({
	"--logs-min-width": warningsOnly ? "58.25rem" : "63.25rem",
}));

function durationLabel(entry: ModerationLogEntry): string {
	const duration = moderationCaseDuration(entry);
	if (duration.kind === "timed") return duration.label;
	return duration.kind === "permanent" ? ts("guild_logs.permanent") : "–";
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
			at: created ? formatActivityTime(created, now, timeLocale.value) : "–",
			caseId: entry.caseId,
			datetime: entry.createdAt ?? undefined,
			duration: durationLabel(entry),
			fullDate: created?.toLocaleString(timeLocale.value),
			moderator: entry.moderatorMember
				? auditLogMemberName(entry.moderatorMember)
				: ts("guild_logs.unknown"),
			moderatorAvatar: auditLogMemberAvatar(entry.moderatorMember),
			reason: entry.reason ?? ts("guild_logs.no_reason"),
			statusLabel: ts(MODERATION_CASE_STATUS_KEY[entry.status]),
			statusTone: MODERATION_CASE_STATUS_TONE[entry.status],
			target: target ? `@${target}` : ts("guild_logs.unknown"),
			targetAvatar: auditLogMemberAvatar(entry.targetMember),
			tone: moderationCaseTone(entry),
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

function caseCell(row: Row) {
	return h(
		"button",
		{
			"type": "button",
			"class": "logs-case case-open",
			"aria-haspopup": "dialog",
			"aria-label": ts("guild_logs.open_case", { id: row.caseId }),
			"onClick": (event: Event) => openCase(row.caseId, event),
		},
		`#${row.caseId}`,
	);
}

function dateCell(row: Row) {
	return h("time", { class: "logs-mono", datetime: row.datetime, title: row.fullDate }, row.at);
}

const columns = computed<TableColumn<Row>[]>(() => [
	{
		accessorKey: "caseId",
		header: ts("guild_logs.columns.case"),
		meta: logsColumnWidth("w-16"),
		cell: ({ row }) => caseCell(row.original),
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
		accessorKey: "statusLabel",
		header: ts("guild_logs.columns.status"),
		meta: logsColumnWidth("w-28"),
		cell: ({ row }) =>
			h(GuildLogsPill, { tone: row.original.statusTone }, () => row.original.statusLabel),
	},
	{
		accessorKey: "reason",
		header: ts("guild_logs.columns.reason"),
		meta: logsColumnWidth("w-[24%]"),
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

<style scoped>
@reference "@/assets/css/main.css";

/* The case number opens the case: it keeps its look in the row, and shows
   it is a control on hover and on keyboard focus. */
.case-open {
	@apply cursor-pointer rounded-[3px] underline-offset-2 hover:underline;
}

.case-open:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}
</style>
