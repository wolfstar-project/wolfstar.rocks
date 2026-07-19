<template>
	<div class="discord-message-composer" role="group" :aria-label="composerLabel">
		<button
			type="button"
			class="discord-message-composer-button discord-message-composer-add"
			aria-label="Open attachment menu"
			title="Attachments"
		>
			<UIcon name="ph:plus-bold" class="size-4" aria-hidden="true" />
		</button>

		<input
			type="text"
			class="discord-message-composer-input"
			:placeholder="displayPlaceholder"
			:aria-label="displayPlaceholder"
			readonly
			spellcheck="false"
		/>

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
			>
				<UIcon :name="action.icon" class="size-4.5" aria-hidden="true" />
			</button>
		</div>
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
}

const ComposerActions: readonly ComposerAction[] = [
	{ icon: "ph:bell", label: "Notifications" },
	{ icon: "ph:magic-wand", label: "App tools", secondary: true },
	{ icon: "ph:translate", label: "Translate", secondary: true },
	{ icon: "discord:gift", label: "Gift a user", secondary: true },
	{ icon: "discord:sticker", label: "Choose a sticker", optional: true },
	{ icon: "discord:emoji", label: "Choose an emoji" },
	{ icon: "ph:squares-four", label: "Other actions", optional: true },
];
</script>

<script setup lang="ts">
const { channelName, placeholder } = defineProps<MessageComposerProps>();

const displayPlaceholder = computed(() => placeholder ?? `Message #${channelName}`);
const composerLabel = computed(() => `Message composer for ${channelName}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-message-composer {
	--discord-message-composer-bg: oklch(from var(--color-base-content) l c h / 0.08);
	--discord-message-composer-text: oklch(from var(--color-base-content) l c h / 0.92);
	--discord-message-composer-muted: oklch(from var(--color-base-content) l c h / 0.58);
	--discord-message-composer-hover: oklch(from var(--color-base-content) l c h / 0.1);

	@apply mx-3 mb-3 flex h-11 min-w-0 shrink-0 items-center gap-1 rounded-lg px-1.5 font-whitney;
	background-color: var(--discord-message-composer-bg);
	color: var(--discord-message-composer-muted);
}

.discord-message-composer:focus-within {
	box-shadow: inset 0 0 0 1px oklch(from var(--color-primary) l c h / 0.55);
}

.discord-message-composer-button {
	@apply inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0;
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
	@apply rounded-full;
}

.discord-message-composer-input {
	@apply h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none;
	color: var(--discord-message-composer-text);
}

.discord-message-composer-input::placeholder {
	color: var(--discord-message-composer-muted);
	opacity: 1;
}

.discord-message-composer-actions {
	@apply flex shrink-0 items-center gap-0.5;
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
		@apply mx-2 mb-2;
	}
}
</style>
