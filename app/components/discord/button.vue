<template>
	<!--
		Showcase chrome, never operable: a `span` hidden from assistive technology. `disabled`
		(the default) only switches the hover off; newt/ui's own disabled state would dim it.
	-->
	<Button
		as="span"
		aria-hidden="true"
		:variant
		:emoji="emojiIsImage ? emoji : undefined"
		:emoji-alt="emojiName"
		:launch-icon="variant === 'link' || Boolean(url)"
		:class="['discord-button h-8 min-w-15', { 'pointer-events-none': disabled }]"
	>
		<UIcon
			v-if="!emojiIsImage && icon"
			:name="icon"
			class="me-2 size-[1.375em] shrink-0 align-bottom"
		/><slot>{{ label }}</slot>
	</Button>
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
import { Button } from "~/components/ui/button";

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
