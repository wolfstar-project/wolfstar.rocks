<template>
	<div ref="rootRef" class="discord-string-select-menu" @focusout="onFocusOut">
		<button
			:id="triggerId"
			ref="triggerRef"
			type="button"
			class="discord-string-select-menu-trigger"
			:class="{ 'discord-string-select-menu-trigger-disabled': disabled }"
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
				class="discord-string-select-menu-value"
				:class="{ 'discord-string-select-menu-placeholder': !selectedOption }"
			>
				{{ selectedOption?.label ?? placeholder }}
			</span>
			<!-- Skyra ExpandMore chevron: points down when closed, rotates -180deg when open. -->
			<svg
				class="discord-string-select-menu-chevron"
				:class="{ 'discord-string-select-menu-chevron-open': isOpen }"
				aria-hidden="true"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill="currentColor"
					d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z"
				/>
			</svg>
		</button>

		<!-- Teleport escapes overflow-hidden ancestors (showcase card, chat scroll).
		     Keeping the trigger focused on pointer-down lets the combobox drive selection
		     through aria-activedescendant instead of moving focus into the listbox. -->
		<Teleport to="body">
			<div
				v-if="isOpen"
				ref="panelRef"
				class="discord-string-select-menu-panel"
				:class="{
					'discord-string-select-menu-panel-above': placement === 'above',
					'discord-string-select-menu-panel-below': placement === 'below',
				}"
				:data-placement="placement"
				:style="panelStyle"
				@mousedown.prevent
			>
				<DiscordScrollbar class="discord-string-select-menu-scroll">
					<ul
						:id="listboxId"
						class="discord-string-select-menu-listbox"
						role="listbox"
						:aria-label="ariaLabel"
					>
						<DiscordStringSelectMenuOption
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
		</Teleport>
	</div>
</template>

<script lang="ts">
import type { ShortcutsConfig } from "@nuxt/ui/composables";
import type { CSSProperties } from "vue";
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
import type { StringSelectMenuPlacement } from "~/types/discord";

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
const panelRef = useTemplateRef<HTMLDivElement>("panelRef");

const isOpen = ref(false);
const activeIndex = ref(-1);

const selectedOption = computed(() =>
	options.find((option) => option.value === selectedValue.value),
);

const activeDescendant = computed(() =>
	isOpen.value && activeIndex.value >= 0 ? optionId(activeIndex.value) : undefined,
);

const {
	left: triggerLeft,
	top: triggerTop,
	bottom: triggerBottom,
	width: triggerWidth,
	height: triggerHeight,
	update: updateTriggerBounds,
} = useElementBounding(triggerRef);

const placement = computed(
	(): StringSelectMenuPlacement =>
		resolveStringSelectMenuPlacement(
			{
				top: triggerTop.value,
				bottom: triggerBottom.value,
				height: triggerHeight.value,
			},
			import.meta.client ? window.innerHeight : 0,
		),
);

const panelStyle = computed((): CSSProperties => {
	const left = `${triggerLeft.value}px`;
	const width = `${triggerWidth.value}px`;
	if (placement.value === "above") {
		const bottom = import.meta.client ? window.innerHeight - triggerTop.value : 0;
		return {
			position: "fixed",
			left,
			width,
			top: "auto",
			bottom: `${bottom}px`,
			zIndex: 1002,
		};
	}
	return {
		position: "fixed",
		left,
		width,
		top: `${triggerBottom.value}px`,
		bottom: "auto",
		zIndex: 1002,
	};
});

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
	// Measure before the panel renders so `placement` is resolved from live bounds on
	// the first frame instead of flashing the default and flipping a tick later.
	updateTriggerBounds();
	isOpen.value = true;
	const selectedIndex = options.findIndex((option) => option.value === selectedValue.value);
	activeIndex.value =
		selectedIndex >= 0 && isSelectable(selectedIndex) ? selectedIndex : firstSelectableIndex();
	nextTick(() => {
		updateTriggerBounds();
		scrollActiveIntoView();
	});
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
		const selector = `#${CSS.escape(optionId(activeIndex.value))}`;
		const element =
			panelRef.value?.querySelector(selector) ?? rootRef.value?.querySelector(selector);
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
	if (!(nextFocused instanceof Node)) {
		close();
		return;
	}
	if (rootRef.value?.contains(nextFocused) || panelRef.value?.contains(nextFocused)) return;
	close();
}

