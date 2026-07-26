<template>
	<nav aria-label="Breadcrumb">
		<ol class="flex flex-wrap items-center gap-2 text-sm">
			<li v-for="(item, index) in items" :key="index" class="flex items-center gap-2">
				<Icon
					v-if="item.icon"
					:name="item.icon"
					class="size-4 text-base-content/60"
					aria-hidden="true"
				/>
				<NuxtLink
					v-if="item.to && index < items.length - 1"
					:to="item.to"
					class="link text-base-content/60 link-hover"
				>
					{{ item.label }}
				</NuxtLink>
				<span v-else class="font-medium">{{ item.label }}</span>
				<span v-if="index < items.length - 1" class="text-base-content/60" aria-hidden="true">/</span>
			</li>
		</ol>
	</nav>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		items?: Array<{ label: string; to?: string; icon?: string }>;
	}>(),
	{
		items: () => [],
	},
);
</script>
