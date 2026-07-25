<template>
	<div :class="cn('container', attrs.class as string | undefined)" v-bind="restAttrs">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const restAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});
</script>