// Panel is teleported to body, so ignore clicks on it when detecting outside clicks.
onClickOutside(rootRef, () => close(), { ignore: [panelRef] });

// Nested scroll containers (Discord chat) don't fire window scroll — capture phase does.
useEventListener(
	document,
	"scroll",
	() => {
		if (isOpen.value) updateTriggerBounds();
	},
	{ capture: true, passive: true },
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Dimensions and layout mirror Skyra discord-string-select-menu; colors use oklch tokens. */
.discord-string-select-menu {
	@apply relative w-full max-w-100 font-whitney;
}

.discord-string-select-menu-trigger {
	/* Skyra dark select trigger tones (bg/border + text). */
	--discord-string-select-menu-bg: oklch(20% 0.012 264);
	--discord-string-select-menu-border: oklch(20% 0.012 264);
	--discord-string-select-menu-border-hover: oklch(0% 0 0);
	--discord-string-select-menu-text: oklch(90% 0.012 250);
	--discord-string-select-menu-placeholder-text: oklch(72% 0.01 260);
	--discord-string-select-menu-chevron: oklch(90% 0.012 250);

	@apply box-border flex h-9 min-h-9 w-full items-center justify-between gap-2 rounded border px-2 text-sm font-medium;
	background-color: var(--discord-string-select-menu-bg);
	border-color: var(--discord-string-select-menu-border);
	color: var(--discord-string-select-menu-text);
	transition: border-color 0.2s ease;
	cursor: pointer;
}

.discord-string-select-menu-trigger:hover:not(.discord-string-select-menu-trigger-disabled) {
	border-color: var(--discord-string-select-menu-border-hover);
}

.discord-string-select-menu-trigger:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.discord-string-select-menu-trigger-disabled {
	@apply cursor-not-allowed opacity-50;
}

.discord-string-select-menu-value {
	@apply min-w-0 truncate;
}

.discord-string-select-menu-placeholder {
	color: var(--discord-string-select-menu-placeholder-text);
}

.discord-string-select-menu-chevron {
	@apply ml-auto shrink-0;
	color: var(--discord-string-select-menu-chevron);
	transition: transform 0.2s ease;
}

.discord-string-select-menu-chevron-open {
	transform: rotate(-180deg);
}

.discord-string-select-menu-panel {
	/* Skyra panel surface; max-height 190px; z-index 1002 via inline style. */
	--discord-string-select-menu-panel-bg: oklch(26% 0.012 260);
	--discord-string-select-menu-panel-border: oklch(20% 0.012 264);
	--discord-string-select-menu-panel-shadow: oklch(0% 0 0 / 0.45);
	--discord-string-select-menu-panel-scroll-track: oklch(0% 0 0 / 0);
	--discord-string-select-menu-panel-scroll-thumb: oklch(0% 0 0 / 0.3);

	/* Position/size come from fixed inline styles after Teleport to body. */
	@apply max-w-100 overflow-hidden rounded font-whitney;
	background-color: var(--discord-string-select-menu-panel-bg);
	border: 1px solid var(--discord-string-select-menu-panel-border);
	box-shadow: 0 8px 24px var(--discord-string-select-menu-panel-shadow);
}

.discord-string-select-menu-panel-above {
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}

.discord-string-select-menu-panel-below {
	border-top-left-radius: 0;
	border-top-right-radius: 0;
}

.discord-string-select-menu-scroll {
	--discord-scrollbar-track: var(--discord-string-select-menu-panel-scroll-track);
	--discord-scrollbar-thumb: var(--discord-string-select-menu-panel-scroll-thumb);

	max-height: 190px;
}

.discord-string-select-menu-scroll :deep(.discord-scrollbar-viewport) {
	overscroll-behavior: contain;
}

.discord-string-select-menu-listbox {
	@apply flex flex-col;
}

@media (prefers-reduced-motion: reduce) {
	.discord-string-select-menu-trigger,
	.discord-string-select-menu-chevron {
		transition: none;
	}
}
</style>
