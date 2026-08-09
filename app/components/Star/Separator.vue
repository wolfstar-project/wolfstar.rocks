<template>
	<div
		v-if="orientation === 'vertical'"
		role="separator"
		class="divider divider-vertical"
		:class="attrs.class"
	>
		<slot />
	</div>
	<hr v-else class="divider" :class="attrs.class" />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(
	defineProps<{
		orientation?: "horizontal" | "vertical";
	}>(),
	{
		orientation: "horizontal",
	},
);

const attrs = useAttrs();
</script>
