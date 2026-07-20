<template>
	<li
		:id="optionId"
		class="discord-v2-string-select-menu-option"
		:class="{
			'discord-v2-string-select-menu-option-active': active,
			'discord-v2-string-select-menu-option-selected': selected,
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
		<UIcon
			v-else-if="emojiIsIconify"
			:name="option.emoji!"
			class="discord-v2-string-select-menu-option-emoji size-5"
			:class="{
				'discord-v2-string-select-menu-option-emoji-folder': emojiIsFolderIcon,
				'discord-v2-string-select-menu-option-emoji-gear': emojiIsGearIcon,
			}"
			aria-hidden="true"
		/>
		<span
			v-else-if="option.emoji"
			class="discord-v2-string-select-menu-option-emoji"
			aria-hidden="true"
			>{{ option.emoji }}</span
		>
		<span class="discord-v2-string-select-menu-option-content">
			<span class="discord-v2-string-select-menu-option-label">{{ option.label }}</span>
			<span v-if="currentlyAtPath" class="discord-v2-string-select-menu-option-description">
				<span class="discord-v2-string-select-menu-option-currently-at">Currently at:</span>
				<UIcon
					name="ph:folder-fill"
					class="discord-v2-string-select-menu-option-path-folder size-3.5 shrink-0"
					aria-hidden="true"
				/>
				<span class="discord-v2-string-select-menu-option-path">{{ currentlyAtPath }}</span>
			</span>
			<span
				v-else-if="option.description"
				class="discord-v2-string-select-menu-option-description"
				>{{ option.description }}</span
			>
		</span>
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
const CURRENTLY_AT_PREFIX = "Currently at:";

const { option, active = false, selected = false } = defineProps<StringSelectMenuOptionProps>();

const emit = defineEmits<StringSelectMenuOptionEmits>();

const emojiIsImage = computed(() => {
	const emoji = option.emoji;
	return Boolean(
		emoji && (emoji.includes("http") || emoji.startsWith("/") || emoji.startsWith("./")),
	);
});

const emojiIsIconify = computed(() => {
	const emoji = option.emoji;
	return Boolean(emoji && emoji.includes(":") && !emojiIsImage.value);
});

const emojiIsFolderIcon = computed(() => {
	const emoji = option.emoji?.toLowerCase() ?? "";
	return emojiIsIconify.value && emoji.includes("folder");
});

const emojiIsGearIcon = computed(() => {
	const emoji = option.emoji?.toLowerCase() ?? "";
	return emojiIsIconify.value && (emoji.includes("gear") || emoji.includes("cog"));
});

const currentlyAtPath = computed(() => {
	const description = option.description;
	if (!description?.startsWith(CURRENTLY_AT_PREFIX)) return undefined;
	const path = description.slice(CURRENTLY_AT_PREFIX.length).trim();
	return path.length > 0 ? path : undefined;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-v2-string-select-menu-option {
	--discord-v2-string-select-menu-option-hover: oklch(32% 0.008 264);
	--discord-v2-string-select-menu-option-label: oklch(95% 0 0);
	--discord-v2-string-select-menu-option-description: oklch(72% 0.01 260);
	--discord-v2-string-select-menu-option-folder: oklch(72% 0.14 245);
	--discord-v2-string-select-menu-option-path-folder: oklch(78% 0.12 85);
	--discord-v2-string-select-menu-option-gear: oklch(78% 0.01 260);

	@apply flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm;
	color: var(--discord-v2-string-select-menu-option-label);
}

.discord-v2-string-select-menu-option:hover,
.discord-v2-string-select-menu-option-active,
.discord-v2-string-select-menu-option-selected {
	background-color: var(--discord-v2-string-select-menu-option-hover);
}

.discord-v2-string-select-menu-option-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-v2-string-select-menu-option-emoji {
	@apply size-5 shrink-0 object-contain text-center;
}

.discord-v2-string-select-menu-option-emoji-folder {
	color: var(--discord-v2-string-select-menu-option-folder);
}

.discord-v2-string-select-menu-option-emoji-gear {
	color: var(--discord-v2-string-select-menu-option-gear);
}

.discord-v2-string-select-menu-option-content {
	@apply flex min-w-0 flex-col gap-0.5;
}

.discord-v2-string-select-menu-option-label {
	@apply truncate leading-snug font-semibold;
}

.discord-v2-string-select-menu-option-description {
	@apply flex min-w-0 items-center gap-1 truncate text-xs leading-snug;
	color: var(--discord-v2-string-select-menu-option-description);
}

.discord-v2-string-select-menu-option-currently-at {
	@apply shrink-0;
}

.discord-v2-string-select-menu-option-path-folder {
	color: var(--discord-v2-string-select-menu-option-path-folder);
}

.discord-v2-string-select-menu-option-path {
	@apply truncate;
}
</style>
