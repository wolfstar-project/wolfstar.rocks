<template>
	<div
		class="discord-v2-button"
		:class="[`discord-v2-button-${variant}`, { 'discord-v2-button-disabled': disabled }]"
		aria-hidden="true"
	>
		<UIcon v-if="icon" :name="icon" class="size-4 shrink-0" />
		<span class="truncate">{{ label }}</span>
	</div>
</template>

<script lang="ts">
type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "link";

interface ButtonProps {
	label: string;
	variant?: ButtonVariant;
	icon?: string;
	disabled?: boolean;
}
</script>

<script setup lang="ts">
const { variant = "secondary", disabled = true } = defineProps<ButtonProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-v2-button {
	--discord-v2-button-primary: oklch(57.7% 0.209 273.88);
	--discord-v2-button-secondary: oklch(32.11% 0.0094 268.56);
	--discord-v2-button-success: oklch(53.33% 0.117 150.74);
	--discord-v2-button-danger: oklch(63.17% 0.208 24.62);
	--discord-v2-button-link: oklch(57.7% 0.209 273.88);
	--discord-v2-button-text: oklch(100% 0 0);

	@apply flex w-fit items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium;
	color: var(--discord-v2-button-text);
}

.discord-v2-button-primary {
	background-color: var(--discord-v2-button-primary);
}

.discord-v2-button-secondary {
	background-color: var(--discord-v2-button-secondary);
}

.discord-v2-button-success {
	background-color: var(--discord-v2-button-success);
}

.discord-v2-button-danger {
	background-color: var(--discord-v2-button-danger);
}

.discord-v2-button-link {
	background-color: transparent;
	color: var(--discord-v2-button-link);
	text-decoration: underline;
	text-underline-offset: 2px;
}

.discord-v2-button-disabled {
	@apply cursor-default opacity-100;
}
</style>
