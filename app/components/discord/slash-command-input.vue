<template>
	<div class="discord-slash-command-input" role="group" :aria-label="ariaLabel">
		<button
			type="button"
			class="discord-slash-command-input-add"
			aria-label="Open attachment menu"
		>
			<UIcon name="ph:plus-bold" class="size-4.5" aria-hidden="true" />
		</button>

		<div class="discord-slash-command-input-field" tabindex="0">
			<DiscordSlashCommand
				v-if="name"
				:name="name"
				:subcommand="subcommand"
				:subcommand-group="subcommandGroup"
				:options="options"
			/>
			<span v-else class="discord-slash-command-input-value">{{ displayValue }}</span>
			<span class="discord-slash-command-input-cursor" aria-hidden="true" />
			<UIcon
				name="discord:emoji"
				class="discord-slash-command-input-emoji ml-auto size-4.5 shrink-0 md:hidden"
				aria-hidden="true"
			/>
		</div>

		<div class="discord-slash-command-input-tools" aria-hidden="true">
			<UIcon name="discord:gift" class="discord-slash-command-input-tool size-5" />
			<UIcon name="discord:gif" class="discord-slash-command-input-tool size-5" />
			<UIcon name="discord:sticker" class="discord-slash-command-input-tool size-5" />
			<UIcon name="discord:emoji" class="discord-slash-command-input-tool size-5" />
		</div>

		<button type="button" class="discord-slash-command-input-send" aria-label="Send message">
			<UIcon name="ph:paper-plane-tilt-fill" class="size-4" aria-hidden="true" />
		</button>
	</div>
</template>

<script lang="ts">
import type { SlashCommandOption } from "#shared/types/slash-command";

interface SlashCommandInputProps {
	name?: string;
	subcommand?: string;
	subcommandGroup?: string;
	options?: SlashCommandOption[];
	value?: string;
	/** Used for the empty-state Discord placeholder: `Message #channel`. */
	channelName?: string;
}
</script>

<script setup lang="ts">
import { formatSlashCommandDisplayName } from "#shared/utils/format-slash-command-display-name";

const {
	name,
	subcommand,
	subcommandGroup,
	options = [],
	value = "",
	channelName,
} = defineProps<SlashCommandInputProps>();

const displayValue = computed(() => {
	if (value) return value;
	if (channelName) return `Message #${channelName}`;
	return "";
});

const ariaLabel = computed(() => {
	if (name) {
		const path = formatSlashCommandDisplayName({
			commandName: name,
			subcommand,
			subcommandGroup,
		});
		const optionText = options
			.map((option) => {
				const valueText = option.value ?? option.description ?? option.name;
				return `${option.name}: ${valueText}`;
			})
			.join(" ");
		return `Message input: /${path}${optionText ? ` ${optionText}` : ""}`;
	}

	return `Message input: ${displayValue.value}`;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-input {
	--discord-slash-command-input-bg: oklch(from var(--color-base-content) l c h / 0.08);
	--discord-slash-command-input-text: oklch(from var(--color-base-content) l c h / 0.95);
	--discord-slash-command-input-muted: oklch(from var(--color-base-content) l c h / 0.55);
	--discord-slash-command-input-cursor: oklch(from var(--color-base-content) l c h / 0.9);
	--discord-slash-command-input-send: var(--color-primary);

	@apply mx-3 mb-3 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 max-md:mx-2 max-md:mb-2 max-md:gap-2 max-md:px-2;
	background-color: var(--discord-slash-command-input-bg);
}

.discord-slash-command-input-add {
	@apply inline-flex size-6 shrink-0 items-center justify-center rounded-full border-0 p-0 max-md:size-8;
	color: var(--discord-slash-command-input-muted);
	background-color: oklch(from var(--color-base-content) l c h / 0.12);
}

.discord-slash-command-input-field {
	@apply flex min-w-0 flex-1 items-center overflow-x-auto font-whitney text-sm;
	color: var(--discord-slash-command-input-text);
}

.discord-slash-command-input-value {
	@apply truncate text-muted;
}

.discord-slash-command-input-cursor {
	@apply ml-px inline-block h-4 w-px shrink-0;
	background-color: var(--discord-slash-command-input-cursor);
	animation: discord-slash-command-input-cursor-blink 1.1s step-end infinite;
}

.discord-slash-command-input-tools {
	@apply hidden shrink-0 items-center gap-3 md:flex;
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-tool {
	@apply size-5;
}

.discord-slash-command-input-emoji {
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-send {
	@apply inline-flex size-9 shrink-0 items-center justify-center rounded-full border-0 p-0 md:hidden;
	background-color: var(--discord-slash-command-input-send);
	color: var(--color-primary-content);
}

@keyframes discord-slash-command-input-cursor-blink {
	0%,
	49% {
		opacity: 1;
	}

	50%,
	100% {
		opacity: 0;
	}
}
</style>
