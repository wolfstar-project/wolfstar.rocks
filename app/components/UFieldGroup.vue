<template>
	<div
		:class="
			cn(
				'join',
				orientation === 'vertical' && 'join-vertical',
				attrs.class as string | undefined,
			)
		"
		v-bind="restAttrs"
	>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineOptions({ inheritAttrs: false });

withDefaults(
	defineProps<{
		orientation?: "horizontal" | "vertical";
		size?: string;
	}>(),
	{
		orientation: "horizontal",
	},
);

const attrs = useAttrs();
const restAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});
</script>
