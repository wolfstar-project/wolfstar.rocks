<template>
	<Section labelled-by="home-stats-heading" spacing="none" class="pb-22">
		<h2 id="home-stats-heading" class="sr-only">WolfStar at a glance</h2>
		<dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			<SurfaceCard v-for="stat of stats" :key="stat.label" tag="div" :accent="stat.accent">
				<dd class="font-mono text-[1.875rem] leading-none font-bold text-base-content">
					{{ stat.value }}
				</dd>
				<dt
					class="mt-1.5 text-xs font-bold tracking-[var(--home-ls-label)] text-muted uppercase"
				>
					{{ stat.label }}
				</dt>
			</SurfaceCard>
		</dl>
	</Section>
</template>

<script setup lang="ts">
const { stats } = defineProps<{
	stats: HomeStat[];
}>();
</script>
