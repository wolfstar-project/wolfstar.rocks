<template>
	<div
		:class="
			cn('home-section-header', align === 'center' ? 'text-center' : 'text-left', className)
		"
	>
		<p v-if="eyebrow" class="mb-3 text-xs font-bold tracking-wider text-primary uppercase">
			{{ eyebrow }}
		</p>
		<h2
			:id="headingId"
			class="text-4xl leading-[1.1] font-bold tracking-[-0.02em] text-base-content"
		>
			{{ title }}
		</h2>
		<p
			v-if="description"
			:class="
				cn(
					'mt-4 text-lg leading-[1.2] text-base-content/70',
					align === 'center' ? 'mx-auto max-w-140' : 'max-w-prose',
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
