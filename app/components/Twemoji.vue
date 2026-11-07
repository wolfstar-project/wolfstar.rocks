<template>
	<img
		v-if="!failed"
		:src="twemojiUrl(emoji)"
		:alt="alt ?? emoji"
		class="twemoji"
		draggable="false"
		loading="lazy"
		decoding="async"
		@error="failed = true"
	/>
	<span
		v-else
		class="twemoji twemoji-glyph"
		:aria-hidden="alt === '' ? 'true' : undefined"
		:aria-label="alt || undefined"
	>
		{{ emoji }}
	</span>
</template>

<script setup lang="ts">
import { twemojiUrl } from "~/utils/twemoji";

/**
 * An emoji drawn as Twemoji, the picture Discord shows, not the one the system's
 * font has. Size it with a class (`size-6`). When the image cannot be loaded it
 * falls back to the character, which then takes the font size of its parent.
 */
const { emoji, alt } = defineProps<{
	/** The character, with its skin tone and joiners: `👍🏽`. */
	emoji: string;
	/** What a screen reader reads; empty when the emoji sits in a button that has its own name. */
	alt?: string;
}>();

const failed = ref(false);

watch(
	() => emoji,
	() => {
		failed.value = false;
	},
);
</script>

<style scoped>
.twemoji {
	display: inline-block;
	flex: none;
	object-fit: contain;
	vertical-align: middle;
}

.twemoji-glyph {
	text-align: center;
	line-height: 1;
}
</style>
