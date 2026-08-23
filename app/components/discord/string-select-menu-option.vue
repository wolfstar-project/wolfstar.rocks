<template>
	<li
		:id="optionId"
		class="discord-string-select-menu-option"
		:class="{
			'discord-string-select-menu-option-active': active,
			'discord-string-select-menu-option-selected': selected,
			'discord-string-select-menu-option-disabled': option.disabled,
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
			draggable="false"
			class="discord-string-select-menu-option-emoji"
		/>
		<UIcon
			v-else-if="emojiIsIconify"
			:name="option.emoji!"
			class="discord-string-select-menu-option-emoji size-[1.375em]"
			:class="{
				'discord-string-select-menu-option-emoji-folder': emojiIsFolderIcon,
				'discord-string-select-menu-option-emoji-gear': emojiIsGearIcon,
			}"
			aria-hidden="true"
		/>
		<span
			v-else-if="option.emoji"
			class="discord-string-select-menu-option-emoji"
			aria-hidden="true"
			>{{ option.emoji }}</span
		>
		<div class="discord-string-select-menu-option-ellipsis-text">
			<strong class="discord-string-select-menu-option-label">{{ option.label }}</strong>
			<span v-if="currentlyAtPath" class="discord-string-select-menu-option-description">
				<span class="discord-string-select-menu-option-currently-at">Currently at:</span>
				<UIcon
					name="ph:folder-fill"
					class="discord-string-select-menu-option-path-folder size-3.5 shrink-0"
					aria-hidden="true"
				/>
				<span class="discord-string-select-menu-option-path">{{ currentlyAtPath }}</span>
			</span>
			<span
				v-else-if="option.description"
				class="discord-string-select-menu-option-description"
				>{{ option.description }}</span
			>
		</div>
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

/* Layout mirrors Skyra discord-string-select-menu-option (flex row, 8/12 padding, 10px gap). */
.discord-string-select-menu-option {
	--discord-string-select-menu-option-hover: oklch(100% 0 0 / 0.1);
	--discord-string-select-menu-option-label: oklch(95% 0 0);
	--discord-string-select-menu-option-description: oklch(72% 0.01 260);
	--discord-string-select-menu-option-folder: oklch(72% 0.14 245);
	--discord-string-select-menu-option-path-folder: oklch(78% 0.12 85);
	--discord-string-select-menu-option-gear: oklch(78% 0.01 260);

	@apply flex max-w-100 cursor-pointer items-center gap-2.5 py-2 pr-2 pl-3 text-sm;
	color: var(--discord-string-select-menu-option-label);
}

.discord-string-select-menu-option:hover,
.discord-string-select-menu-option-active,
.discord-string-select-menu-option-selected {
	background-color: var(--discord-string-select-menu-option-hover);
}

.discord-string-select-menu-option-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-string-select-menu-option-emoji {
	@apply mr-1 shrink-0 object-contain text-center align-bottom;
	width: 1.375em;
	height: 1.375em;
}

.discord-string-select-menu-option-emoji-folder {
	color: var(--discord-string-select-menu-option-folder);
}

.discord-string-select-menu-option-emoji-gear {
	color: var(--discord-string-select-menu-option-gear);
}

.discord-string-select-menu-option-ellipsis-text {
	@apply flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden;
}

.discord-string-select-menu-option-label {
	@apply block overflow-hidden leading-snug font-semibold text-ellipsis whitespace-nowrap;
}

.discord-string-select-menu-option-description {
	@apply flex min-w-0 items-center gap-1 overflow-hidden text-xs leading-snug text-ellipsis whitespace-nowrap;
	color: var(--discord-string-select-menu-option-description);
}

.discord-string-select-menu-option-currently-at {
	@apply shrink-0;
}

.discord-string-select-menu-option-path-folder {
	color: var(--discord-string-select-menu-option-path-folder);
}

.discord-string-select-menu-option-path {
	@apply truncate;
}
</style>
