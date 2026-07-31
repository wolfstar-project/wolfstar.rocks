<template>
	<nav :aria-label="ariaLabel" class="top-24 space-y-4 sticky">
		<p v-if="title" class="text-sm font-semibold">{{ title }}</p>
		<ul class="space-y-1 border-base-200 ps-3 text-sm border-s">
			<li v-for="(link, index) in flatLinks" :key="index">
				<a
					:href="`#${link.id}`"
					class="link py-0.5 text-muted link-hover block"
					:class="{ 'font-medium text-primary': highlight }"
				>
					{{ link.text }}
				</a>
				<ul
					v-if="link.children?.length"
					class="ms-3 space-y-1 border-base-200 ps-3 border-s"
				>
					<li v-for="(child, childIndex) in link.children" :key="childIndex">
						<a :href="`#${child.id}`" class="link py-0.5 text-muted link-hover block">
							{{ child.text }}
						</a>
					</li>
				</ul>
			</li>
		</ul>
		<div v-if="$slots.bottom">
			<slot name="bottom" />
		</div>
	</nav>
</template>

<script setup lang="ts">
interface TocLink {
	id: string;
	text: string;
	depth?: number;
	children?: TocLink[];
}

const props = withDefaults(
	defineProps<{
		links?: TocLink[];
		title?: string;
		highlight?: boolean;
		ariaLabel?: string;
	}>(),
	{
		links: () => [],
		ariaLabel: "Table of contents",
	},
);

const flatLinks = computed(() => props.links ?? []);
</script>
