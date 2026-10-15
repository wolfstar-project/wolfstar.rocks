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
				<USkeleton class="h-5.5 w-55 shrink-0 rounded-[6px]" />
				<USkeleton class="h-3.25 w-[min(420px,90%)] shrink-0 rounded-[5px]" />
			</div>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden="true">
				<div v-for="tile in 5" :key="tile" class="console-card p-3.5!">
					<USkeleton class="h-2.75 w-[55%] shrink-0 rounded-[6px]" />
					<USkeleton class="mt-2.5 h-5.5 w-[40%] shrink-0 rounded-[6px]" />
					<USkeleton class="mt-2 h-2.5 w-[65%] shrink-0 rounded-[5px]" />
				</div>
			</div>
			<div class="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" aria-hidden="true">
				<div class="console-card">
					<div class="sk-heading">
						<USkeleton class="h-4.25 w-30 shrink-0 rounded-[6px]" />
					</div>
					<div class="mt-5 flex h-35 items-end gap-3">
						<USkeleton
							v-for="height in BAR_HEIGHTS"
							:key="height"
							class="flex-1 rounded-t-[4px] rounded-b-none"
							:style="{ height }"
						/>
					</div>
				</div>
				<div class="console-card">
					<div class="sk-heading">
						<USkeleton class="h-4.25 w-22.5 shrink-0 rounded-[6px]" />
					</div>
					<div class="mt-3.5 flex flex-col gap-3.5">
						<div v-for="row in 5" :key="row" class="flex items-center gap-2.5">
							<USkeleton class="size-2 shrink-0 rounded-full" />
							<USkeleton class="h-3.25 w-[55%] shrink-0 rounded-[6px]" />
							<span class="grow"></span>
							<USkeleton class="h-2.75 w-12 shrink-0 rounded-[5px]" />
						</div>
					</div>
				</div>
			</div>
			<div class="console-card" aria-hidden="true">
				<div class="sk-heading">
					<USkeleton class="h-4.25 w-40 shrink-0 rounded-[6px]" />
				</div>
				<div class="mt-4 grid gap-5 sm:grid-cols-2">
					<div v-for="field in 2" :key="field" class="flex flex-col gap-2">
						<USkeleton class="h-3 w-22.5 shrink-0 rounded-[6px]" />
						<USkeleton class="h-10 w-full shrink-0 rounded-[6px]" />
						<USkeleton class="h-2.75 w-[70%] shrink-0 rounded-[5px]" />
					</div>
				</div>
			</div>
			<div class="console-card" aria-hidden="true">
				<div class="sk-heading">
					<USkeleton class="h-4.25 w-35 shrink-0 rounded-[6px]" />
				</div>
				<div class="mt-4 flex flex-col gap-3.5">
					<div v-for="row in 5" :key="row" class="flex items-center gap-3">
						<USkeleton class="h-3 w-27.5 shrink-0 rounded-[6px]" />
						<USkeleton class="size-8 shrink-0 rounded-full" />
						<USkeleton class="h-3.25 w-[min(260px,40%)] shrink-0 rounded-[6px]" />
					</div>
				</div>
			</div>
		</div>

		<!-- Modules: the heading with its count and buttons, then a card per
		     module with its tile and switch, its name and description, and a
		     button at the foot. -->
		<div v-else-if="kind === 'modules'" class="flex flex-col gap-5" aria-hidden="true">
			<div class="flex flex-wrap items-start gap-4">
				<div class="flex min-w-0 grow flex-col gap-2.5">
					<USkeleton class="h-5.5 w-55 shrink-0 rounded-[6px]" />
					<USkeleton class="h-3.25 w-[min(420px,90%)] shrink-0 rounded-[5px]" />
				</div>
				<div class="flex items-center gap-2">
					<USkeleton class="h-7 w-28 shrink-0 rounded-full" />
					<USkeleton class="h-8 w-22 shrink-0 rounded-[6px]" />
					<USkeleton class="h-8 w-22 shrink-0 rounded-[6px]" />
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
				<div v-for="card in MODULE_CARDS" :key="card" class="console-card flex flex-col">
					<div class="flex items-start justify-between gap-3">
						<USkeleton class="size-11 shrink-0 rounded-lg" />
						<USkeleton class="h-5.5 w-10 shrink-0 rounded-full" />
					</div>
					<USkeleton class="mt-3 h-4 w-[45%] shrink-0 rounded-[6px]" />
					<USkeleton class="mt-2 h-3 w-[90%] shrink-0 rounded-[5px]" />
					<USkeleton class="mt-1.5 h-3 w-[65%] shrink-0 rounded-[5px]" />
					<div class="mt-4 flex justify-end">
						<USkeleton class="h-8 w-24 shrink-0 rounded-[6px]" />
					</div>
				</div>
			</div>
		</div>

		<!-- A log or a rule list: the toolbar, then a bordered table. `bare`
		     keeps the table alone, for a page that already shows its toolbar. -->
		<div v-else-if="kind === 'table'" class="flex flex-col gap-4.5" aria-hidden="true">
			<div v-if="!bare" class="flex flex-col gap-2.5">
				<USkeleton class="h-5.5 w-55 shrink-0 rounded-[6px]" />
				<USkeleton class="h-3.25 w-[min(420px,90%)] shrink-0 rounded-[5px]" />
			</div>
			<div v-if="!bare" class="flex items-center gap-3">
				<USkeleton class="h-9 w-[min(320px,60%)] shrink-0 rounded-[6px]" />
				<span class="grow"></span>
				<USkeleton class="h-9 w-24 shrink-0 rounded-[6px]" />
			</div>
			<div class="sk-table">
				<div class="bg-(--console-active) px-4 py-3">
					<USkeleton class="h-2.5 w-45 shrink-0 rounded-[6px]" />
				</div>
				<div v-for="row in 6" :key="row" class="sk-table-row">
					<USkeleton class="h-3 w-22.5 shrink-0 rounded-[6px]" />
					<div class="flex items-center gap-2.5">
						<USkeleton class="size-8 shrink-0 rounded-full" />
						<USkeleton class="h-3.25 w-[60%] shrink-0 rounded-[6px]" />
					</div>
					<USkeleton class="h-3.25 w-[78%] shrink-0 rounded-[6px]" />
				</div>
			</div>
		</div>

		<!-- A settings section: fields and switch rows, then a list of toggles. -->
		<div v-else class="flex flex-col gap-5" aria-hidden="true">
			<div class="flex flex-col gap-2.5">
				<USkeleton class="h-5.5 w-55 shrink-0 rounded-[6px]" />
				<USkeleton class="h-3.25 w-[min(420px,90%)] shrink-0 rounded-[5px]" />
			</div>
			<div class="console-card">
				<div class="sk-heading">
					<USkeleton class="h-4.25 w-32.5 shrink-0 rounded-[6px]" />
				</div>
				<div class="mt-4 grid gap-5 sm:grid-cols-2">
					<div v-for="field in 2" :key="field" class="flex flex-col gap-2">
						<USkeleton class="h-3 w-22.5 shrink-0 rounded-[6px]" />
						<USkeleton class="h-10 w-full shrink-0 rounded-[6px]" />
						<USkeleton class="h-2.75 w-[70%] shrink-0 rounded-[5px]" />
					</div>
				</div>
				<div class="mt-2">
					<div v-for="row in 2" :key="row" class="sk-switch-row">
						<div class="flex min-w-0 grow flex-col gap-2">
							<USkeleton class="h-3.5 w-[42%] shrink-0 rounded-[6px]" />
							<USkeleton class="h-2.75 w-[68%] shrink-0 rounded-[5px]" />
						</div>
						<USkeleton class="h-5.5 w-10 shrink-0 rounded-full" />
					</div>
				</div>
			</div>
			<div class="console-card">
				<div class="sk-heading">
					<USkeleton class="h-4.25 w-27.5 shrink-0 rounded-[6px]" />
				</div>
				<div class="mt-4 flex flex-col gap-3.5">
					<div v-for="row in 4" :key="row" class="flex items-center gap-3.5">
						<USkeleton class="size-9.5 shrink-0 rounded-[10px]" />
						<div class="flex grow flex-col gap-1.75">
							<USkeleton class="h-3.5 w-[40%] shrink-0 rounded-[6px]" />
							<USkeleton class="h-2.75 w-[62%] shrink-0 rounded-[5px]" />
						</div>
						<USkeleton class="h-5.5 w-10 shrink-0 rounded-full" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * What a dashboard section looks like while its data loads: `USkeleton` blocks
 * where the headings, fields and rows will be, so the page does not jump when
 * they arrive. `kind` picks the overview, the modules grid, a table (logs,
 * rules) or a settings form.
 */
const { kind = "form", bare = false } = defineProps<{
	kind?: DashboardSkeletonKind;
	/** Only the table of the `table` kind, without the heading and toolbar. */
	bare?: boolean;
}>();

const { ts } = useI18n();

const BAR_HEIGHTS = ["62%", "88%", "48%", "100%", "70%", "84%", "44%"];
// The modules that can be switched, then the ones announced as coming soon.
const MODULE_CARDS = GUILD_MODULES.length + DASHBOARD_NAV.filter((item) => item.comingSoon).length;
</script>

<style scoped>
@reference "@/assets/css/main.css";

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
