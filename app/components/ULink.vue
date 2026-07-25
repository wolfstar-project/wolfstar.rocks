<template>
	<NuxtLink
		:to="to ?? href"
		:target="target"
		:class="cn('link link-hover', color && isSemanticColor(color) ? `link-${color}` : '', attrs.class as string | undefined)"
		v-bind="restAttrs"
	>
		<slot>{{ label }}</slot>
	</NuxtLink>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import { isSemanticColor } from "~/utils/ui-classes";

defineOptions({ inheritAttrs: false });

defineProps<{
	to?: string;
	href?: string;
	target?: string;
	label?: string;
	color?: string;
}>();

const attrs = useAttrs();
const restAttrs = computed(() => {
	const { class: _class, ...rest } = attrs;
	return rest;
});
</script>
