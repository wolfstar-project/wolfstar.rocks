<template>
	<img
		v-if="!failed"
		:src="twemojiUrl(emoji)"
		:alt="label"
		class="twemoji"
		draggable="false"
		loading="lazy"
		decoding="async"
		@error="failed = true"
	/>
	<span
		v-else
		class="twemoji twemoji-glyph"
		:role="label === '' ? undefined : 'img'"
		:aria-hidden="label === '' ? 'true' : undefined"
		:aria-label="label || undefined"
	>
		<span class="twemoji-char">{{ emoji }}</span>
	</span>
</template>

<script setup lang="ts">
/**
 * An emoji drawn as Twemoji, the picture Discord shows, not the one the system's
 * font has. Size it with a class (`size-6`). When the image cannot be loaded it
 * falls back to the character, drawn to the size of the same box.
 */
const { emoji, alt } = defineProps<{
	/** The character, with its skin tone and joiners: `👍🏽`. */
	emoji: string;
	/** What a screen reader reads; empty when the emoji sits in a button that has its own name. */
	alt?: string;
}>();

// An emoji with no text of its own is read as the character, image or not.
const label = computed(() => alt ?? emoji);

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

/* The character is drawn to the size of its box, so it fills what the image would. */
.twemoji-glyph {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	container-type: size;
}

.twemoji-char {
	font-size: 75cqmin;
	line-height: 1;
}
</style>
