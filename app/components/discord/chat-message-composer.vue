<template>
	<div
		class="discord-message-composer"
		:class="{
			'discord-message-composer-has-value': hasValue,
			'discord-message-composer-apps-open': appsOpen,
		}"
		role="group"
		:aria-label="composerLabel"
	>
		<button
			type="button"
			class="discord-message-composer-button discord-message-composer-add"
			tabindex="-1"
			aria-hidden="true"
		>
			<UIcon
				name="discord:plus"
				class="discord-message-composer-add-icon"
				aria-hidden="true"
			/>
		</button>

		<!-- Mobile empty state: apps + gift between + and pill (hidden when typing). -->
		<div class="discord-message-composer-mobile-leading">
			<button
				type="button"
				class="discord-message-composer-button discord-message-composer-mobile-action discord-message-composer-apps-mobile"
				:aria-label="appsOpen ? 'Close apps and commands' : 'Open apps and commands'"
				:title="appsOpen ? 'Close apps and commands' : 'Open apps and commands'"
				@click="emit('openApps')"
			>
				<UIcon
					:name="appsOpen ? 'ph:x-bold' : 'discord:apps'"
					class="discord-message-composer-mobile-action-icon"
					aria-hidden="true"
				/>
			</button>
			<button
				type="button"
				class="discord-message-composer-button discord-message-composer-mobile-action discord-message-composer-gift-mobile"
				tabindex="-1"
				aria-hidden="true"
			>
				<UIcon
					name="discord:gift"
					class="discord-message-composer-mobile-action-icon"
					aria-hidden="true"
				/>
			</button>
		</div>

		<div class="discord-message-composer-field">
			<slot name="value">
				<input
					v-model="modelValue"
					type="text"
					class="discord-message-composer-input"
					:placeholder="displayPlaceholder"
					:aria-label="displayPlaceholder"
					:aria-controls="autocomplete ? ariaControls : undefined"
					:aria-expanded="autocomplete ? ariaExpanded : undefined"
					:aria-activedescendant="autocomplete ? ariaActivedescendant : undefined"
					:role="autocomplete ? 'combobox' : undefined"
					:autocomplete="autocomplete ? 'off' : undefined"
					spellcheck="false"
					@keydown="onKeydown"
				/>
			</slot>

			<button
				type="button"
				class="discord-message-composer-button discord-message-composer-emoji"
				tabindex="-1"
				aria-hidden="true"
			>
				<UIcon name="discord:emoji" class="size-5" aria-hidden="true" />
			</button>
		</div>

		<div class="discord-message-composer-actions">
			<button
				v-for="action of ComposerActions"
				:key="action.label ?? action.icon"
				type="button"
				class="discord-message-composer-button discord-message-composer-action"
				:class="{
					'discord-message-composer-action-secondary': action.secondary,
					'discord-message-composer-action-optional': action.optional,
				}"
				:aria-label="action.label"
				:aria-hidden="action.decorative ? true : undefined"
				:tabindex="action.decorative ? -1 : undefined"
				:title="action.label"
				@click="onComposerAction(action)"
			>
				<UIcon
					:name="action.icon"
					class="discord-message-composer-action-icon"
					aria-hidden="true"
				/>
			</button>
		</div>

		<button
			type="button"
			class="discord-message-composer-button discord-message-composer-send"
			:aria-label="hasValue ? 'Send message' : undefined"
			:aria-hidden="hasValue ? undefined : true"
			:tabindex="hasValue ? undefined : -1"
			:title="hasValue ? 'Send message' : undefined"
			:disabled="!hasValue"
			@click="emit('submit')"
		>
			<UIcon
				v-if="hasValue"
				name="ph:paper-plane-tilt-fill"
				class="discord-message-composer-send-icon"
				aria-hidden="true"
			/>
			<UIcon
				v-else
				name="discord:mic"
				class="discord-message-composer-send-icon"
				aria-hidden="true"
			/>
		</button>
	</div>
</template>

<script lang="ts">
interface MessageComposerProps {
	channelName: string;
	placeholder?: string;
	/** When true, the input acts as a combobox for slash-command autocomplete. */
	autocomplete?: boolean;
	ariaControls?: string;
	ariaExpanded?: boolean;
	ariaActivedescendant?: string;
	/** Mobile: apps launcher is open — swap the apps glyph for a close (X) control. */
	appsOpen?: boolean;
}

