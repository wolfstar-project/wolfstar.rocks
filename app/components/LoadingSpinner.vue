<template>
	<div
		class="flex items-center justify-center"
		:class="padding"
		role="status"
		:aria-label="label"
	>
		<UIcon
			name="heroicons:arrow-path"
			class="animate-spin text-primary"
			:class="iconSizeClass"
			aria-hidden="true"
		/>
	</div>
</template>

<script setup lang="ts">
const {
	size = "md",
	padding = "py-8",
	label = "Loading...",
} = defineProps<{
	size?: "sm" | "md" | "lg";
	padding?: string;
	label?: string;
}>();

const iconSizeClass = computed(() => {
	switch (size) {
		case "sm":
			return "size-4";
		case "lg":
			return "size-8";
		default:
			return "size-5";
	}
});
</script>
