<template>
	<ReplyPreview
		class="discord-message-reply font-whitney"
		role="complementary"
		:aria-label="ariaLabel"
	>
		<DiscordAvatar :user size="tiny" class="shrink-0" />
		<ReplyPreviewAuthor :class="kind === 'message' && 'font-semibold'">
			{{ profile.name }}
		</ReplyPreviewAuthor>
		<template v-if="kind === 'command'">
			<ReplyPreviewAction>used</ReplyPreviewAction>
			<ReplyPreviewCommand>
				<template #icon><LazyIconsApp aria-hidden="true" /></template>
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
