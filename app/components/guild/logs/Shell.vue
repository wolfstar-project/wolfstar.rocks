<template>
	<div class="logs-shell">
		<div class="flex flex-wrap items-center gap-2.5">
			<label class="logs-search">
				<UIcon
					name="ic:round-search"
					class="size-4 shrink-0 text-muted"
					aria-hidden="true"
				/>
				<input
					v-model="search"
					type="search"
					:placeholder="ts('guild_logs.search_placeholder')"
					:aria-label="ts('guild_logs.search_aria')"
				/>
			</label>
			<slot name="filter" />
			<span class="grow"></span>
			<UButton
				color="neutral"
				variant="ghost"
				icon="ic:round-refresh"
				class="size-9 justify-center rounded-[5px] text-muted"
				:loading="status === 'pending'"
				:aria-label="refreshLabel"
				@click="emit('refresh')"
			/>
		</div>

		<LoadingSpinner v-if="status !== 'success' && status !== 'error' && shown === 0" />

		<div v-else-if="shown === 0" class="logs-empty" role="status">
			<span class="logs-empty-icon">
				<UIcon :name="emptyIcon" class="size-6 text-muted" aria-hidden="true" />
			</span>
			<p class="text-base font-bold">{{ emptyTitle }}</p>
			<p v-if="emptyDescription" class="max-w-90 text-[0.8125rem] leading-[1.55] text-muted">
				{{ emptyDescription }}
			</p>
		</div>

		<template v-else>
			<slot />

			<div class="flex flex-wrap items-center gap-3">
				<p class="text-[0.8125rem] text-muted">
					{{ ts("guild_logs.showing_entries", { shown, total }) }}
				</p>
				<span class="grow"></span>
				<UPagination
					v-if="total > pageSize"
					v-model:page="page"
					:total="total"
					:items-per-page="pageSize"
					:sibling-count="1"
					size="sm"
					color="neutral"
					variant="outline"
					active-color="primary"
					active-variant="solid"
				/>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
type AsyncDataStatus = "idle" | "pending" | "success" | "error";

/** The search text, as typed; the tables debounce it before they ask the server. */
const search = defineModel<string>("search", { required: true });
const page = defineModel<number>("page", { required: true });

const { status, total, shown, pageSize, refreshLabel, emptyIcon, emptyTitle, emptyDescription } =
	defineProps<{
		status: AsyncDataStatus;
		/** Entries the server holds for the current search and filter. */
		total: number;
		/** Entries on the page being shown. */
		shown: number;
		pageSize: number;
		refreshLabel: string;
		emptyIcon: string;
		emptyTitle: string;
		emptyDescription?: string;
	}>();

const emit = defineEmits<{
	refresh: [];
}>();

const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.logs-shell {
	@apply flex flex-col gap-3.5 rounded-[10px] p-4.5;
	background-color: var(--console-surface);
	border: 1px solid var(--home-border-subtle);
}

.logs-search {
	@apply flex h-10 max-w-80 min-w-0 flex-[1_1_13.75rem] items-center gap-2 rounded-[6px] px-3;
	background-color: var(--console-input);
	border: 1px solid var(--console-border);
}

.logs-search:focus-within {
	outline: 2px solid var(--color-primary);
	outline-offset: -1px;
}

/* Every property the field needs is set here, so nothing a global `input`
   rule adds (padding, border, background) can push the text under the icon. */
.logs-search input {
	@apply min-w-0 flex-auto border-0 bg-transparent p-0 text-sm outline-none;
	color: var(--ui-text-highlighted);
}

.logs-search input::placeholder {
	color: var(--ui-text-muted);
}

.logs-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-10 text-center;
	border: 1px dashed var(--console-border);
}

.logs-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}

/* The caller renders the entries in the default slot: a `UTable` from `md`
   up (see `LOGS_TABLE_UI`), and below it a list of small cards: what happened,
   why, who and when. */
.logs-shell :deep(.logs-table) {
	@apply overflow-x-auto rounded-[8px];
	border: 1px solid var(--console-border);
}

.logs-shell :deep(.logs-card) {
	@apply flex flex-col gap-2 px-3.5 py-3;
}

.logs-shell :deep(.logs-card + .logs-card) {
	border-top: 1px solid var(--home-border-subtle);
}

.logs-shell :deep(.logs-line) {
	@apply flex min-w-0 items-center gap-2.5;
}

.logs-shell :deep(.logs-member) {
	@apply flex min-w-0 items-center gap-2;
}

.logs-shell :deep(.logs-mono) {
	@apply font-mono text-xs whitespace-nowrap text-muted;
}

.logs-shell :deep(.logs-strong) {
	@apply font-semibold text-primary theme-light:text-default;
}

.logs-shell :deep(.logs-case) {
	@apply font-mono text-[0.8125rem] text-primary theme-light:text-default;
}
</style>
