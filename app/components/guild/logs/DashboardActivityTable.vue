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
		<div
			class="logs-table hidden md:block"
			role="table"
			:aria-label="ts('guild_logs.tab_activity')"
			:style="TABLE_STYLE"
		>
			<div class="logs-grid" role="rowgroup">
				<div class="logs-head" role="row">
					<span role="columnheader">{{ ts("guild_logs.columns.date") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.user") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.action") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.outcome") }}</span>
				</div>
				<div v-for="row in rows" :key="row.id" class="logs-row" role="row">
					<time
						class="logs-mono"
						role="cell"
						:datetime="row.datetime"
						:title="row.fullDate"
					>
						{{ row.at }}
					</time>
					<div class="flex min-w-0 items-center gap-2.5" role="cell">
						<UAvatar v-bind="row.avatar" size="md" class="shrink-0" />
						<div class="min-w-0">
							<p class="truncate text-sm font-semibold">{{ row.name }}</p>
							<p class="truncate text-xs text-muted">@{{ row.username }}</p>
						</div>
					</div>
					<span class="min-w-0 text-[0.8125rem] leading-[1.45] text-toned" role="cell">
						<span
							v-for="(part, index) in row.parts"
							:key="index"
							:class="{ 'logs-strong': part.strong }"
							>{{ part.text }}</span
						>
					</span>
					<span role="cell">
						<GuildLogsPill :tone="row.outcomeTone">{{ row.outcome }}</GuildLogsPill>
					</span>
				</div>
			</div>
		</div>

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
				<p class="text-[0.8125rem] leading-[1.45] text-toned">
					<span
						v-for="(part, index) in row.parts"
						:key="index"
						:class="{ 'logs-strong': part.strong }"
						>{{ part.text }}</span
					>
				</p>
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
import type { LogsPillTone } from "./Pill.vue";

const TABLE_STYLE = {
	"--logs-columns": "9.375rem minmax(0, 1fr) minmax(0, 1.8fr) 6.5rem",
	"--logs-min-width": "47.5rem",
};

const { guildData } = useGuildData();
const { ts } = useI18n();
const { locale } = useAppLocale();

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
			at: formatActivityTime(happened, now, locale.value),
			avatar: auditLogMemberAvatar(entry.member),
			datetime: happened.toISOString(),
			fullDate: happened.toLocaleString(locale.value),
			id: entry.id,
			name: auditLogMemberName(entry.member),
			outcome: result.label,
			outcomeTone: result.tone,
			parts: auditLogActionParts(entry, resolver.value),
			username: entry.member.user?.username ?? "",
		};
	}),
);
</script>
