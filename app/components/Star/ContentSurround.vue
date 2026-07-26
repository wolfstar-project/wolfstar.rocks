<template>
	<nav v-if="prev || next" class="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Surrounding pages">
		<NuxtLink
			v-if="prev"
			:to="prev.path ?? prev.to"
			class="card border border-base-200 bg-base-200/40 p-4 transition-colors hover:bg-base-200"
		>
			<p class="text-xs text-base-content/60">Previous</p>
			<p class="font-medium">{{ prev.title }}</p>
		</NuxtLink>
		<NuxtLink
			v-if="next"
			:to="next.path ?? next.to"
			class="card border border-base-200 bg-base-200/40 p-4 text-end transition-colors hover:bg-base-200 sm:col-start-2"
		>
			<p class="text-xs text-base-content/60">Next</p>
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