interface ComposerAction {
	icon: string;
	/** Accessible name for functional controls; omitted when decorative. */
	label?: string;
	secondary?: boolean;
	optional?: boolean;
	emitOpenApps?: boolean;
	/** Non-functional chrome — hidden from AT, not focusable. */
	decorative?: boolean;
}

/** Desktop toolbar order matches Discord / Figma: gift · GIF · sticker · emoji · apps. */
const ComposerActions: readonly ComposerAction[] = [
	{ icon: "discord:gift", secondary: true, decorative: true },
	{ icon: "discord:gif", decorative: true },
	{ icon: "discord:sticker", optional: true, decorative: true },
	{ icon: "discord:emoji", decorative: true },
	{ icon: "discord:apps", label: "Open apps and commands", optional: true, emitOpenApps: true },
];
</script>

<script setup lang="ts">
const {
	channelName,
	placeholder,
	autocomplete = false,
	ariaControls,
	ariaExpanded,
	ariaActivedescendant,
	appsOpen = false,
} = defineProps<MessageComposerProps>();

const modelValue = defineModel<string>({ default: "" });

const emit = defineEmits<{
	openApps: [];
	submit: [];
	escape: [];
	navigate: [direction: "up" | "down"];
}>();

const displayPlaceholder = computed(() => placeholder ?? `Message #${channelName}`);
const composerLabel = computed(() => `Message composer for ${channelName}`);
const hasValue = computed(() => modelValue.value.trim().length > 0);

