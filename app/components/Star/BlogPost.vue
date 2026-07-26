<template>
	<NuxtLink
		:to="to"
		:class="
			cn(
				'card overflow-hidden transition-shadow hover:shadow-md',
				variant === 'outline' ? 'border border-base-300 bg-transparent' : 'bg-base-200',
				orientation === 'horizontal' ? 'md:card-side' : '',
			)
		"
	>
		<figure v-if="image?.src" :class="orientation === 'horizontal' ? 'md:max-w-sm' : ''">
			<img
				:src="image.src"
				:alt="image.alt ?? title"
				:width="image.width"
				:height="image.height"
				class="h-full w-full object-cover"
			/>
		</figure>
		<div class="card-body">
			<div v-if="badge" class="mb-1">
				<StarBadge v-bind="badge" size="sm" />
			</div>
			<h2 class="card-title text-lg">{{ title }}</h2>
			<p v-if="description" class="text-sm text-base-content/60">{{ description }}</p>
			<div class="mt-auto flex flex-wrap items-center gap-3 pt-2 text-sm text-base-content/60">
				<span v-if="date">{{ date }}</span>
				<div v-if="authors?.length" class="flex flex-wrap gap-2">
					<StarUser
						v-for="(author, index) in authors"
						:key="index"
						v-bind="author"
						size="xs"
					/>
				</div>
			</div>
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	to?: string;
	title?: string;
	description?: string;
	image?: { src?: string; alt?: string; width?: number; height?: number };
	date?: string;
	authors?: Array<Record<string, unknown>>;
	badge?: { label?: string; color?: string; variant?: string };
	variant?: "outline" | "subtle" | "soft" | "solid";
	orientation?: "vertical" | "horizontal";
}>();
</script>
