<template>
	<div ref="rootRef" class="discord-v2-string-select-menu" @focusout="onFocusOut">
		<button
			:id="triggerId"
			ref="triggerRef"
			type="button"
			class="discord-v2-string-select-menu-trigger"
			:class="{ 'discord-v2-string-select-menu-trigger-disabled': disabled }"
			role="combobox"
			:aria-haspopup="'listbox'"
			:aria-expanded="isOpen"
			:aria-controls="listboxId"
			:aria-activedescendant="activeDescendant"
			:aria-label="ariaLabel"
			:disabled="disabled"
			@click="toggle"
		>
			<span
				class="discord-v2-string-select-menu-value"
				:class="{ 'discord-v2-string-select-menu-placeholder': !selectedOption }"
			>
				{{ selectedOption?.label ?? placeholder }}
			</span>
			<UIcon
				name="ph:caret-down-bold"
				class="discord-v2-string-select-menu-chevron size-4 shrink-0"
				:class="{ 'discord-v2-string-select-menu-chevron-open': isOpen }"
				aria-hidden="true"
			/>
		</button>

		<!-- Keeping the trigger focused on pointer-down lets the combobox drive selection
		     through aria-activedescendant instead of moving focus into the listbox. -->
		<div v-show="isOpen" class="discord-v2-string-select-menu-panel" @mousedown.prevent>
			<DiscordScrollbar class="discord-v2-string-select-menu-scroll">
				<ul
					:id="listboxId"
					class="discord-v2-string-select-menu-listbox"
					role="listbox"
					:aria-label="ariaLabel"
				>
					<DiscordV2StringSelectMenuOption
						v-for="(option, index) in options"
						:key="option.value"
						:option="option"
						:option-id="optionId(index)"
						:active="index === activeIndex"
						:selected="option.value === selectedValue"
						@select="selectAt(index)"
						@activate="activeIndex = index"
					/>
				</ul>
			</DiscordScrollbar>
		</div>
	</div>
</template>

<script lang="ts">
import type { ShortcutsConfig } from "@nuxt/ui/composables";
import type { StringSelectMenuOption } from "~/types/discord";

