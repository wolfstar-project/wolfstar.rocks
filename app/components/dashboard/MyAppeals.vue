<template>
	<div class="ma-page">
		<section class="ma-inner" :aria-labelledby="headingId">
			<div class="flex flex-wrap items-start gap-4">
				<div class="min-w-0 flex-[1_1_16rem]">
					<!-- An h2: the console header above holds the page's h1. -->
					<h2 :id="headingId" class="text-xl font-bold tracking-[0.01em]">
						{{ ts("dashboard.my_appeals.title") }}
					</h2>
					<p class="mt-1 text-[0.8125rem] leading-normal text-muted">
						{{ ts("dashboard.my_appeals.intro") }}
					</p>
				</div>
				<UBadge v-if="loaded" color="primary" variant="soft" class="shrink-0">
					{{ summary }}
				</UBadge>
			</div>

			<div
				class="flex flex-wrap gap-2"
				role="group"
				:aria-label="ts('dashboard.my_appeals.filter_aria')"
			>
				<button
					v-for="option in filters"
					:key="option.value"
					type="button"
					class="ma-filter"
					:aria-pressed="option.value === selected"
					@click="selected = option.value"
				>
					{{ option.label }}
					<span class="ma-filter-count">· {{ option.count }}</span>
				</button>
			</div>

			<div
				v-if="isLoading"
				class="ma-grid"
				role="status"
				:aria-label="ts('dashboard.my_appeals.loading_aria')"
			>
				<div v-for="index in 4" :key="index" class="ma-skeleton" aria-hidden="true">
					<div class="flex items-center gap-3">
						<USkeleton class="size-10 rounded-[13px]" />
						<div class="flex flex-1 flex-col gap-2">
							<USkeleton class="h-4 w-2/5" />
							<USkeleton class="h-3 w-3/5" />
						</div>
					</div>
					<USkeleton class="h-8 w-full" />
					<USkeleton class="h-7 w-24" />
				</div>
			</div>

			<div v-else-if="hasFailed" class="ma-empty" role="alert">
				<UIcon
					name="heroicons:exclamation-triangle"
					class="size-8 text-error"
					aria-hidden="true"
				/>
				<p class="text-toned">{{ ts("dashboard.my_appeals.load_failed") }}</p>
				<UButton color="neutral" variant="outline" class="dialog-cancel" @click="refresh()">
					{{ ts("dashboard.my_appeals.retry") }}
				</UButton>
			</div>

			<div v-else-if="visible.length === 0" class="ma-empty" role="status">
				<span class="ma-empty-icon" aria-hidden="true">
					<UIcon name="ic:round-balance" class="size-6 text-muted" />
				</span>
				<p class="text-base font-bold">{{ ts("dashboard.my_appeals.empty_title") }}</p>
				<p class="max-w-95 text-[0.8125rem] leading-[1.55] text-muted">
					{{ ts("dashboard.my_appeals.empty_description") }}
				</p>
			</div>

			<ul v-else class="ma-grid" :aria-label="ts('dashboard.my_appeals.list_aria')">
				<li v-for="entry in visible" :key="entry.key">
					<DashboardMyAppealCard :entry="entry" :now="now" @appeal="appealTo" />
				</li>
			</ul>
		</section>

		<DashboardMyAppealDialog
			v-model:open="dialogOpen"
			:entry="dialogEntry"
			:submit="submit"
			:load-page="loadPage"
		/>
	</div>
</template>

<script setup lang="ts">
import type { MyAppealEntry, MyAppealFilter } from "#shared/utils/my-appeals";
const { guildId = null } = defineProps<{
	/** The server the bot's link named, whose open case the dialog opens on. */
	guildId?: string | null;
}>();

const { ts } = useI18n();
const headingId = useId();

const { entries, error, loadPage, loaded, openCount, refresh, status, submit } = useMyAppeals({
	guild: () => guildId,
	live: true,
});

