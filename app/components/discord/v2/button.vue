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
	--discord-v2-button-primary: hsla(235, 85.6%, 64.7%, 1);
	--discord-v2-button-secondary: hsla(223, 6.7%, 20.6%, 1);
	--discord-v2-button-success: hsla(139, 47.3%, 33.9%, 1);
	--discord-v2-button-danger: hsla(359, 82.6%, 59.4%, 1);
	--discord-v2-button-link: hsla(235, 85.6%, 64.7%, 1);
	--discord-v2-button-text: hsla(0, 0%, 100%, 1);

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
