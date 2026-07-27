<template>
	<div
		class="discord-button"
		:class="[
			`discord-button-${variant}`,
			{
				'discord-button-disabled': disabled,
				'discord-button-hoverable': !disabled,
			},
		]"
		aria-hidden="true"
	>
		<img
			v-if="emojiIsImage"
			:src="emoji"
			:alt="emojiName"
			draggable="false"
			class="discord-button-emoji"
		/>
		<UIcon v-else-if="icon" :name="icon" class="discord-button-emoji size-[1.375em] shrink-0" />
		<span class="truncate"
			><slot>{{ label }}</slot></span
		>
		<svg
			v-if="variant === 'link' || url"
			class="discord-button-launch"
			aria-hidden="true"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill="currentColor"
				d="M10 5a1 1 0 0 0 0 2h6.59L4.3 19.3a1 1 0 1 0 1.4 1.4L18 8.42V15a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1h-9Z"
			/>
		</svg>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "link";

interface ButtonProps {
	label?: string;
	variant?: ButtonVariant;
	icon?: string;
	emoji?: string;
	emojiName?: string;
	url?: string;
	disabled?: boolean;
}

interface ButtonSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
const {
	variant = "secondary",
	disabled = true,
	emoji,
	emojiName = "emoji",
} = defineProps<ButtonProps>();

defineSlots<ButtonSlots>();

const emojiIsImage = computed(() => {
	return Boolean(
		emoji && (emoji.includes("http") || emoji.startsWith("/") || emoji.startsWith("./")),
	);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Sizing/typography mirror Skyra discord-button; colors use oklch Discord brand tokens. */
.discord-button {
	--discord-button-primary: oklch(57.7% 0.209 273.88);
	--discord-button-primary-hover: oklch(49.62% 0.176 274.09);
	--discord-button-secondary: oklch(40% 0.01 260);
	--discord-button-secondary-hover: oklch(46% 0.01 260);
	--discord-button-success: oklch(58% 0.14 150);
	--discord-button-success-hover: oklch(50% 0.12 150);
	--discord-button-danger: oklch(63.17% 0.208 24.62);
	--discord-button-danger-hover: oklch(54% 0.18 24);
	--discord-button-link: oklch(57.7% 0.209 273.88);
	--discord-button-text: oklch(100% 0 0);

	@apply box-border flex h-8 min-h-8 w-fit min-w-[60px] items-center justify-center gap-1 rounded-sm px-4 py-0.5 text-sm leading-4 font-medium;
	font-family:
		Whitney, "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
	color: var(--discord-button-text);
	margin: 4px 8px 4px 0;
	transition:
		background-color 0.17s ease,
		color 0.17s ease;
	text-decoration: none;
}

.discord-button-primary {
	background-color: var(--discord-button-primary);
}

.discord-button-primary.discord-button-hoverable:hover {
	background-color: var(--discord-button-primary-hover);
}

.discord-button-secondary {
	background-color: var(--discord-button-secondary);
}

.discord-button-secondary.discord-button-hoverable:hover {
	background-color: var(--discord-button-secondary-hover);
}

.discord-button-success {
	background-color: var(--discord-button-success);
}

.discord-button-success.discord-button-hoverable:hover {
	background-color: var(--discord-button-success-hover);
}

.discord-button-danger {
	background-color: var(--discord-button-danger);
}

.discord-button-danger.discord-button-hoverable:hover {
	background-color: var(--discord-button-danger-hover);
}

.discord-button-link {
	background-color: transparent;
	color: var(--discord-button-link);
	text-decoration: underline;
	text-underline-offset: 2px;
	min-width: unset;
	padding-inline: 0;
	margin-inline: 0;
}

.discord-button-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-button-emoji {
	@apply mr-1 shrink-0 object-contain align-bottom;
	width: 1.375em;
	height: 1.375em;
}

.discord-button-launch {
	@apply ml-2 shrink-0;
}

@media (prefers-reduced-motion: reduce) {
	.discord-button {
		transition: none;
	}
}
</style>
