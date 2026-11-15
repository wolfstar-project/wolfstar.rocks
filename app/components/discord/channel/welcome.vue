<template>
	<ChannelWelcome class="discord-channel-welcome pb-0 font-whitney sm:px-6 sm:pt-12">
		<ChannelWelcomeIcon>
			<UIcon name="discord:text-channel" class="size-10" />
		</ChannelWelcomeIcon>
		<ChannelWelcomeTitle class="sm:text-[32px]">
			{{ ts("discord.welcome.title", { name: channelName }) }}
		</ChannelWelcomeTitle>
		<ChannelWelcomeDescription>
			{{ ts("discord.welcome.start", { name: channelName })
			}}<template v-if="topic">{{ ` ${topic}` }}</template>
		</ChannelWelcomeDescription>
		<!-- Decorative: the showcase cannot edit the channel, so it is not a control. -->
		<ChannelWelcomeAction
			aria-hidden="true"
			tabindex="-1"
			class="pointer-events-none cursor-default"
		>
			<UIcon name="discord:edit" class="size-4 shrink-0" />
			<span>{{ ts("discord.welcome.edit") }}</span>
		</ChannelWelcomeAction>
		<ChannelWelcomeDate :date-time>{{ date }}</ChannelWelcomeDate>
	</ChannelWelcome>
</template>

<script lang="ts">
interface ChannelWelcomeProps {
	channelName: string;
	date: string;
	dateTime?: string;
	/** Channel topic appended after the welcome start sentence (Discord pattern). */
	topic?: string;
}
</script>

<script setup lang="ts">
import {
	ChannelWelcome,
	ChannelWelcomeAction,
	ChannelWelcomeDate,
	ChannelWelcomeDescription,
	ChannelWelcomeIcon,
	ChannelWelcomeTitle,
} from "~/components/ui/channel-welcome";

const { ts } = useI18n();
defineProps<ChannelWelcomeProps>();
</script>
