<template>
	<img v-if="custom" :src="custom.url" :alt="custom.name" class="size-5" />
	<Twemoji v-else-if="icon" :emoji="icon" class="size-[1.25em]" />
	<UIcon v-else name="ic:round-description" class="size-5" aria-hidden="true" />
</template>

<script setup lang="ts">
import { parseServerEmojiToken } from "~/utils/emoji-picker";

/** The icon of a form: a custom emoji as its image, a Unicode one as Twemoji, or a stand-in. */
const { icon } = defineProps<{
	icon: string | null;
}>();

// A custom emoji is written `<:name:id>` (`<a:name:id>` when animated) and
// served by Discord's CDN by its ID.
const custom = computed(() => {
	const emoji = parseServerEmojiToken(icon);
	if (!emoji) return null;
	return {
		name: emoji.name,
		url: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}?size=32`,
	};
});
</script>
