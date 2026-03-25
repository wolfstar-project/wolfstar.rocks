<template>
	<UContainer class="mx-auto max-w-7xl space-y-12 px-4 py-8">
		<header class="mt-8 flex animate-fade-in-up flex-col items-center space-y-6 text-center">
			<h1 class="text-4xl font-bold tracking-tight text-base-content/90 md:text-5xl">
				WolfStar Commands
			</h1>
			<p class="max-w-2xl text-lg text-base-content/70">
				Browse and search through all available bot commands.
				<span class="font-semibold">Powerful moderation</span> at your fingertips.
			</p>
		</header>

		<div class="space-y-8">
			<!-- Search bar -->
			<section
				aria-labelledby="search-heading"
				class="mx-auto flex max-w-3xl flex-col items-stretch gap-4 sm:flex-row sm:items-center"
			>
				<h2 id="search-heading" class="sr-only">Search Commands</h2>
				<UInput
					v-model="searchValue"
					placeholder="Search commands..."
					icon="i-heroicons-magnifying-glass"
					size="xl"
					class="flex-1"
					aria-label="Search for commands by name or description"
					:aria-describedby="searchValue ? 'search-results-count' : undefined"
				>
					<template v-if="searchValue" #trailing>
						<UButton
							color="neutral"
							variant="link"
							icon="i-heroicons-x-mark-20-solid"
							:padded="false"
							aria-label="Clear search"
							@click="searchValue = ''"
						/>
					</template>
				</UInput>

				<!-- Refresh button -->
				<UButton
					icon="i-heroicons-arrow-path"
					color="primary"
					variant="soft"
					size="xl"
					class="self-start sm:self-auto"
					:loading="status === 'pending'"
					aria-label="Refresh commands list"
					@click="refresh()"
				>
					<span class="hidden sm:inline">Refresh</span>
				</UButton>
			</section>

			<!-- Results count for screen readers -->
			<div
				v-if="searchValue && !loading"
				id="search-results-count"
				class="sr-only"
				role="status"
				aria-live="polite"
			>
				{{ filteredCommandsCount }} command{{ filteredCommandsCount !== 1 ? "s" : "" }}
				found
			</div>

			<!-- Loading state -->
			<div v-if="loading" class="space-y-4" role="status" aria-label="Loading commands">
				<div class="rounded-2xl border border-base-content/10 py-20 text-center">
					<UIcon
						name="i-heroicons-arrow-path"
						class="mx-auto mb-6 h-10 w-10 animate-spin text-base-content/40"
					/>
					<p class="mb-2 text-lg font-semibold text-base-content/80">
						Loading commands...
					</p>
					<p class="text-sm text-base-content/50">This may take a moment</p>
				</div>
			</div>

			<!-- No results message -->
			<div
				v-else-if="commands.length === 0"
				class="space-y-6 rounded-2xl border border-base-content/10 py-20 text-center"
				role="status"
			>
				<UIcon
					name="i-heroicons-exclamation-circle"
					class="mx-auto h-12 w-12 text-base-content/30"
				/>
				<div>
					<h2 class="mb-3 text-2xl font-bold">No commands available</h2>
					<p class="mx-auto max-w-md text-base-content/70">
						Couldn't load commands right now. Try refreshing.
					</p>
				</div>
				<UButton
					icon="i-heroicons-arrow-path"
					color="primary"
					variant="outline"
					size="lg"
					@click="refresh()"
				>
					Try Again
				</UButton>
			</div>

			<!-- Categories -->
			<section
				v-else
				aria-labelledby="categories-heading"
				class="rounded-2xl border border-base-content/10 bg-base-200/80 p-6 sm:p-8"
			>
				<h2 id="categories-heading" class="sr-only">Command Categories</h2>
				<LazyCommandCategory
					:commands="filteredCommands"
					:search-value
					:categories
					:loading
				/>
			</section>
		</div>
	</UContainer>
</template>

<script lang="ts" setup>
import { useFuse } from "@vueuse/integrations/useFuse";

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


const { results } = useFuse(searchValue, commands, {
	fuseOptions: {
		keys: ["name", "description", "category"],
		threshold: 0.3,
	},
	matchAllWhenSearchEmpty: true,
});


const filteredCommands = computed(() => results.value.map((result) => result.item));


const categories = computed(() => {
	const uniqueCategories = new Set<string>();
	for (const command of commands.value) {
		uniqueCategories.add(command.category || "General");
	}
	return [...uniqueCategories].toSorted();
});


const filteredCommandsCount = computed(() => results.value.length);
</script>
