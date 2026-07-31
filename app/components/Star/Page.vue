<template>
	<div :class="cn('gap-8 grid', ui?.root ?? 'lg:grid-cols-12')">
		<div :class="ui?.center ?? 'lg:col-span-9'">
			<slot />
		</div>
		<aside v-if="$slots.right" :class="ui?.right ?? 'lg:col-span-3'">
			<slot name="right" />
		</aside>
		<aside v-if="$slots.left" :class="ui?.left">
			<slot name="left" />
		</aside>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	ui?: Record<string, string>;
}>();
</script>