interface StringSelectMenuProps {
	options: StringSelectMenuOption[];
	placeholder?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

interface StringSelectMenuEmits {
	select: [value: string];
}
</script>

<script setup lang="ts">
const {
	options,
	placeholder = "Make a selection",
	disabled = false,
	ariaLabel = "Select an option",
} = defineProps<StringSelectMenuProps>();

const emit = defineEmits<StringSelectMenuEmits>();

const selectedValue = defineModel<string | undefined>({ default: undefined });

const baseId = useId();
const triggerId = `${baseId}-trigger`;
const listboxId = `${baseId}-listbox`;
const optionId = (index: number) => `${baseId}-option-${index}`;

const rootRef = useTemplateRef<HTMLDivElement>("rootRef");
const triggerRef = useTemplateRef<HTMLButtonElement>("triggerRef");

const isOpen = ref(false);
const activeIndex = ref(-1);

const selectedOption = computed(() =>
	options.find((option) => option.value === selectedValue.value),
);

const activeDescendant = computed(() =>
	isOpen.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
);

function isSelectable(index: number) {
	return !options[index]?.disabled;
}

function firstSelectableIndex() {
	return options.findIndex((_, index) => isSelectable(index));
}

function lastSelectableIndex() {
	for (let index = options.length - 1; index >= 0; index--) {
		if (isSelectable(index)) return index;
	}
	return -1;
}

function nextSelectableIndex(from: number, direction: 1 | -1) {
	const count = options.length;
	if (count === 0) return -1;
	for (let step = 1; step <= count; step++) {
		const index = (from + direction * step + count * step) % count;
		if (isSelectable(index)) return index;
	}
	return from;
}

function open() {
	if (disabled || isOpen.value) return;
	isOpen.value = true;
	const selectedIndex = options.findIndex((option) => option.value === selectedValue.value);
	activeIndex.value =
		selectedIndex >= 0 && isSelectable(selectedIndex) ? selectedIndex : firstSelectableIndex();
	scrollActiveIntoView();
}

function close(refocus = false) {
	if (!isOpen.value) return;
	isOpen.value = false;
	activeIndex.value = -1;
	if (refocus) triggerRef.value?.focus();
}

function toggle() {
	if (disabled) return;
	isOpen.value ? close() : open();
}

function selectAt(index: number) {
	const option = options[index];
	if (!option || option.disabled) return;
	selectedValue.value = option.value;
	emit("select", option.value);
	close(true);
}

function moveActive(direction: 1 | -1) {
	if (!isOpen.value) {
		open();
		return;
	}
	activeIndex.value = nextSelectableIndex(activeIndex.value, direction);
	scrollActiveIntoView();
}

function scrollActiveIntoView() {
	nextTick(() => {
		if (activeIndex.value < 0) return;
		const element = rootRef.value?.querySelector(`#${CSS.escape(optionId(activeIndex.value))}`);
		element?.scrollIntoView({ block: "nearest" });
	});
}

function setActive(index: number) {
	activeIndex.value = index;
	scrollActiveIntoView();
}

function confirmOrOpen() {
	isOpen.value ? selectAt(activeIndex.value) : open();
}

const { focused: isTriggerFocused } = useFocus(triggerRef);

// defineShortcuts binds to `keydown` on the window, so the shortcuts are gated on this
// menu actually being the one the user is driving. Without the gate, arrow keys pressed
// anywhere on the page would steer every mounted menu at once.
const keyboardActive = computed(() => !disabled && (isTriggerFocused.value || isOpen.value));

// Tab is deliberately absent: defineShortcuts calls preventDefault() on every match, which
// would trap focus inside the menu. Tabbing away is handled by the focusout listener below.
defineShortcuts(
	computed<ShortcutsConfig>(() => {
		if (!keyboardActive.value) return {};

		return {
			"arrowdown": () => moveActive(1),
			"arrowup": () => moveActive(-1),
			"enter": confirmOrOpen,
			" ": confirmOrOpen,
			"home": isOpen.value ? () => setActive(firstSelectableIndex()) : false,
			"end": isOpen.value ? () => setActive(lastSelectableIndex()) : false,
			"escape": isOpen.value ? () => close(true) : false,
		};
	}),
);

function onFocusOut(event: FocusEvent) {
	const nextFocused = event.relatedTarget;
	if (nextFocused instanceof Node && rootRef.value?.contains(nextFocused)) return;
	close();
}

onClickOutside(rootRef, () => close());
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-v2-string-select-menu {
	@apply relative w-full max-w-100 font-whitney;
}

.discord-v2-string-select-menu-trigger {
	--discord-v2-string-select-menu-bg: oklch(23.89% 0.0059 271.16);
	--discord-v2-string-select-menu-border: oklch(23.89% 0.0059 271.16);
	--discord-v2-string-select-menu-text: oklch(89.95% 0.0052 247.88);
	--discord-v2-string-select-menu-placeholder-text: oklch(73.06% 0.0048 264.53);

	@apply flex h-9 w-full items-center justify-between gap-2 rounded border px-2 text-sm font-medium;
	background-color: var(--discord-v2-string-select-menu-bg);
	border-color: var(--discord-v2-string-select-menu-border);
	color: var(--discord-v2-string-select-menu-text);
	transition: border-color 0.2s ease;
}

.discord-v2-string-select-menu-trigger:hover:not(.discord-v2-string-select-menu-trigger-disabled) {
	border-color: oklch(20% 0 0 / 1);
}

.discord-v2-string-select-menu-trigger:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.discord-v2-string-select-menu-trigger-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-v2-string-select-menu-value {
	@apply truncate;
}

.discord-v2-string-select-menu-placeholder {
	color: var(--discord-v2-string-select-menu-placeholder-text);
}

.discord-v2-string-select-menu-chevron {
	transition: transform 0.2s ease;
}

.discord-v2-string-select-menu-chevron-open {
	transform: rotate(-180deg);
}

.discord-v2-string-select-menu-panel {
	--discord-v2-string-select-menu-panel-bg: oklch(29.64% 0.0077 264.45);
	--discord-v2-string-select-menu-panel-scroll-track: oklch(0% 0 0 / 0);
	--discord-v2-string-select-menu-panel-scroll-thumb: oklch(0% 0 0 / 0.3);

	@apply absolute top-full left-0 z-[1002] mt-1 w-full max-w-100 overflow-hidden rounded;
	background-color: var(--discord-v2-string-select-menu-panel-bg);
}

.discord-v2-string-select-menu-scroll {
	--discord-scrollbar-track: var(--discord-v2-string-select-menu-panel-scroll-track);
	--discord-scrollbar-thumb: var(--discord-v2-string-select-menu-panel-scroll-thumb);

	@apply max-h-48;
}

.discord-v2-string-select-menu-scroll :deep(.discord-scrollbar-viewport) {
	overscroll-behavior: contain;
}

.discord-v2-string-select-menu-listbox {
	@apply flex flex-col py-1;
}

@media (prefers-reduced-motion: reduce) {
	.discord-v2-string-select-menu-trigger,
	.discord-v2-string-select-menu-chevron {
		transition: none;
	}
}
</style>
