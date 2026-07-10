<template>
	<div class="discord-message-command-reply" role="complementary" :aria-label="ariaLabel">
		<span class="discord-message-command-reply-spine" aria-hidden="true" />
		<span class="discord-message-command-reply-user">
			<DiscordAvatar :user="user" size="tiny" />
			<span class="discord-message-command-reply-username">{{ profile.name }}</span>
		</span>
		<span class="discord-message-command-reply-action-group">
			<span class="discord-message-command-reply-action">used</span>
			<LazyDiscordMention kind="app" class="discord-message-command-reply-command">
				{{ commandName }}
			</LazyDiscordMention>
		</span>
	</div>
</template>

<script lang="ts">
interface MessageCommandReplyProps {
	commandName: string;
	user: ProfileName;
}
</script>

<script setup lang="ts">
const { commandName, user } = defineProps<MessageCommandReplyProps>();

const profile = computed(() => Profiles[user]);

const ariaLabel = computed(() => `${profile.value.name} used the ${commandName} slash command`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-message-command-reply {
	--command-reply-spine-width: 2px;
	--command-reply-spine-color: oklch(from var(--color-base-content) l c h / 0.2);
	--command-reply-roundness: 6px;

	@apply relative mb-0 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm;
}

.discord-message-command-reply-user {
	@apply inline-flex items-center gap-1 font-bold;
}

.discord-message-command-reply-action-group {
	@apply inline-flex items-center gap-0.5;
}

.discord-message-command-reply-action {
	@apply shrink-0 text-base-content/70;
}

.discord-message-command-reply-command {
	@apply shrink-0;
}

.discord-message-command-reply-command:deep(.tag) {
	border-radius: 2px;
}

.discord-message-command-reply-spine {
	--command-reply-spine-hook: calc(50% + 0.125rem);

	position: absolute;
	top: 50%;
	right: calc(100% + 0.25rem);
	width: calc(0.5 * var(--command-reply-avatar-size) + var(--command-reply-gutter));
	height: var(--command-reply-spine-hook);
	margin-top: calc(-0.5 * var(--command-reply-spine-width));
	border-top: var(--command-reply-spine-width) solid var(--command-reply-spine-color);
	border-left: var(--command-reply-spine-width) solid var(--command-reply-spine-color);
	border-top-left-radius: var(--command-reply-roundness);
	pointer-events: none;
}
</style>
