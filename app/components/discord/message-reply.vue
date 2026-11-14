<template>
	<!-- newt's elbow sits inside the preview; ours hooks over the avatar column. -->
	<ReplyPreview
		class="discord-message-reply mb-0 ps-0 font-whitney before:hidden"
		role="complementary"
		:aria-label="ariaLabel"
	>
		<span class="discord-message-reply-spine" aria-hidden="true" />
		<DiscordAvatar :user size="tiny" class="shrink-0" />
		<ReplyPreviewAuthor :class="kind === 'message' && 'font-semibold'">
			{{ profile.name }}
		</ReplyPreviewAuthor>
		<template v-if="kind === 'command'">
			<ReplyPreviewAction>used</ReplyPreviewAction>
			<ReplyPreviewCommand>
				<LazyIconsApp class="me-0.5 inline size-3 align-[-0.125em]" aria-hidden="true" />
				{{ formattedCommandName }}
			</ReplyPreviewCommand>
		</template>
		<ReplyPreviewText v-else>{{ previewContent }}</ReplyPreviewText>
	</ReplyPreview>
</template>

<script setup lang="ts">
import type { MessageReplyComponentProps } from "~/types/discord";
import {
	ReplyPreview,
	ReplyPreviewAction,
	ReplyPreviewAuthor,
	ReplyPreviewCommand,
	ReplyPreviewText,
} from "~/components/ui/reply-preview";

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
/*
 * The spine runs from above the message avatar's centre to this line, as
 * Discord draws it. `DiscordMessage` sets the avatar size and gutter.
 */
.discord-message-reply-spine {
	--message-reply-spine-width: 2px;

	position: absolute;
	top: 50%;
	right: calc(100% + 0.25rem);
	width: calc(0.5 * var(--message-reply-avatar-size) + var(--message-reply-gutter));
	height: calc(50% + 0.125rem);
	margin-top: calc(-0.5 * var(--message-reply-spine-width));
	border-top: var(--message-reply-spine-width) solid var(--newt-border);
	border-left: var(--message-reply-spine-width) solid var(--newt-border);
	border-top-left-radius: 6px;
	pointer-events: none;
}
</style>
