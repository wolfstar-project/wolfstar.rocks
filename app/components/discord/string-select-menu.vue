<template>
	<!-- The panel opens inside this element, so it reads the tokens and the typeface of the surface around it. -->
	<div ref="containerRef" class="contents">
		<!--
			Under a message the select sits close to the composer, so it opens upwards.
			Its trigger is 40px high, as Discord draws it there.
		-->
		<SelectMenu
			v-model="selectedValue"
			class="discord-string-select-menu"
			variant="message"
			side="top"
			trigger-class="min-h-10"
			:container="containerRef ?? undefined"
			:options="menuOptions"
			:placeholder="placeholder ?? ts('discord.select.placeholder')"
			:label="ariaLabel ?? ts('discord.select.aria')"
			:disabled
			@select="emit('select', $event)"
		/>
	</div>
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

const containerRef = useTemplateRef<HTMLDivElement>("containerRef");

const selectedValue = defineModel<string | undefined>({ default: undefined });

const UIcon = resolveComponent("UIcon");

/**
 * newt/ui draws a Unicode `emoji` itself. A custom emoji image and an Iconify
 * name (`twemoji:gear`) still go in as an `icon` component, which the trigger
 * also shows once the option is chosen.
 */
function emojiGlyph(emoji: string | undefined): Pick<SelectMenuOption, "emoji" | "icon"> {
	if (!emoji) return {};
	if (isImageEmoji(emoji)) {
		const image: FunctionalComponent = () =>
			h("img", { src: emoji, alt: "", draggable: false, class: "size-full object-contain" });
		return { icon: image };
	}
	if (emoji.includes(":")) {
		const icon: FunctionalComponent = () => h(UIcon, { name: emoji, class: "size-full" });
		return { icon };
	}
	return { emoji };
}

const menuOptions = computed((): SelectMenuOption[] =>
	options.map((option) => {
		const glyph = emojiGlyph(option.emoji);
		return {
			value: option.value,
			label: option.label,
			description: option.description,
			disabled: option.disabled,
			emoji: glyph.emoji,
			icon: glyph.icon,
		};
	}),
);
</script>
