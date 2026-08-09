<template>
	<div
		:class="
			cn('home-section-header', align === 'center' ? 'text-center' : 'text-left', className)
		"
	>
		<p
			v-if="eyebrow"
			class="home-section-eyebrow mb-3 text-xs font-bold tracking-home-ls-label text-primary uppercase"
		>
			{{ eyebrow }}
		</p>
		<h2
			:id="headingId"
			class="text-4xl font-bold tracking-home-ls-tight text-base-content leading-[1.1]"
		>
			{{ title }}
		</h2>
		<p
			v-if="description"
			:class="
				cn(
					'mt-3 leading-relaxed text-base-content/80 text-[15px]',
					align === 'center' ? 'max-w-140 mx-auto' : 'max-w-prose',
				)
			"
		>
			{{ description }}
		</p>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const {
	align = "center",
	class: className,
	description,
	eyebrow,
	headingId,
	title,
} = defineProps<{
	align?: "center" | "start";
	class?: string;
	description?: string;
	eyebrow?: string;
	headingId?: string;
	title: string;
}>();
</script>
