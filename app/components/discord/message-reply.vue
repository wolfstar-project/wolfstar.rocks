<template>
	<div
		class="discord-message-reply"
		:class="{ 'discord-message-reply-kind-command': kind === 'command' }"
		role="complementary"
		:aria-label="ariaLabel"
	>
		<span class="discord-message-reply-spine" aria-hidden="true" />
		<DiscordAvatar :user="user" size="tiny" class="discord-message-reply-avatar" />
		<span
			class="discord-message-reply-username"
			:class="{ 'discord-message-reply-username-emphasis': kind === 'message' }"
		>
			{{ profile.name }}
		</span>
		<template v-if="kind === 'command'">
			<span class="discord-message-reply-action">used</span>
			<span class="discord-message-reply-command">
				<LazyIconsApp class="discord-message-reply-command-icon" aria-hidden="true" />
				<span class="discord-message-reply-command-name">{{ formattedCommandName }}</span>
			</span>
		</template>
		<span v-else class="discord-message-reply-preview">{{ previewContent }}</span>
	</div>
</template>

<script lang="ts">
import type { MessageReplyComponentProps } from "~/types/discord";
</script>

<script setup lang="ts">
const { ts } = useI18n();
const { kind, user, commandName, subcommand, subcommandGroup, content } =
	defineProps<MessageReplyComponentProps>();

const profile = computed(() => Profiles[user]);

const formattedCommandName = computed(() => {
	if (kind !== "command" || commandName === undefined) {
		return "";
	}

	return formatSlashCommandDisplayName({
		commandName,
		subcommand,
		subcommandGroup,
	});
});

const previewContent = computed(() => {
	if (kind !== "message" || content === undefined) {
		return "";
	}

	return content;
});

const ariaLabel = computed(() => {
	if (kind === "command") {
		return ts("discord.reply.used_command", {
			command: formattedCommandName.value,
			name: profile.value.name,
		});
	}

	return ts("discord.reply.replying_to", {
		name: profile.value.name,
		preview: previewContent.value,
	});
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-message-reply {
	--message-reply-spine-width: 2px;
	--message-reply-spine-color: oklch(from var(--color-base-content) l c h / 0.2);
	--message-reply-roundness: 0px;
	/* Discord's command chip: link-blue text on a blurple wash. */
	--discord-command-chip-bg: oklch(57.7% 0.209 273.88 / 0.24);
	--discord-command-chip-text: oklch(70.5% 0.155 252);
	--discord-interaction-muted: var(--discord-chrome-muted);

	@apply relative mb-0 flex min-w-0 flex-nowrap items-center gap-x-1 font-whitney text-xs leading-4;
}

@media (width >= 48rem) {
	.discord-message-reply {
		--message-reply-roundness: 6px;
	}
}

.discord-message-reply-avatar {
	@apply shrink-0;
}

.discord-message-reply-username {
	@apply shrink-0 font-medium;
}

.discord-message-reply-username-emphasis {
	@apply font-semibold;
}

.discord-message-reply-action {
	@apply shrink-0 font-normal;
	color: var(--discord-interaction-muted);
}

.discord-message-reply-command {
	@apply inline-flex max-w-full min-w-0 shrink items-center gap-0.5 px-1 font-medium;
	border-radius: 3px;
	background-color: var(--discord-command-chip-bg);
	color: var(--discord-command-chip-text);
}

.discord-message-reply-command-icon {
	@apply size-3 shrink-0;
}

.discord-message-reply-command-name {
	@apply truncate;
}

.discord-message-reply-preview {
	@apply min-w-0 truncate font-normal;
	color: var(--discord-interaction-muted);
}

@variant theme-light {
	.discord-message-reply {
		--discord-command-chip-bg: oklch(57.7% 0.209 273.88 / 0.12);
		--discord-command-chip-text: oklch(45.08% 0.281 265.53);
	}
}

.discord-message-reply-spine {
	--message-reply-spine-hook: calc(50% + 0.125rem);

	position: absolute;
	top: 50%;
	right: calc(100% + 0.25rem);
	width: calc(0.5 * var(--message-reply-avatar-size) + var(--message-reply-gutter));
	height: var(--message-reply-spine-hook);
	margin-top: calc(-0.5 * var(--message-reply-spine-width));
	border-top: var(--message-reply-spine-width) solid var(--message-reply-spine-color);
	border-left: var(--message-reply-spine-width) solid var(--message-reply-spine-color);
	border-top-left-radius: var(--message-reply-roundness);
	pointer-events: none;
}
</style>
