<template>
	<UContainer class="mx-auto max-w-7xl space-y-12 px-4 py-8">
		<header class="mt-8 flex flex-col items-center space-y-6 text-center">
			<h1 class="text-4xl font-bold tracking-tight text-default/90 md:text-5xl">
				WolfStar Commands
			</h1>
			<p class="max-w-2xl text-lg text-toned">
				Browse and search through all available bot commands.
				<span class="font-semibold">Powerful moderation</span> at your fingertips.
			</p>
		</header>

		<div class="space-y-8">
			<!-- Search bar -->
			<section aria-labelledby="search-heading" class="mx-auto w-full max-w-3xl">
				<h2 id="search-heading" class="sr-only">Search Commands</h2>
				<UFieldGroup size="xl" class="w-full">
					<UInput
						v-model="searchValue"
						placeholder="Search commands..."
						icon="i-heroicons-magnifying-glass"
						class="min-w-0 flex-1"
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

					<UButton
						icon="i-heroicons-arrow-path"
						color="primary"
						variant="soft"
						:loading="status === 'pending'"
						aria-label="Refresh commands list"
						@click="refresh()"
					>
						<span class="hidden sm:inline">Refresh</span>
					</UButton>
				</UFieldGroup>
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
				<div class="rounded-xl border border-default/10 py-20 text-center">
					<UIcon
						name="i-heroicons-arrow-path"
						class="mx-auto mb-6 h-10 w-10 animate-spin text-dimmed"
					/>
					<p class="mb-2 text-lg font-semibold text-toned">Loading commands...</p>
					<p class="text-sm text-default/50">This may take a moment</p>
				</div>
			</div>

			<!-- No results message -->
			<div
				v-else-if="commands.length === 0"
				class="space-y-6 rounded-xl border border-default/10 py-20 text-center"
				role="status"
			>
				<UIcon
					name="i-heroicons-exclamation-circle"
					class="mx-auto h-12 w-12 text-muted/40"
				/>
				<div>
					<h2 class="mb-3 text-2xl font-bold">No commands available</h2>
					<p class="mx-auto max-w-md text-toned">
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
				class="rounded-xl border border-default/10 bg-muted/80 p-6 sm:p-8"
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
