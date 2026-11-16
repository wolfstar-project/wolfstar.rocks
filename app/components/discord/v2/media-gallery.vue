<template>
	<MediaGallery :count="items.length">
		<!-- One item keeps its own ratio; a mosaic crops each one to its cell. -->
		<MediaGalleryImage
			v-for="item of items"
			:key="item.src"
			:as="NuxtImg"
			:src="item.src"
			:alt="item.alt"
			:width="item.width"
			:height="item.height"
			:class="items.length === 1 ? 'h-auto' : undefined"
			loading="lazy"
		/>
	</MediaGallery>
</template>

<script setup lang="ts">
import { MediaGallery, MediaGalleryItem as MediaGalleryImage } from "~/components/ui/media-gallery";

// The `as` prop takes a component, and `#components` types NuxtImg as a generic one.
const NuxtImg = resolveComponent("NuxtImg");

export interface MediaGalleryItem {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
}

const { items } = defineProps<{ items: readonly MediaGalleryItem[] }>();
</script>
