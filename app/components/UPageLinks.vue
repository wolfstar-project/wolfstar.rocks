<template>
	<nav :aria-label="ariaLabel" class="space-y-2">
		<p v-if="title" class="text-sm font-semibold">{{ title }}</p>
		<ul class="space-y-1">
			<li v-for="(link, index) in links" :key="index">
				<NuxtLink
					:to="link.to ?? link.href"
					:target="link.target"
					class="link text-sm text-muted link-hover"
				>
					<Icon v-if="link.icon" :name="link.icon" class="me-1 inline size-3.5" />
					{{ link.label }}
				</NuxtLink>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		title?: string;
		links?: Array<{
			label: string;
			to?: string;
			href?: string;
			target?: string;
			icon?: string;
		}>;
		ariaLabel?: string;
	}>(),
	{
		links: () => [],
		ariaLabel: "Page links",
	},
);
</script>
