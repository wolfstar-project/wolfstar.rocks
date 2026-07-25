<template>
	<article class="space-y-4 border-b border-base-200 pb-10 last:border-b-0">
		<header class="space-y-2">
			<div class="flex flex-wrap items-center gap-3">
				<h2 v-if="title" class="text-2xl font-bold">{{ title }}</h2>
				<span v-if="date" class="text-sm text-muted">{{ date }}</span>
			</div>
			<div v-if="authors?.length" class="flex flex-wrap gap-2">
				<slot name="authors">
					<UUser
						v-for="(author, index) in authors"
						:key="index"
						v-bind="author"
						size="sm"
					/>
				</slot>
			</div>
			<figure v-if="image?.src" class="overflow-hidden rounded-lg">
				<img :src="image.src" :alt="image.alt ?? title" class="w-full object-cover" />
			</figure>
			<p v-if="description" class="text-muted">{{ description }}</p>
		</header>
		<div class="prose max-w-none dark:prose-invert">
			<slot name="body">
				<slot />
			</slot>
		</div>
	</article>
</template>

<script setup lang="ts">
defineProps<{
	title?: string;
	description?: string;
	date?: string;
	image?: { src?: string; alt?: string };
	authors?: Array<Record<string, unknown>>;
}>();
</script>
