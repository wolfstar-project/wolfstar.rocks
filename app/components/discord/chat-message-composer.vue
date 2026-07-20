<template>
	<div
		class="discord-message-composer"
		:class="{ 'discord-message-composer-has-value': hasValue }"
		role="group"
		:aria-label="composerLabel"
	>
		<button
			type="button"
			class="discord-message-composer-button discord-message-composer-add"
			aria-label="Open attachment menu"
			title="Attachments"
		>
			<UIcon
				name="ph:plus-bold"
				class="discord-message-composer-add-icon"
				aria-hidden="true"
			/>
		</button>

		<button
			type="button"
			class="discord-message-composer-button discord-message-composer-apps discord-message-composer-apps-mobile"
			aria-label="Open apps and commands"
			title="Apps"
			@click="emit('openApps')"
		>
			<UIcon name="discord:apps" class="size-5" aria-hidden="true" />
		</button>

		<div class="discord-message-composer-field">
			<input
				v-model="modelValue"
				type="text"
				class="discord-message-composer-input"
				:placeholder="displayPlaceholder"
				:aria-label="displayPlaceholder"
				readonly
				spellcheck="false"
			/>

			<button
				type="button"
				class="discord-message-composer-button discord-message-composer-emoji"
				aria-label="Choose an emoji"
				title="Choose an emoji"
			>
				<UIcon name="discord:emoji" class="size-5" aria-hidden="true" />
			</button>
		</div>

		<div class="discord-message-composer-actions">
			<button
				v-for="action of ComposerActions"
				:key="action.label"
				type="button"
				class="discord-message-composer-button discord-message-composer-action"
				:class="{
					'discord-message-composer-action-secondary': action.secondary,
					'discord-message-composer-action-optional': action.optional,
				}"
				:aria-label="action.label"
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
			aria-label="Send message"
			title="Send message"
			:disabled="!hasValue"
		>
			<UIcon name="ph:paper-plane-tilt-fill" class="size-5" aria-hidden="true" />
		</button>
	</div>
</template>

<script lang="ts">
interface MessageComposerProps {
	channelName: string;
	placeholder?: string;
}

interface ComposerAction {
	icon: string;
	label: string;
	secondary?: boolean;
	optional?: boolean;
	emitOpenApps?: boolean;
}

/** Desktop toolbar order matches Discord / Figma: gift · GIF · sticker · emoji · apps. */
const ComposerActions: readonly ComposerAction[] = [
	{ icon: "discord:gift", label: "Send a gift", secondary: true },
	{ icon: "discord:gif", label: "Open GIF picker" },
	{ icon: "discord:sticker", label: "Open sticker picker", optional: true },
	{ icon: "discord:emoji", label: "Select an emoji" },
	{ icon: "discord:apps", label: "Open apps and commands", optional: true, emitOpenApps: true },
];
</script>

<script setup lang="ts">
const { channelName, placeholder } = defineProps<MessageComposerProps>();

const modelValue = defineModel<string>({ default: "" });

const emit = defineEmits<{
	openApps: [];
}>();

const displayPlaceholder = computed(() => placeholder ?? `Message #${channelName}`);
const composerLabel = computed(() => `Message composer for ${channelName}`);
const hasValue = computed(() => modelValue.value.trim().length > 0);

function onComposerAction(action: ComposerAction) {
	if (action.emitOpenApps) {
		emit("openApps");
	}
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-message-composer {
	/* Discord-true dark surfaces (Figma / desktop client). */
	--discord-message-composer-bg: oklch(28.84% 0.007 272.93);
	--discord-message-composer-text: oklch(91.56% 0.004 272.93);
	--discord-message-composer-muted: oklch(71.01% 0.01 273.13);
	--discord-message-composer-hover: oklch(100% 0 0 / 0.06);
	--discord-message-composer-add-bg: oklch(19.34% 0.004 273.16);
	--discord-message-composer-pill-bg: oklch(28.84% 0.007 272.93);
	--discord-message-composer-send-active: oklch(57.74% 0.2091 273.85);
	--discord-message-composer-add-ring: oklch(71.01% 0.01 273.13);

	@apply mx-4 mb-4 flex h-11 min-w-0 shrink-0 items-center gap-1 rounded-lg px-3 font-whitney;
	background-color: var(--discord-message-composer-bg);
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

.discord-message-composer-button:focus-visible,
.discord-message-composer-input:focus-visible {
	@apply outline-2 outline-offset-1 outline-primary;
}

.discord-message-composer-add {
	@apply size-6 rounded-full;
	box-shadow: inset 0 0 0 1.5px var(--discord-message-composer-add-ring);
}

.discord-message-composer-add:hover {
	background-color: transparent;
	color: var(--discord-message-composer-text);
	box-shadow: inset 0 0 0 1.5px var(--discord-message-composer-text);
}

.discord-message-composer-add-icon {
	@apply size-3.5;
}

.discord-message-composer-field {
	@apply flex h-full min-w-0 flex-1 items-center;
}

.discord-message-composer-input {
	@apply h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-base leading-none outline-none;
	color: var(--discord-message-composer-text);
}

.discord-message-composer-input::placeholder {
	color: var(--discord-message-composer-muted);
	opacity: 1;
}

.discord-message-composer-actions {
	@apply flex shrink-0 items-center gap-0.5;
}

.discord-message-composer-action-icon {
	@apply size-6;
}

/* Mobile-only chrome: apps between +, send outside the field. */
.discord-message-composer-apps-mobile,
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

/* Discord mobile composer (< md): + · apps · pill(input + emoji) · send */
@media (width < 48rem) {
	.discord-message-composer {
		@apply mx-0 mb-0 h-auto gap-2 rounded-none px-3 py-2;
		background-color: transparent;
		box-shadow: none;
	}

	.discord-message-composer-add {
		@apply size-9;
		background-color: var(--discord-message-composer-add-bg);
		color: var(--discord-message-composer-text);
		box-shadow: none;
	}

	.discord-message-composer-add:hover {
		background-color: var(--discord-message-composer-hover);
		color: var(--discord-message-composer-text);
		box-shadow: none;
	}

	.discord-message-composer-add-icon {
		@apply size-4.5;
	}

	.discord-message-composer-apps-mobile {
		@apply inline-flex size-8;
		color: var(--discord-message-composer-muted);
	}

	.discord-message-composer-apps-mobile:hover {
		background-color: transparent;
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-field {
		@apply h-9 min-w-0 flex-1 gap-0.5 rounded-full py-0 pr-1.5 pl-3;
		background-color: var(--discord-message-composer-pill-bg);
	}

	.discord-message-composer-input {
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

	.discord-message-composer-send {
		@apply inline-flex size-8;
		color: var(--discord-message-composer-muted);
	}

	.discord-message-composer-send:hover:not(:disabled) {
		background-color: transparent;
		color: var(--discord-message-composer-text);
	}

	.discord-message-composer-send:disabled {
		@apply cursor-default;
		color: var(--discord-message-composer-muted);
		opacity: 0.55;
	}

	.discord-message-composer-has-value .discord-message-composer-send:not(:disabled) {
		color: var(--discord-message-composer-send-active);
	}
}
</style>
