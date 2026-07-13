<template>
	<li
		:id="optionId"
		class="discord-v2-string-select-menu-option"
		:class="{
			'discord-v2-string-select-menu-option-active': active,
			'discord-v2-string-select-menu-option-disabled': option.disabled,
		}"
		role="option"
		:aria-selected="selected"
		:aria-disabled="option.disabled || undefined"
		@click="emit('select')"
		@mouseenter="emit('activate')"
	>
		<img
			v-if="emojiIsImage"
			:src="option.emoji"
			:alt="option.emojiName ?? ''"
			class="discord-v2-string-select-menu-option-emoji"
		/>
		<span
			v-else-if="option.emoji"
			class="discord-v2-string-select-menu-option-emoji"
			aria-hidden="true"
			>{{ option.emoji }}</span
		>
		<span class="discord-v2-string-select-menu-option-content">
			<span class="discord-v2-string-select-menu-option-label">{{ option.label }}</span>
			<span
				v-if="option.description"
				class="discord-v2-string-select-menu-option-description"
				>{{ option.description }}</span
			>
		</span>
		<UIcon
			v-if="selected"
			name="ph:check-bold"
			class="discord-v2-string-select-menu-option-check size-4 shrink-0"
			aria-hidden="true"
		/>
	</li>
</template>

<script lang="ts">
import type { StringSelectMenuOption } from "~/types/discord";

interface StringSelectMenuOptionProps {
	option: StringSelectMenuOption;
	optionId: string;
	active?: boolean;
	selected?: boolean;
}

interface StringSelectMenuOptionEmits {
	select: [];
	activate: [];
}
</script>

<script setup lang="ts">
const { option, active = false, selected = false } = defineProps<StringSelectMenuOptionProps>();

const emit = defineEmits<StringSelectMenuOptionEmits>();

const emojiIsImage = computed(() => {
	const emoji = option.emoji;
	return Boolean(
		emoji && (emoji.includes("http") || emoji.startsWith("/") || emoji.startsWith("./")),
	);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-v2-string-select-menu-option {
	--discord-v2-string-select-menu-option-hover: oklch(100% 0 0 / 0.1);
	--discord-v2-string-select-menu-option-label: oklch(89.95% 0.0052 247.88);
	--discord-v2-string-select-menu-option-description: oklch(73.06% 0.0048 264.53);
	--discord-v2-string-select-menu-option-check: oklch(57.7% 0.209 273.88);

	@apply flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm;
	color: var(--discord-v2-string-select-menu-option-label);
}

.discord-v2-string-select-menu-option:hover,
.discord-v2-string-select-menu-option-active {
	background-color: var(--discord-v2-string-select-menu-option-hover);
}

.discord-v2-string-select-menu-option-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-v2-string-select-menu-option-emoji {
	@apply size-5 shrink-0 object-contain text-center;
}

.discord-v2-string-select-menu-option-content {
	@apply flex min-w-0 flex-col gap-0.5;
}

.discord-v2-string-select-menu-option-label {
	@apply truncate font-medium;
}

.discord-v2-string-select-menu-option-description {
	@apply truncate text-xs;
	color: var(--discord-v2-string-select-menu-option-description);
}

.discord-v2-string-select-menu-option-check {
	@apply ml-auto;
	color: var(--discord-v2-string-select-menu-option-check);
}
</style>
