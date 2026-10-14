<template>
	<div
		role="status"
		aria-busy="true"
		aria-live="polite"
		:aria-label="ts('dashboard.loading_aria')"
	>
		<!-- Overview: the stat tiles, the chart beside a short list, the settings
		     card and the activity rows. -->
		<div v-if="kind === 'overview'" class="flex flex-col gap-5">
			<div class="flex flex-col gap-2.5" aria-hidden="true">
				<span class="sk h-5.5 w-55 rounded-[6px]"></span>
				<span class="sk h-3.25 w-[min(420px,90%)] rounded-[5px]"></span>
			</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
				<div v-for="tile in 5" :key="tile" class="console-card p-3.5!">
					<span class="sk h-2.75 w-[55%] rounded-[6px]"></span>
					<span class="sk mt-2.5 h-5.5 w-[40%] rounded-[6px]"></span>
					<span class="sk mt-2 h-2.5 w-[65%] rounded-[5px]"></span>
				</div>
			</div>
			<div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" aria-hidden="true">
				<div class="console-card">
					<div class="sk-heading"><span class="sk h-4.25 w-30 rounded-[6px]"></span></div>
					<div class="mt-5 flex h-35 items-end gap-3">
						<span
							v-for="height in BAR_HEIGHTS"
							:key="height"
							class="sk flex-1 rounded-t-[4px]"
							:style="{ height }"
						></span>
					</div>
				</div>
				<div class="console-card">
					<div class="sk-heading">
						<span class="sk h-4.25 w-22.5 rounded-[6px]"></span>
					</div>
					<div class="mt-3.5 flex flex-col gap-3.5">
						<div v-for="row in 5" :key="row" class="flex items-center gap-2.5">
							<span class="sk size-2 rounded-full"></span>
							<span class="sk h-3.25 w-[55%] rounded-[6px]"></span>
							<span class="grow"></span>
							<span class="sk h-2.75 w-12 rounded-[5px]"></span>
						</div>
					</div>
				</div>
			</div>
			<div class="console-card" aria-hidden="true">
				<div class="sk-heading"><span class="sk h-4.25 w-40 rounded-[6px]"></span></div>
				<div class="mt-4 grid gap-5 sm:grid-cols-2">
					<div v-for="field in 2" :key="field" class="flex flex-col gap-2">
						<span class="sk h-3 w-22.5 rounded-[6px]"></span>
						<span class="sk h-10 w-full rounded-[6px]"></span>
						<span class="sk h-2.75 w-[70%] rounded-[5px]"></span>
					</div>
				</div>
			</div>
			<div class="console-card" aria-hidden="true">
				<div class="sk-heading"><span class="sk h-4.25 w-35 rounded-[6px]"></span></div>
				<div class="mt-4 flex flex-col gap-3.5">
					<div v-for="row in 5" :key="row" class="flex items-center gap-3">
						<span class="sk h-3 w-27.5 rounded-[6px]"></span>
						<span class="sk size-8 rounded-full"></span>
						<span class="sk h-3.25 w-[min(260px,40%)] rounded-[6px]"></span>
					</div>
				</div>
			</div>
		</div>

		<!-- A log or a rule list: the toolbar, then a bordered table. `bare`
		     keeps the table alone, for a page that already shows its toolbar. -->
		<div v-else-if="kind === 'table'" class="flex flex-col gap-4.5" aria-hidden="true">
			<div v-if="!bare" class="flex flex-col gap-2.5">
				<span class="sk h-5.5 w-55 rounded-[6px]"></span>
				<span class="sk h-3.25 w-[min(420px,90%)] rounded-[5px]"></span>
			</div>
			<div v-if="!bare" class="flex items-center gap-3">
				<span class="sk h-9 w-[min(320px,60%)] rounded-[6px]"></span>
				<span class="grow"></span>
				<span class="sk h-9 w-24 rounded-[6px]"></span>
			</div>
			<div class="sk-table">
				<div class="bg-(--console-active) px-4 py-3">
					<span class="sk h-2.5 w-45 rounded-[6px]"></span>
				</div>
				<div v-for="row in 6" :key="row" class="sk-table-row">
					<span class="sk h-3 w-22.5 rounded-[6px]"></span>
					<div class="flex items-center gap-2.5">
						<span class="sk size-8 shrink-0 rounded-full"></span>
						<span class="sk h-3.25 w-[60%] rounded-[6px]"></span>
					</div>
					<span class="sk h-3.25 w-[78%] rounded-[6px]"></span>
				</div>
			</div>
		</div>

		<!-- A settings section: fields and switch rows, then a list of toggles. -->
		<div v-else class="flex flex-col gap-5" aria-hidden="true">
			<div class="flex flex-col gap-2.5">
				<span class="sk h-5.5 w-55 rounded-[6px]"></span>
				<span class="sk h-3.25 w-[min(420px,90%)] rounded-[5px]"></span>
			</div>
			<div class="console-card">
				<div class="sk-heading"><span class="sk h-4.25 w-32.5 rounded-[6px]"></span></div>
				<div class="mt-4 grid gap-5 sm:grid-cols-2">
					<div v-for="field in 2" :key="field" class="flex flex-col gap-2">
						<span class="sk h-3 w-22.5 rounded-[6px]"></span>
						<span class="sk h-10 w-full rounded-[6px]"></span>
						<span class="sk h-2.75 w-[70%] rounded-[5px]"></span>
					</div>
				</div>
				<div class="mt-2">
					<div v-for="row in 2" :key="row" class="sk-switch-row">
						<div class="flex min-w-0 grow flex-col gap-2">
							<span class="sk h-3.5 w-[42%] rounded-[6px]"></span>
							<span class="sk h-2.75 w-[68%] rounded-[5px]"></span>
						</div>
						<span class="sk h-5.5 w-10 rounded-full"></span>
					</div>
				</div>
			</div>
			<div class="console-card">
				<div class="sk-heading"><span class="sk h-4.25 w-27.5 rounded-[6px]"></span></div>
				<div class="mt-4 flex flex-col gap-3.5">
					<div v-for="row in 4" :key="row" class="flex items-center gap-3.5">
						<span class="sk size-9.5 rounded-[10px]"></span>
						<div class="flex grow flex-col gap-1.75">
							<span class="sk h-3.5 w-[40%] rounded-[6px]"></span>
							<span class="sk h-2.75 w-[62%] rounded-[5px]"></span>
						</div>
						<span class="sk h-5.5 w-10 rounded-full"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * What a dashboard section looks like while its data loads: grey blocks where
 * the headings, fields and rows will be, so the page does not jump when they
 * arrive. `kind` picks the overview, a table (logs, rules) or a settings form.
 */
