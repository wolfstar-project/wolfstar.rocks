<template>
	<div class="discord-slash-command-input" role="group" :aria-label="ariaLabel">
		<button
			type="button"
			class="discord-slash-command-input-add"
			aria-label="Open attachment menu"
		>
			<UIcon name="ph:plus-bold" class="size-4.5" aria-hidden="true" />
		</button>

		<div class="discord-slash-command-input-field">
			<DiscordSlashCommand
				v-if="name"
				:name="name"
				:subcommand="subcommand"
				:subcommand-group="subcommandGroup"
				:options="options"
			/>
			<span v-else class="discord-slash-command-input-value">{{ value }}</span>
			<span class="discord-slash-command-input-cursor" aria-hidden="true" />
			<UIcon
				name="discord:emoji"
				class="discord-slash-command-input-emoji ml-auto size-4.5 shrink-0 md:hidden"
				aria-hidden="true"
			/>
		</div>

		<div class="discord-slash-command-input-tools" aria-hidden="true">
			<UIcon name="discord:gift" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:gif" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:sticker" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:emoji" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:apps" class="discord-slash-command-input-tool size-4.5" />
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
} = defineProps<SlashCommandInputProps>();

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

	return `Message input: ${value}`;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-input {
	--discord-slash-command-input-bg: oklch(32.11% 0.0094 268.56);
	--discord-slash-command-input-field-bg: oklch(27.39% 0.0055 264.46);
	--discord-slash-command-input-text: oklch(100% 0 0);
	--discord-slash-command-input-muted: oklch(73.06% 0.0048 264.53);
	--discord-slash-command-input-cursor: oklch(100% 0 0);
	--discord-slash-command-input-send: oklch(57.7% 0.209 273.88);

	@apply flex min-h-11 items-center gap-3 px-3 py-2 max-md:gap-2 max-md:px-2;
	background-color: var(--discord-slash-command-input-bg);
}

.discord-slash-command-input-add {
	@apply inline-flex shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 max-md:size-9;
	color: var(--discord-slash-command-input-muted);

	@media (width < 48rem) {
		background-color: var(--discord-slash-command-input-field-bg);
	}
}

.discord-slash-command-input-field {
	@apply flex min-w-0 flex-1 items-center overflow-x-auto font-whitney text-sm max-md:rounded-full max-md:px-3 max-md:py-2;
	color: var(--discord-slash-command-input-text);

	@media (width < 48rem) {
		background-color: var(--discord-slash-command-input-field-bg);
	}
}

.discord-slash-command-input-value {
	@apply truncate;
}

.discord-slash-command-input-cursor {
	@apply ml-px inline-block h-4 w-px shrink-0;
	background-color: var(--discord-slash-command-input-cursor);
	animation: discord-slash-command-input-cursor-blink 1.1s step-end infinite;
}

.discord-slash-command-input-tools {
	@apply hidden shrink-0 items-center gap-2.5 md:flex;
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-tool {
	@apply size-4.5;
}

.discord-slash-command-input-emoji {
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-send {
	@apply inline-flex size-9 shrink-0 items-center justify-center rounded-full border-0 p-0 md:hidden;
	background-color: var(--discord-slash-command-input-send);
	color: oklch(100% 0 0);
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
