<template>
	<article class="space-y-4 border-base-200 pb-10 border-b last:border-b-0">
		<header class="space-y-2">
			<div class="gap-3 flex flex-wrap items-center">
				<h2 v-if="title" class="text-2xl font-bold">{{ title }}</h2>
				<span v-if="date" class="text-sm text-muted">{{ date }}</span>
			</div>
			<div v-if="authors?.length" class="gap-2 flex flex-wrap">
				<slot name="authors">
					<StarUser
						v-for="(author, index) in authors"
						:key="index"
						v-bind="author"
						size="sm"
					/>
				</slot>
			</div>
			<figure v-if="image?.src" class="rounded-lg overflow-hidden">
				<img :src="image.src" :alt="image.alt ?? title" class="w-full object-cover" />
			</figure>
			<p v-if="description" class="text-muted">{{ description }}</p>
		</header>
		<div class="prose dark:prose-invert max-w-none">
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
