<template>
	<!-- Links, not tabs: a category is an address (`/updates?category=release`) that can be shared and that opens without JavaScript. -->
	<nav :aria-label="ts('blog.filter_label')" class="min-w-0">
		<ul class="no-scrollbar -mb-px flex overflow-x-auto">
			<li v-for="link in links" :key="link.value" class="shrink-0">
				<NuxtLink
					:to="link.to"
					replace
					:aria-current="link.value === active ? 'true' : undefined"
					class="inline-flex min-h-11 items-center border-b px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
					:class="
						link.value === active
							? 'border-inverted text-highlighted'
							: 'border-transparent text-muted hover:text-default'
					"
				>
					{{ link.label }}
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

export interface BlogCategoryLink {
	label: string;
	to: RouteLocationRaw;
	/** The category's slug, or the value that stands for every post. */
	value: string;
}

defineProps<{
	links: BlogCategoryLink[];
	/** The `value` of the link whose posts are listed. */
	active: string;
}>();

const { ts } = useI18n();
</script>