// Only the first read: the reads of the open list keep the cases on screen.
const isLoading = computed(
	() => !loaded.value && (status.value === "pending" || status.value === "idle"),
);
const hasFailed = computed(() => status.value === "error" && Boolean(error.value));

// Relative times read from one clock, ticking each minute while the page is open.
const now = ref(new Date());
let clock: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
	clock = setInterval(() => (now.value = new Date()), 60_000);
});
onBeforeUnmount(() => clearInterval(clock));

const selected = ref<MyAppealFilter>("all");

const FILTER_KEYS: Record<MyAppealFilter, string> = {
	all: "dashboard.my_appeals.filters.all",
	decided: "dashboard.my_appeals.filters.decided",
	open: "dashboard.my_appeals.filters.open",
	pending: "dashboard.my_appeals.filters.pending",
};

const filters = computed(() =>
	MyAppealFilters.map((value) => ({
		value,
		label: ts(FILTER_KEYS[value]),
		count: entries.value.filter((entry) => isInMyAppealFilter(entry.status, value)).length,
	})),
);

const visible = computed(() =>
	entries.value.filter((entry) => isInMyAppealFilter(entry.status, selected.value)),
);

const summary = computed(() => {
	const count = openCount.value;
	if (count === 0) return ts("dashboard.my_appeals.summary_none");
	return count === 1
		? ts("dashboard.my_appeals.summary_one")
		: ts("dashboard.my_appeals.summary_many", { count });
});

const dialogOpen = ref(false);
const dialogEntry = shallowRef<MyAppealEntry | null>(null);

function appealTo(entry: MyAppealEntry) {
	dialogEntry.value = entry;
	dialogOpen.value = true;
}

// The bot's link opens the dialog, once, on the newest case of its server that
// can be appealed: the direct message is about the case the bot just opened,
// which its link cannot name, as the case has no number yet when it is sent.
const openedFor = ref<string | null>(null);
watchEffect(() => {
	if (!guildId || openedFor.value === guildId || status.value !== "success") return;
	openedFor.value = guildId;
	const newest = entries.value
		.filter((entry) => entry.guild.id === guildId && entry.status === "open")
		.toSorted((a, b) => Date.parse(b.case.createdAt) - Date.parse(a.case.createdAt))[0];
	if (newest) appealTo(newest);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.ma-page {
	@apply min-h-0 flex-1 overflow-auto;
	container-type: inline-size;
}

.ma-inner {
	@apply flex max-w-270 flex-col gap-4.5 px-4 pt-6 pb-10 sm:px-7;
}

/* Two columns once the page is wide enough for two cards, one on a phone. */
.ma-grid {
	@apply grid grid-cols-1 items-start gap-3.5;
}

@container (min-width: 48rem) {
	.ma-grid {
		@apply grid-cols-2;
	}
}

.ma-filter {
	@apply inline-flex h-7.5 cursor-pointer items-center gap-1 rounded-full bg-transparent px-3 text-[0.8125rem] font-semibold text-toned;
	border: 1px solid var(--console-border, var(--ink-400));
	transition: background-color 150ms ease;
}

.ma-filter:hover {
	background-color: var(--console-hover);
}

.ma-filter[aria-pressed="true"] {
	@apply text-highlighted;
	background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
	border-color: var(--color-primary);
}

.ma-filter:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.ma-filter-count {
	@apply font-medium text-muted;
}

.ma-skeleton {
	@apply flex flex-col gap-2.5 rounded-[12px] p-4;
	background-color: var(--console-surface, var(--ink-700));
	border: 1px solid var(--home-border-subtle);
}

.ma-empty {
	@apply flex flex-col items-center gap-2.5 rounded-[10px] px-6 py-8 text-center;
	border: 1px dashed var(--console-border, var(--ink-400));
}

.ma-empty-icon {
	@apply flex size-13 items-center justify-center rounded-full;
	background-color: var(--console-active);
}

@media (prefers-reduced-motion: reduce) {
	.ma-filter {
		transition: none;
	}
}
</style>
