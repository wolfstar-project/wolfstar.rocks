<template>
	<!--
		The avatar size and gutter feed the reply spine in `DiscordMessageReply`.
		The content inherits the row's colour, so a caller's `text-*` class reaches it.
	-->
	<MessageGroup
		as="article"
		class="discord-message w-full font-whitney text-newt-text-message [--message-reply-avatar-size:2rem] [--message-reply-gutter:1rem] md:[--message-reply-avatar-size:3rem]"
		:class="reply && 'gap-y-1.5'"
		:with-reply="Boolean(reply)"
		:ephemeral
		:aria-label="ts('discord.message.from', { name: profile.name })"
	>
		<MessageGroupAvatar>
			<DiscordAvatar :user="name" size="medium" />
		</MessageGroupAvatar>
		<MessageGroupReply v-if="reply">
			<DiscordMessageReply v-bind="reply" />
		</MessageGroupReply>
		<MessageGroupBody>
			<MessageGroupHeader>
				<MessageGroupAuthor>{{ profile.name }}</MessageGroupAuthor>
				<MessageGroupBotTag
					v-if="profile.app"
					:verified="profile.verified"
					:aria-label="ts('discord.message.verified_badge')"
				>
					APP
				</MessageGroupBotTag>
				<MessageGroupTime v-if="timestamp" :datetime>{{ timestamp }}</MessageGroupTime>
			</MessageGroupHeader>
			<MessageGroupContent class="text-inherit"><slot></slot></MessageGroupContent>
			<MessageGroupEphemeralNotice
				v-if="ephemeral"
				:aria-label="ts('discord.message.ephemeral_notice')"
			>
				<UIcon name="ph:eye-duotone" aria-hidden="true" />
				{{ ts("discord.message.only_you") }} •
				<MessageGroupEphemeralAction :aria-label="ts('discord.message.dismiss_aria')">
					{{ ts("discord.message.dismiss") }}
				</MessageGroupEphemeralAction>
			</MessageGroupEphemeralNotice>
		</MessageGroupBody>
	</MessageGroup>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface MessageProps {
	name: ProfileName;
	ephemeral?: boolean;
	reply?: MessageReply;
	timestamp?: string;
	datetime?: string;
}

interface MessageSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import type { MessageReply } from "~/types/discord";
import {
	MessageGroup,
	MessageGroupAuthor,
	MessageGroupAvatar,
	MessageGroupBody,
	MessageGroupBotTag,
	MessageGroupContent,
	MessageGroupEphemeralAction,
	MessageGroupEphemeralNotice,
	MessageGroupHeader,
	MessageGroupReply,
	MessageGroupTime,
} from "~/components/ui/message-group";

const { ts } = useI18n();
defineSlots<MessageSlots>();

const { name, ephemeral, reply, timestamp, datetime } = defineProps<MessageProps>();
const profile = computed(() => Profiles[name]);
</script>