function onComposerAction(action: ComposerAction) {
	if (action.emitOpenApps) {
		emit("openApps");
	}
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Enter") {
		event.preventDefault();
		emit("submit");
		return;
	}

	if (event.key === "Escape") {
		event.preventDefault();
		emit("escape");
		return;
	}

	if (event.key === "ArrowDown") {
		event.preventDefault();
		emit("navigate", "down");
		return;
	}

	if (event.key === "ArrowUp") {
		event.preventDefault();
		emit("navigate", "up");
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-message-composer {
	/* Discord-true dark surfaces (Figma / desktop client). */
	--discord-message-composer-bg: oklch(28.84% 0.007 272.93);
	--discord-message-composer-border: oklch(100% 0 0 / 0.06);
	--discord-message-composer-text: oklch(91.56% 0.004 272.93);
	--discord-message-composer-muted: oklch(71.01% 0.01 273.13);
	--discord-message-composer-hover: oklch(100% 0 0 / 0.06);
	--discord-message-composer-add-bg: oklch(19.34% 0.004 273.16);
	--discord-message-composer-pill-bg: oklch(28.84% 0.007 272.93);
	--discord-message-composer-send-active: oklch(57.74% 0.2091 273.85);

	/* Desktop: side inset; flush to chat bottom; hairline border + modest radius. */
	@apply mx-4 mb-0 flex h-11 min-w-0 shrink-0 items-center gap-0 rounded px-4 font-whitney;
	background-color: var(--discord-message-composer-bg);
	border: 1px solid var(--discord-message-composer-border);
	color: var(--discord-message-composer-muted);
}

.discord-message-composer-button {
	@apply inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0;
	color: inherit;
}

.discord-message-composer-button:hover {
	background-color: var(--discord-message-composer-hover);
	color: var(--discord-message-composer-text);
}

.discord-message-composer-button:focus-visible {
	@apply outline-2 outline-offset-1 outline-primary;
}

/*
 * Desktop attach control: bare thin + (no ring / filled circle).
 * Mobile keeps a filled circular chip below the md breakpoint.
 */
.discord-message-composer-add {
	@apply size-8;
}

.discord-message-composer-add:hover {
	background-color: transparent;
	color: var(--discord-message-composer-text);
}

.discord-message-composer-add-icon {
	@apply size-6;
}

.discord-message-composer-field {
	@apply flex h-full min-w-0 flex-1 items-center;
}

/*
 * Style both the default input and `#value` slot inputs. Vue `:slotted()` only
 * matches the slot root — CommandsShowcase nests the input under a wrapper div,
 * so `:slotted(.discord-message-composer-input)` never hits. Prefer `:deep` on
 * the field (and unscoped utilities on the input) so Esc/idle keyboard focus
 * cannot paint a white outline around a shrink-wrapped placeholder.
 */
.discord-message-composer-input,
:slotted(.discord-message-composer-input),
.discord-message-composer-field :deep(.discord-message-composer-input) {
	/* Tight left pad so `/` sits next to the attach + like Discord desktop. */
	@apply h-full w-full min-w-0 flex-1 border-0 bg-transparent py-0 pr-2 pl-1 text-base leading-none outline-none;
	appearance: none;
	color: var(--discord-message-composer-text);
}

.discord-message-composer-input:focus,
.discord-message-composer-input:focus-visible,
:slotted(.discord-message-composer-input):focus,
:slotted(.discord-message-composer-input):focus-visible,
.discord-message-composer-field :deep(.discord-message-composer-input:focus),
.discord-message-composer-field :deep(.discord-message-composer-input:focus-visible) {
	outline: none;
	box-shadow: none;
}

.discord-message-composer-input::placeholder,
:slotted(.discord-message-composer-input)::placeholder,
.discord-message-composer-field :deep(.discord-message-composer-input::placeholder) {
	color: var(--discord-message-composer-muted);
	opacity: 1;
}

.discord-message-composer-actions {
	@apply flex shrink-0 items-center gap-0.5;
}

.discord-message-composer-action-icon {
	@apply size-6;
}

/* Desktop: hide mobile-only chrome (leading apps/gift, pill emoji, send/mic). */
.discord-message-composer-mobile-leading,
.discord-message-composer-emoji,
.discord-message-composer-send {
	display: none;
}

@media (width < 40rem) {
	.discord-message-composer-action-secondary {
		display: none;
	}
}

@media (width < 30rem) {
	.discord-message-composer-action-optional {
		display: none;
	}

	.discord-message-composer {
		@apply mx-3 mb-3;
	}
}

/*
 * Discord mobile composer (< md):
 * empty:  + · apps · gift · pill(input + emoji) · mic
 * typed / slash-open:  + · pill(input + emoji) · blurple circular send
 */
@media (width < 48rem) {
	.discord-message-composer {
		@apply mx-0 mb-0 h-auto gap-1.5 rounded-none px-2 py-2;
		background-color: transparent;
		border: none;
		box-shadow: none;
	}

	.discord-message-composer-add {
		@apply size-9 rounded-full;
		background-color: var(--discord-message-composer-add-bg);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-add:hover {
		background-color: var(--discord-message-composer-hover);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-add-icon {
		@apply size-5;
	}

	.discord-message-composer-mobile-leading {
		@apply flex shrink-0 items-center gap-1.5;
	}

	.discord-message-composer-has-value .discord-message-composer-mobile-leading {
		display: none;
	}

	/* Keep the close (X) control visible while the App Launcher sheet is open. */
	.discord-message-composer-apps-open .discord-message-composer-mobile-leading {
		@apply flex;
	}

	.discord-message-composer-apps-open .discord-message-composer-gift-mobile {
		display: none;
	}

	.discord-message-composer-mobile-action {
		@apply size-9 rounded-full;
		background-color: var(--discord-message-composer-add-bg);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-mobile-action:hover {
		background-color: var(--discord-message-composer-hover);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-mobile-action-icon {
		@apply size-5;
	}

	.discord-message-composer-field {
		@apply h-9 min-w-0 flex-1 gap-0.5 rounded-full py-0 pr-1.5 pl-3;
		background-color: var(--discord-message-composer-pill-bg);
	}

	.discord-message-composer-input,
	:slotted(.discord-message-composer-input),
	.discord-message-composer-field :deep(.discord-message-composer-input) {
		@apply h-full px-0 text-[15px] leading-none;
	}

	.discord-message-composer-emoji {
		@apply inline-flex size-8 shrink-0;
		color: var(--discord-message-composer-muted);
	}

	.discord-message-composer-emoji:hover {
		background-color: transparent;
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-actions {
		display: none;
	}

	/* Empty: circular mic chrome (non-submitting). */
	.discord-message-composer-send {
		@apply inline-flex size-9 rounded-full;
		background-color: var(--discord-message-composer-add-bg);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-send:hover:not(:disabled) {
		background-color: var(--discord-message-composer-hover);
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-send:disabled {
		@apply cursor-default opacity-100;
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-send-icon {
		@apply size-5;
	}

	/* Typed / slash-open: blurple circular send with paper plane (Discord mobile). */
	.discord-message-composer-has-value .discord-message-composer-send:not(:disabled) {
		@apply rounded-full;
		background-color: var(--discord-message-composer-send-active);
		color: oklch(100% 0 0);
	}

	.discord-message-composer-has-value .discord-message-composer-send:hover:not(:disabled) {
		background-color: var(--discord-message-composer-send-active);
		color: oklch(100% 0 0);
		filter: brightness(1.08);
	}
}
</style>
