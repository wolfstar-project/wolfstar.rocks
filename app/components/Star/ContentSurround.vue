<template>
	<nav v-if="prev || next" class="mt-8 gap-4 sm:grid-cols-2 grid" aria-label="Surrounding pages">
		<NuxtLink
			v-if="prev"
			:to="prev.path ?? prev.to"
			class="card border-base-200 bg-base-200/40 p-4 hover:bg-base-200 border transition-colors"
		>
			<p class="text-xs text-muted">Previous</p>
			<p class="font-medium">{{ prev.title }}</p>
		</NuxtLink>
		<NuxtLink
			v-if="next"
			:to="next.path ?? next.to"
			class="card border-base-200 bg-base-200/40 p-4 hover:bg-base-200 sm:col-start-2 border text-end transition-colors"
		>
			<p class="text-xs text-muted">Next</p>
			<p class="font-medium">{{ next.title }}</p>
		</NuxtLink>
	</nav>
</template>

<script setup lang="ts">
interface SurroundItem {
	title?: string;
	path?: string;
	to?: string;
}

const props = defineProps<{
	surround?: SurroundItem[] | null;
}>();

const prev = computed(() => {
	const items = props.surround;
	return items?.[0] ?? null;
});

const next = computed(() => {
	const items = props.surround;
	return items?.[1] ?? null;
});
</script>
