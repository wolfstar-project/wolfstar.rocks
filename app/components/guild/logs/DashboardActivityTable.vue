<template>
	<GuildLogsShell
		v-model:search="query"
		v-model:page="page"
		:status="status"
		:total="total"
		:shown="rows.length"
		:page-size="limit"
		:refresh-label="ts('guild_logs.refresh_activity')"
		empty-icon="ic:round-history"
		:empty-title="ts('guild_logs.no_logs')"
		:empty-description="debouncedQuery ? ts('guild_logs.no_activity_filter_match') : undefined"
		@refresh="refresh()"
	>
		<UTable
			:data="rows"
			:columns="columns"
			:aria-label="ts('guild_logs.tab_activity')"
			:style="TABLE_STYLE"
			:ui="LOGS_TABLE_UI"
		/>

		<ul class="logs-table md:hidden" :aria-label="ts('guild_logs.tab_activity')">
			<li v-for="row in rows" :key="row.id" class="logs-card">
				<div class="logs-line">
					<div class="logs-member">
						<UAvatar v-bind="row.avatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm font-semibold">{{ row.name }}</span>
					</div>
					<span class="grow"></span>
					<GuildLogsPill :tone="row.outcomeTone">{{ row.outcome }}</GuildLogsPill>
				</div>
				<div class="flex items-center gap-2.5">
					<p class="min-w-0 flex-auto text-[0.8125rem] leading-[1.45] text-toned">
						<span
							v-for="(part, index) in row.parts"
							:key="index"
							:class="{ 'logs-strong': part.strong }"
							>{{ part.text }}</span
						>
					</p>
					<GuildAuditChanges :entry="row.entry" :resolver />
				</div>
				<div class="logs-line">
					<span class="grow"></span>
					<time class="logs-mono" :datetime="row.datetime" :title="row.fullDate">
						{{ row.at }}
					</time>
				</div>
			</li>
		</ul>
	</GuildLogsShell>
</template>

<script setup lang="ts">
import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { TableColumn } from "@nuxt/ui";
import type { LogsPillTone } from "./Pill.vue";

const TABLE_STYLE = { "--logs-min-width": "47.5rem" };

const { guildData } = useGuildData();
const { ts } = useI18n();
const { timeLocale } = useAppLocale();

const page = ref(1);
const limit = ref(LOGS_PAGE_SIZE);
const offset = computed(() => (page.value - 1) * limit.value);
const filters = ref<{ q?: string }>({});

const query = ref("");
const debouncedQuery = refDebounced(query, 300);
watch(debouncedQuery, (value) => {
	filters.value.q = value || undefined;
	page.value = 1;
});

const guildId = computed(() => guildData.value?.id);

const { entries, total, status, refresh } = useAuditLog({
	guildId,
	limit,
	offset,
	filters,
});

function outcome(value: DashboardAuditEntry["outcome"]): { label: string; tone: LogsPillTone } {
	switch (value) {
		case "success":
			return { label: ts("guild_logs.outcomes.success"), tone: "success" };
		case "denied":
			return { label: ts("guild_logs.outcomes.denied"), tone: "warning" };
		default:
			return { label: ts("guild_logs.outcomes.failure"), tone: "error" };
	}
}

// Channel and role ids in a change read as their names when the guild has them.
const resolver = computed(() => ({
	channels: new Map((guildData.value?.channels ?? []).map((item) => [item.id, item])),
	roles: new Map((guildData.value?.roles ?? []).map((item) => [item.id, item])),
}));

const now = new Date();

const rows = computed(() =>
	entries.value.map((entry) => {
		const happened = new Date(entry.timestamp);
		const result = outcome(entry.outcome);
		return {
			at: formatActivityTime(happened, now, timeLocale.value),
			avatar: auditLogMemberAvatar(entry.member),
			datetime: happened.toISOString(),
			entry,
			fullDate: happened.toLocaleString(timeLocale.value),
			id: entry.id,
			name: auditLogMemberName(entry.member),
			outcome: result.label,
			outcomeTone: result.tone,
			parts: auditLogActionParts(entry, resolver.value),
			username: entry.member.user?.username ?? "",
		};
	}),
);

type Row = (typeof rows.value)[number];

const UAvatar = resolveComponent("UAvatar");
const GuildLogsPill = resolveComponent("GuildLogsPill");
const GuildAuditChanges = resolveComponent("GuildAuditChanges");

const columns = computed<TableColumn<Row>[]>(() => [
	{
		accessorKey: "at",
		header: ts("guild_logs.columns.date"),
		meta: logsColumnWidth("w-38"),
		cell: ({ row }) =>
			h(
				"time",
				{
					class: "logs-mono",
					datetime: row.original.datetime,
					title: row.original.fullDate,
				},
				row.original.at,
			),
	},
	{
		accessorKey: "name",
		header: ts("guild_logs.columns.user"),
		meta: logsColumnWidth("w-[26%]"),
		cell: ({ row }) =>
			h("div", { class: "flex min-w-0 items-center gap-2.5" }, [
				h(UAvatar, { ...row.original.avatar, class: "shrink-0", size: "md" }),
				h("div", { class: "min-w-0" }, [
					h(
						"p",
						{ class: "truncate text-sm font-semibold text-highlighted" },
						row.original.name,
					),
					h("p", { class: "truncate text-xs text-muted" }, `@${row.original.username}`),
				]),
			]),
	},
	{
		id: "action",
		header: ts("guild_logs.columns.action"),
		cell: ({ row }) =>
			h("div", { class: "flex min-w-0 items-center gap-2.5" }, [
				h(
					"span",
					{ class: "min-w-0 flex-auto leading-[1.45]" },
					row.original.parts.map((part) =>
						h("span", { class: part.strong ? "logs-strong" : undefined }, part.text),
					),
				),
				h(GuildAuditChanges, { entry: row.original.entry, resolver: resolver.value }),
			]),
	},
	{
		accessorKey: "outcome",
		header: ts("guild_logs.columns.outcome"),
		meta: logsColumnWidth("w-30"),
		cell: ({ row }) =>
			h(GuildLogsPill, { tone: row.original.outcomeTone }, () => row.original.outcome),
	},
]);
</script>
