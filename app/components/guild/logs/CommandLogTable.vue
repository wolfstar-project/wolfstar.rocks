<template>
	<GuildLogsShell
		v-model:search="query"
		v-model:page="page"
		:status="status"
		:total="total"
		:shown="rows.length"
		:page-size="limit"
		:refresh-label="ts('guild_logs.refresh_command')"
		empty-icon="ic:round-terminal"
		:empty-title="ts('guild_logs.no_logs')"
		:empty-description="isFiltered ? ts('guild_logs.no_commands_filter_match') : undefined"
		@refresh="refresh()"
	>
		<template #filter>
			<USelect
				v-model="filters.success"
				:items="statusItems"
				:aria-label="ts('guild_logs.filter_status')"
				:ui="LOGS_FILTER_UI"
			/>
		</template>

		<div
			class="logs-table hidden md:block"
			role="table"
			:aria-label="ts('guild_logs.tab_commands')"
			:style="TABLE_STYLE"
		>
			<div class="logs-grid" role="rowgroup">
				<div class="logs-head" role="row">
					<span role="columnheader">{{ ts("guild_logs.columns.command") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.user") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.channel") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.type") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.result") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.latency") }}</span>
					<span role="columnheader">{{ ts("guild_logs.columns.date") }}</span>
				</div>
				<div v-for="row in rows" :key="row.id" class="logs-row" role="row">
					<span
						class="truncate font-mono text-[0.8125rem]"
						:class="{ 'text-error': !row.success }"
						role="cell"
					>
						{{ row.name }}
					</span>
					<div class="logs-member" role="cell">
						<UAvatar v-bind="row.avatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm font-semibold">{{ row.user }}</span>
					</div>
					<span class="truncate text-[0.8125rem] text-toned" role="cell">
						{{ row.channel }}
					</span>
					<span role="cell">
						<GuildLogsPill :tone="row.typeTone">{{ row.type }}</GuildLogsPill>
					</span>
					<span
						class="truncate text-[0.8125rem] text-toned"
						role="cell"
						:title="row.result"
					>
						{{ row.result }}
					</span>
					<span class="logs-mono" :class="row.latencyClass" role="cell">
						{{ row.latency }}
					</span>
					<time
						class="logs-mono"
						role="cell"
						:datetime="row.datetime"
						:title="row.fullDate"
					>
						{{ row.at }}
					</time>
				</div>
			</div>
		</div>

		<ul class="logs-table md:hidden" :aria-label="ts('guild_logs.tab_commands')">
			<li v-for="row in rows" :key="row.id" class="logs-card">
				<div class="logs-line">
					<span
						class="truncate font-mono text-[0.8125rem]"
						:class="{ 'text-error': !row.success }"
					>
						{{ row.name }}
					</span>
					<span class="grow"></span>
					<GuildLogsPill :tone="row.typeTone">{{ row.type }}</GuildLogsPill>
				</div>
				<div class="logs-line">
					<div class="logs-member">
						<UAvatar v-bind="row.avatar" size="xs" class="shrink-0" />
						<span class="truncate text-sm">{{ row.user }}</span>
					</div>
					<span class="grow"></span>
					<span class="truncate text-[0.8125rem] text-toned">{{ row.channel }}</span>
				</div>
				<span class="block text-[0.8125rem] leading-[1.45] text-toned">{{
					row.result
				}}</span>
				<div class="logs-line">
					<span class="logs-mono" :class="row.latencyClass">{{ row.latency }}</span>
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
import type { LogsPillTone } from "./Pill.vue";

const TABLE_STYLE = {
	"--logs-columns":
		"minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) 8.5rem minmax(0, 1.2fr) 5rem 7.5rem",
	"--logs-min-width": "57.5rem",
};

// Above this a command felt slow to whoever ran it.
const SLOW_LATENCY_MS = 300;

const { guildData } = useGuildData();
const { ts } = useI18n();
const { locale } = useAppLocale();

const page = ref(1);
const limit = ref(LOGS_PAGE_SIZE);
const offset = computed(() => (page.value - 1) * limit.value);
const filters = ref<{ success: "all" | "success" | "failure"; q?: string }>({ success: "all" });

const query = ref("");
const debouncedQuery = refDebounced(query, 300);
watch(debouncedQuery, (value) => {
	filters.value.q = value || undefined;
	page.value = 1;
});
watch(
	() => filters.value.success,
	() => {
		page.value = 1;
	},
);

const isFiltered = computed(() => Boolean(debouncedQuery.value) || filters.value.success !== "all");

const guildId = computed(() => guildData.value?.id);

const statusItems = computed(() => [
	{ label: ts("guild_logs.status_all"), value: "all" },
	{ label: ts("guild_logs.status_success"), value: "success" },
	{ label: ts("guild_logs.status_failed"), value: "failure" },
]);

const { entries, total, status, refresh } = useCommandLog({
	guildId,
	limit,
	offset,
	filters,
});

/** How Discord started the command: typed, or picked from a context menu. */
function commandType(type: string): { label: string; tone: LogsPillTone } {
	switch (type.toUpperCase()) {
		case "USER":
			return { label: ts("guild_logs.command_types.user"), tone: "success" };
		case "MESSAGE":
			return { label: ts("guild_logs.command_types.message"), tone: "warning" };
		default:
			return { label: ts("guild_logs.command_types.slash"), tone: "primary" };
	}
}

function latencyClass(latency: number | null): string {
	if (latency === null) return "text-error!";
	return latency > SLOW_LATENCY_MS ? "text-warning!" : "";
}

const now = new Date();

const rows = computed(() =>
	entries.value.map((entry) => {
		const member = (entry.metadata as { member?: typeof entry.metadata.member } | null)?.member;
		const executed = new Date(entry.executedAt);
		const type = commandType(entry.commandType);
		const channel = guildData.value?.channels.find((item) => item.id === entry.channelId);
		// A context-menu command is shown by its name; a typed one by what was typed.
		const typed = type.tone === "primary";
		const name = entry.subcommand
			? `${entry.commandName} ${entry.subcommand}`
			: entry.commandName;
		return {
			at: formatActivityTime(executed, now, locale.value),
			avatar: auditLogMemberAvatar(member),
			channel: channel ? `#${channel.name}` : "\u2013",
			datetime: entry.executedAt,
			fullDate: executed.toLocaleString(locale.value),
			id: entry.id,
			latency: entry.latencyMs === null ? "\u2013" : `${entry.latencyMs}ms`,
			latencyClass: latencyClass(entry.latencyMs),
			name: typed ? `/${name}` : name,
			result: entry.success
				? ts("guild_logs.result_succeeded")
				: (entry.errorReason ?? ts("guild_logs.status_failed")),
			success: entry.success,
			type: type.label,
			typeTone: type.tone,
			user: member ? auditLogMemberName(member) : entry.userId,
		};
	}),
);
</script>
