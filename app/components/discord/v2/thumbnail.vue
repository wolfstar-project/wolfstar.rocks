<template>
	<img class="discord-v2-thumbnail" :src :alt width="85" height="85" loading="lazy" />
</template>

<script setup lang="ts">
const { src, alt = "" } = defineProps<{
	src: string;
	/** The thumbnail's description; empty when the text beside it already says it. */
	alt?: string;
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
/* Discord draws a section's thumbnail 85px square, cropped, with 8px corners. */
.discord-v2-thumbnail {
	@apply size-[85px] rounded-lg object-cover;
}
</style>
