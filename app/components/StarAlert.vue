<template>
	<div
		role="alert"
		:class="
			cn(
				'alert',
				alertColorClass(color),
				(variant === 'soft' || variant === 'subtle') && 'alert-soft',
			)
		"
	>
		<Icon v-if="icon" :name="icon" class="size-5 shrink-0" aria-hidden="true" />
		<div class="min-w-0 flex-1">
			<div v-if="title || $slots.title" class="font-semibold">
				<slot name="title">{{ title }}</slot>
			</div>
			<div v-if="description || $slots.description" class="text-sm opacity-90">
				<slot name="description">{{ description }}</slot>
			</div>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import { alertColorClass } from "~/utils/ui-classes";

withDefaults(
	defineProps<{
		title?: string;
		description?: string;
		icon?: string;
		color?: string;
		variant?: "solid" | "soft" | "outline" | "subtle";
	}>(),
	{
		color: "info",
		variant: "solid",
	},
);
</script>
