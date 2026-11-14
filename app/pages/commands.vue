<template>
	<!-- `relative` lifts the page above the layout's decorative top glow, which otherwise veils the heading. -->
	<UContainer class="commands-page relative px-4 pt-12 pb-20 sm:pt-16 sm:pb-24">
		<header class="mx-auto mb-11 flex max-w-[45rem] flex-col gap-5 text-center">
			<h1
				class="text-4xl font-bold tracking-(--home-ls-tight) text-default sm:text-[2.75rem]"
			>
				{{ ts("marketing.commands.title") }}
			</h1>
			<p class="text-lg leading-relaxed text-toned">
				{{ ts("marketing.commands.subtitle_lead") }}
				<strong class="font-semibold text-default">{{
					ts("marketing.commands.subtitle_highlight")
				}}</strong>
				{{ ts("marketing.commands.subtitle_tail") }}
			</p>
		</header>

		<section
			aria-labelledby="search-heading"
			class="mx-auto mb-4 flex max-w-[45rem] items-start gap-2.5"
		>
			<h2 id="search-heading" class="sr-only">
				{{ ts("marketing.commands.search_heading") }}
			</h2>
			<div
				class="flex h-13 min-w-0 flex-1 items-center gap-2.5 rounded-[12px] border border-base-content/17 bg-base-100 px-4.5 focus-within:border-primary focus-within:shadow-glow theme-dark:bg-base-content/8"
			>
				<UIcon
					name="i-heroicons-magnifying-glass"
					class="size-4.5 shrink-0 text-muted"
					aria-hidden="true"
				/>
				<input
					v-model="searchValue"
					type="search"
					class="commands-search min-w-0 flex-1 bg-transparent text-[0.9375rem] text-default outline-none placeholder:text-muted"
					:placeholder="ts('marketing.commands.search_placeholder')"
					:aria-label="ts('marketing.commands.search_label')"
					:aria-describedby="isSearching ? 'search-results-count' : undefined"
				/>
				<UButton
					v-if="searchValue"
					color="neutral"
					variant="link"
					size="sm"
					icon="i-heroicons-x-mark-20-solid"
					class="shrink-0 p-0.5"
					:aria-label="ts('marketing.commands.search_clear')"
					@click="searchValue = ''"
				/>
			</div>

			<UButton
				icon="i-heroicons-arrow-path"
				color="primary"
				variant="soft"
				size="lg"
				class="h-13 rounded-[12px] border border-primary/30 bg-primary/12 px-4 text-[0.9375rem] font-semibold hover:bg-primary/20 sm:px-5.5 theme-dark:text-highlighted"
				:loading
				:aria-label="ts('marketing.commands.refresh_label')"
				@click="refresh()"
			>
				<span class="hidden sm:inline">{{ ts("marketing.commands.refresh") }}</span>
			</UButton>
		</section>

		<p
			v-if="isSearching && !loading"
			id="search-results-count"
			class="mx-auto max-w-[45rem] text-center text-[0.8125rem] text-muted"
			role="status"
			aria-live="polite"
		>
			{{ tc("marketing.commands.results", filteredCommands.length) }}
		</p>

		<section
			aria-labelledby="categories-heading"
			class="mx-auto mt-8 flex max-w-[56.25rem] flex-col gap-2.5 rounded-[16px] border border-(--home-border-subtle) bg-base-content/4 p-4 sm:p-7"
		>
			<h2 id="categories-heading" class="sr-only">
				{{ ts("marketing.commands.categories_heading") }}
			</h2>

			<div
				v-if="loading"
				class="flex flex-col gap-2.5"
				role="status"
				:aria-label="ts('marketing.commands.loading')"
			>
				<USkeleton v-for="row in LOADING_ROWS" :key="row" class="h-14.5 rounded-[16px]" />
			</div>

			<div v-else-if="commands.length === 0" class="px-6 py-12 text-center" role="status">
				<p class="mb-1.5 text-base font-bold text-default">
					{{ ts("marketing.commands.unavailable_title") }}
				</p>
				<p class="mb-5 text-sm text-muted">
					{{ ts("marketing.commands.unavailable_description") }}
				</p>
				<UButton
					icon="i-heroicons-arrow-path"
					color="primary"
					variant="soft"
					@click="refresh()"
				>
					{{ ts("marketing.commands.try_again") }}
				</UButton>
			</div>

			<div v-else-if="groups.length === 0" class="px-6 py-12 text-center" role="status">
				<p class="mb-1.5 text-base font-bold text-default">
					{{ ts("marketing.commands.empty_title") }}
				</p>
				<p class="text-sm text-muted">
					{{ ts("marketing.commands.empty_description") }}
				</p>
			</div>

			<template v-else>
				<CommandCategory
					v-for="group in groups"
					:key="group.name"
					:name="group.name"
					:commands="group.commands"
					:open="isSearching || openCategory === group.name"
					@update:open="(open) => toggleCategory(group.name, open)"
				/>
			</template>
		</section>
	</UContainer>
