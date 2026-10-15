<template>
	<section class="console-card" :aria-labelledby="headingId">
		<div class="review-heading">
			<h2 :id="headingId">{{ ts("guild_settings.reports.queue.title") }}</h2>
			<span aria-hidden="true"></span>
			<UButton
				color="neutral"
				variant="ghost"
				icon="ic:round-refresh"
				size="xs"
				:loading="status === 'pending'"
				:aria-label="ts('guild_settings.reports.queue.refresh')"
				@click="refresh()"
			/>
		</div>

		<div class="mt-4">
			<div
				class="mb-1 flex flex-wrap gap-2"
				role="group"
				:aria-label="ts('guild_settings.reports.queue.filter_aria')"
			>
				<button
					v-for="filter in filters"
					:key="filter.value"
					type="button"
					class="review-filter"
					:aria-pressed="filter.value === selected"
					@click="selected = filter.value"
				>
					{{ filter.label }}
				</button>
			</div>

			<DashboardSkeleton
				v-if="status !== 'success' && status !== 'error' && entries.length === 0"
				kind="table"
				bare
			/>

			<div v-else-if="entries.length === 0" class="review-empty" role="status">
				<span class="review-empty-icon" aria-hidden="true">
					<UIcon name="ic:round-flag" class="size-6 text-muted" />
				</span>
				<p class="text-base font-bold">{{ emptyTitle }}</p>
				<p class="max-w-90 text-[0.8125rem] leading-[1.55] text-muted">
					{{ emptyDescription }}
				</p>
			</div>

			<!-- Scrolls sideways on a phone, so the keyboard can reach it too. -->
			<div
				v-else
				class="overflow-x-auto"
				tabindex="0"
				role="region"
				:aria-label="ts('guild_settings.reports.queue.table_aria')"
			>
				<table
					class="review-table"
					:aria-label="ts('guild_settings.reports.queue.table_aria')"
				>
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">
								{{ ts("guild_settings.reports.queue.columns.target") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.reports.queue.columns.reason") }}
							</th>
							<th scope="col">
								{{ ts("guild_settings.reports.queue.columns.status") }}
							</th>
							<th scope="col">
								<span class="sr-only">{{
									ts("guild_settings.reports.queue.columns.filed")
								}}</span>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="report in rows" :key="report.id">
							<td class="font-mono text-xs text-muted">{{ report.id }}</td>
							<td class="truncate text-sm font-semibold text-highlighted">
								{{ report.target }}
							</td>
							<td class="truncate text-[0.8125rem] text-toned" :title="report.reason">
								{{ report.reason }}
							</td>
							<td>
								<GuildLogsPill :tone="report.tone">{{
									report.statusLabel
								}}</GuildLogsPill>
							</td>
							<td>
								<time
									class="font-mono text-xs whitespace-nowrap text-muted"
									:datetime="report.datetime"
									:title="report.fullDate"
								>
									{{ report.at }}
								</time>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<p v-if="total > entries.length" class="mt-3 text-[0.8125rem] text-muted">
				{{ ts("guild_logs.showing_entries", { shown: entries.length, total }) }}
			</p>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ReportStatus } from "#shared/types/report";
import type { LogsPillTone } from "./logs/Pill.vue";
import { REPORT_STATUSES } from "#shared/schemas";

/**
 * The member reports of the open server, newest first, with a filter for each
 * status. It only reads: a report is actioned or dismissed from Discord.
 */
const { ts } = useI18n();
const { locale } = useAppLocale();
const { guildData } = useGuildData();

const QUEUE_LIMIT = 25;

const STATUS_TONES: Record<ReportStatus, LogsPillTone> = {
	Actioned: "success",
	Dismissed: "neutral",
	Open: "warning",
};

const STATUS_LABEL_KEYS: Record<ReportStatus, string> = {
	Actioned: "guild_settings.reports.queue.status.actioned",
	Dismissed: "guild_settings.reports.queue.status.dismissed",
	Open: "guild_settings.reports.queue.status.open",
};

const headingId = useId();
const selected = ref<ReportStatus | "all">("Open");

const { entries, total, status, refresh } = useReports({
	guildId: () => guildData.value?.id,
	limit: QUEUE_LIMIT,
	status: () => (selected.value === "all" ? undefined : selected.value),
});

const filters = computed(() => [
	{ label: ts("guild_settings.reports.queue.status.all"), value: "all" as const },
	...REPORT_STATUSES.map((value) => ({ label: ts(STATUS_LABEL_KEYS[value]), value })),
]);

const now = new Date();
const rows = computed(() =>
	entries.value.map((report) => {
		const filed = new Date(report.createdAt);
		return {
			at: formatActivityTime(filed, now, locale.value),
			datetime: filed.toISOString(),
			fullDate: filed.toLocaleString(locale.value),
			id: report.id,
			reason: report.reason,
			statusLabel: ts(STATUS_LABEL_KEYS[report.status]),
			target: `@${report.targetTag}`,
			tone: STATUS_TONES[report.status],
		};
	}),
);

// An empty "All" means nobody has reported anyone yet; an empty status, that
// none of the reports has it right now.
const emptyTitle = computed(() =>
	selected.value === "all"
		? ts("guild_settings.reports.queue.empty_title")
		: ts("guild_settings.reports.queue.empty_status_title"),
);
const emptyDescription = computed(() =>
	selected.value === "all"
		? ts("guild_settings.reports.queue.empty_description")
		: ts("guild_settings.reports.queue.empty_status_description"),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.review-heading {
	@apply flex items-center gap-3;
}

.review-heading h2 {
	@apply text-[1.0625rem] font-semibold whitespace-nowrap;
}

.review-heading > span {
	@apply h-px flex-1;
	background-color: var(--console-border);
}

/* The design's pill filters: a quiet outline, and the picked one tinted. */
.review-filter {
	@apply h-7.5 cursor-pointer rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold text-toned;
	border: 1px solid var(--console-border);
	transition: background-color 150ms ease;
}

.review-filter:hover {
	background-color: var(--console-hover);
}

.review-filter[aria-pressed="true"] {
	@apply text-highlighted;
	background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
	border-color: var(--color-primary);
}

.review-filter:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.review-table {
	@apply w-full min-w-140 table-fixed border-collapse;
}

.review-table th {
	@apply px-2.5 pb-2 text-left text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.review-table td {
	@apply h-12 px-2.5 py-2;
	border-top: 1px solid var(--home-border-subtle);
}

/* The number, the status and the time take what they need; the target and
   the reason share the rest, the reason a little more. */
.review-table th:nth-child(1) {
	@apply w-14;
}

.review-table th:nth-child(2) {
	width: 30%;
}

.review-table th:nth-child(4) {
	@apply w-30;
}

.review-table th:nth-child(5) {
	@apply w-36;
}

.review-table td:nth-child(5) {
	@apply text-right;
}

.review-empty {
	@apply mt-3 flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-10 text-center;
	border: 1px dashed var(--console-border);
}

.review-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}
</style>
