<template>
	<span :class="classes">
		<Icon v-if="icon" :name="icon" class="size-3.5" aria-hidden="true" />
		<slot>{{ label }}</slot>
	</span>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import { badgeColorClass, type UiSize } from "~/utils/ui-classes";

const props = withDefaults(
	defineProps<{
		label?: string;
		icon?: string;
		color?: string;
		variant?: "solid" | "soft" | "subtle" | "outline" | "ghost" | string;
		size?: UiSize;
	}>(),
	{
		color: "primary",
		variant: "solid",
		size: "md",
	},
);

const classes = computed(() =>
	cn(
		"badge gap-1",
		badgeColorClass(props.color),
		(props.variant === "subtle" || props.variant === "soft") && "badge-soft",
		props.variant === "outline" && "badge-outline",
		props.variant === "ghost" && "badge-ghost",
		props.size === "xs" || props.size === "2xs" || props.size === "3xs"
			? "badge-xs"
			: props.size === "sm"
				? "badge-sm"
				: props.size === "lg" || props.size === "xl"
					? "badge-lg"
					: "",
	),
);
</script>
