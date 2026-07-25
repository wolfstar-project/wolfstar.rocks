<template>
	<footer :class="cn('footer footer-center p-4', ui?.root)" v-bind="$attrs">
		<div v-if="$slots.top" :class="cn('w-full', ui?.top)">
			<slot name="top" />
		</div>
		<div class="flex w-full flex-wrap items-center justify-between gap-4 px-4">
			<div>
				<slot name="left" />
			</div>
			<div>
				<slot />
			</div>
			<div class="flex items-center gap-2">
				<slot name="right" />
			</div>
		</div>
		<div v-if="$slots.bottom" class="w-full">
			<slot name="bottom" />
		</div>
	</footer>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	ui?: Record<string, string>;
}>();
</script>
