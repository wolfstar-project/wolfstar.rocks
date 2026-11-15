<template>
	<!-- The reply's spine starts above the centre of the avatar, so the row says how big it is. -->
	<MessageGroup
		as="article"
		class="discord-message w-full font-whitney [--newt-message-group-avatar-size:2rem] md:[--newt-message-group-avatar-size:3rem]"
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
					:label="ts('discord.message.app_badge')"
					:verified-label="ts('discord.message.verified_badge')"
				>
					APP
				</MessageGroupBotTag>
				<MessageGroupTime v-if="timestamp" :datetime>{{ timestamp }}</MessageGroupTime>
			</MessageGroupHeader>
			<MessageGroupContent><slot></slot></MessageGroupContent>
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
