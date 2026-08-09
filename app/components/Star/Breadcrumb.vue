<template>
	<nav aria-label="Breadcrumb">
		<ol class="gap-2 text-sm flex flex-wrap items-center">
			<li v-for="(item, index) in items" :key="index" class="gap-2 flex items-center">
				<Icon
					v-if="item.icon"
					:name="item.icon"
					class="size-4 text-muted"
					aria-hidden="true"
				/>
				<NuxtLink
					v-if="item.to && index < items.length - 1"
					:to="item.to"
					class="link text-muted link-hover"
				>
					{{ item.label }}
				</NuxtLink>
				<span v-else class="font-medium">{{ item.label }}</span>
				<span v-if="index < items.length - 1" class="text-muted" aria-hidden="true">/</span>
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