const { kind = "form", bare = false } = defineProps<{
	kind?: DashboardSkeletonKind;
	/** Only the table of the `table` kind, without the heading and toolbar. */
	bare?: boolean;
}>();

const { ts } = useI18n();

const BAR_HEIGHTS = ["62%", "88%", "48%", "100%", "70%", "84%", "44%"];
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's shimmer: the active surface with a lighter band passing
   over it. Reduced motion stops it (see `utilities.css`). */
.sk {
	@apply block shrink-0;
	background: linear-gradient(
		90deg,
		var(--console-active) 0%,
		color-mix(in srgb, var(--console-active) 72%, var(--ui-text-muted) 28%) 50%,
		var(--console-active) 100%
	);
	background-size: 200% 100%;
	animation: dashboard-skeleton 1.4s ease-in-out infinite;
}

@keyframes dashboard-skeleton {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.sk {
		animation: none;
	}
}

/* A card heading: the title block, then the rule running to the edge. */
.sk-heading {
	@apply flex items-center gap-3;
}

.sk-heading::after {
	@apply h-px grow;
	content: "";
	background-color: var(--home-border-subtle);
}

.sk-table {
	@apply overflow-hidden rounded-[8px];
	border: 1px solid var(--console-border, var(--home-border-subtle));
}

.sk-table-row {
	@apply grid grid-cols-[120px_minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-4 px-4 py-3.5;
	border-top: 1px solid var(--home-border-subtle);
}

.sk-switch-row {
	@apply flex items-center gap-3.5 py-3;
	border-top: 1px solid var(--home-border-subtle);
}
</style>