</template>

<script lang="ts" setup>
import { useFuse } from "@vueuse/integrations/useFuse";

const LOADING_ROWS = 6;
const DEFAULT_CATEGORY = "General";
/** The category the redesign opens first, when the bot reports it. */
const INITIAL_CATEGORY = "Moderation";

const { ts, tc } = useI18n();

useSeoMetadata({
	description: "Browse all available WolfStar bot commands and their descriptions.",
	ogImage: {
		description: "Explore all bot commands",
		title: "WolfStar Commands",
	},
	shouldOgImage: true,
	title: "Commands",
});

const searchValue = ref("");
const { data: commands, status, refresh } = useCommands();

const loading = computed(() => status.value === "pending");
const isSearching = computed(() => searchValue.value.trim().length > 0);

const { results } = useFuse(searchValue, commands, {
	fuseOptions: {
		keys: ["name", "description", "category"],
		threshold: 0.3,
	},
	matchAllWhenSearchEmpty: true,
});

const filteredCommands = computed(() => results.value.map((result) => result.item));

const groups = computed(() => {
	const byCategory = new Map<string, FlattenedCommand[]>();
	for (const command of filteredCommands.value) {
		const category = command.category || DEFAULT_CATEGORY;
		const group = byCategory.get(category);
		if (group) {
			group.push(command);
		} else {
			byCategory.set(category, [command]);
		}
	}
	return Array.from(byCategory.entries(), ([name, categoryCommands]) => ({
		name,
		commands: categoryCommands,
	})).toSorted((a, b) => a.name.localeCompare(b.name));
});

// One category is open at a time; `undefined` means the visitor has not chosen yet.
const selectedCategory = ref<string | null>();
const openCategory = computed(() => {
	if (selectedCategory.value !== undefined) {
		return selectedCategory.value;
	}
	return groups.value.some((group) => group.name === INITIAL_CATEGORY) ? INITIAL_CATEGORY : null;
});

function toggleCategory(name: string, open: boolean) {
	// While searching every match is expanded, so a toggle has nothing to collapse.
	if (isSearching.value) {
		return;
	}
	selectedCategory.value = open ? name : null;
}
</script>

<style scoped>
/* The redesign's commands page is one flat surface, so the layout's top glow is
   switched off here. The element selector outranks the layout's scoped rule. */
:global(div.app-layout:has(.commands-page)::before) {
	display: none;
}

/* The field is one flat surface: its wrapper paints the background and border. Dev
   tooling ships an unlayered `input { background; padding }` rule that would otherwise
   win over the utility classes and draw a darker, padded box inside the wrapper. */
.commands-search {
	padding: 0;
	border: 0;
	background: transparent;
	box-shadow: none;
}

/* The field has its own clear button; hide the browser's. */
.commands-search::-webkit-search-cancel-button {
	appearance: none;
}
</style>
