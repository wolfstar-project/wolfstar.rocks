<template>
	<img v-if="custom" :src="custom.url" :alt="custom.name" class="size-5" />
	<span v-else-if="icon" class="leading-none">{{ icon }}</span>
	<UIcon v-else name="ic:round-description" class="size-5" aria-hidden="true" />
</template>

<script setup lang="ts">
/** The icon of a form: a custom emoji as its image, a Unicode one as it is, or a stand-in. */
const { icon } = defineProps<{
	icon: string | null;
}>();

// A custom emoji is written `<:name:id>` (`<a:name:id>` when animated) and
// served by Discord's CDN by its ID.
const custom = computed(() => {
	const match = icon?.match(/^<(a?):(\w{2,32}):(\d{17,20})>$/u);
	if (!match) return null;
	const [, animated, name, id] = match;
	return {
		name: name!,
		url: `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "webp"}?size=32`,
	};
});
</script>
