<template>
	<SelectMenu
		v-model="selectedValue"
		class="discord-string-select-menu"
		variant="message"
		:options="menuOptions"
		:placeholder="placeholder ?? ts('discord.select.placeholder')"
		:label="ariaLabel ?? ts('discord.select.aria')"
		:disabled
		@select="emit('select', $event)"
	/>
</template>

<script lang="ts">
import type { FunctionalComponent } from "vue";

interface StringSelectMenuProps {
	options: StringSelectMenuOption[];
	placeholder?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

interface StringSelectMenuEmits {
	select: [value: string];
}

function isImageEmoji(emoji: string) {
	return emoji.includes("http") || emoji.startsWith("/") || emoji.startsWith("./");
}
</script>

<script setup lang="ts">
import type { SelectMenuOption } from "~/components/ui/select-menu";
import type { StringSelectMenuOption } from "~/types/discord";
import { SelectMenu } from "~/components/ui/select-menu";

const { ts } = useI18n();
const { options, placeholder, disabled = false, ariaLabel } = defineProps<StringSelectMenuProps>();

const emit = defineEmits<StringSelectMenuEmits>();

const selectedValue = defineModel<string | undefined>({ default: undefined });

const UIcon = resolveComponent("UIcon");

/**
 * newt/ui takes the option's glyph as a component. A Discord emoji is an image
 * path, an Iconify name (`ph:folder-fill`, `twemoji:gear`), or Unicode text.
 */
function emojiIcon(emoji: string): FunctionalComponent {
	if (isImageEmoji(emoji)) {
		return () =>
			h("img", { src: emoji, alt: "", draggable: false, class: "size-full object-contain" });
	}
	if (emoji.includes(":")) return () => h(UIcon, { name: emoji, class: "size-full" });
	return () => h("span", { class: "leading-none" }, emoji);
}

const menuOptions = computed((): SelectMenuOption[] =>
	options.map((option) => ({
		value: option.value,
		label: option.label,
		description: option.description,
		disabled: option.disabled,
		icon: option.emoji ? emojiIcon(option.emoji) : undefined,
	})),
);
</script>
