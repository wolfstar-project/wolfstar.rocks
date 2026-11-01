<template>
	<div class="discord-v2-media-gallery">
		<img
			v-for="item of items"
			:key="item.src"
			class="discord-v2-media-gallery-item"
			:src="item.src"
			:alt="item.alt ?? ''"
			:width="item.width"
			:height="item.height"
			loading="lazy"
		/>
	</div>
</template>

<script setup lang="ts">
export interface MediaGalleryItem {
	src: string;
	alt?: string;
	width: number;
	height: number;
}

const { items } = defineProps<{ items: readonly MediaGalleryItem[] }>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
/* Discord's media gallery: one item fills the width, with 8px corners. */
.discord-v2-media-gallery {
	@apply grid gap-1 overflow-hidden rounded-lg;
}

.discord-v2-media-gallery-item {
	@apply h-auto w-full object-cover;
}
</style>
