<template>
	<ChannelHeader
		class="discord-channel-header min-h-14 gap-2 px-2 font-whitney md:min-h-12 md:gap-3 md:ps-4 md:pe-3"
	>
		<!--
			Narrow layout (Discord mobile): back + badge, #channel / Online, search.
			The showcase has no channel list and no search, so back and search are decoration.
		-->
		<ChannelHeaderBack
			as="span"
			:badge="notificationCount > 0 ? notificationCount : undefined"
			class="h-10 min-w-10 md:hidden"
		/>

		<div class="me-auto flex min-w-0 flex-col md:hidden">
			<ChannelHeaderTitle
				class="py-0.5"
				:aria-label="ts('discord.header.open_info', { name })"
				@click="emit('open-channel-info')"
			>
				<ChannelHeaderIcon>
					<UIcon :name="typeIcon" class="block size-4" />
				</ChannelHeaderIcon>
				<ChannelHeaderName>{{ name }}</ChannelHeaderName>
			</ChannelHeaderTitle>
			<ChannelHeaderOnline v-if="onlineCount !== undefined" class="ps-1.5">
				{{ ts("discord.header.online_count", { count: onlineCount }) }}
			</ChannelHeaderOnline>
		</div>

		<ChannelHeaderSearch
			as="span"
			compact
			:placeholder="searchPlaceholderText"
			class="size-10 md:hidden"
		/>

		<!-- Desktop layout. -->
		<ChannelHeaderInfo class="hidden md:flex">
			<ChannelHeaderIcon>
				<UIcon :name="typeIcon" class="block size-5" />
			</ChannelHeaderIcon>
			<ChannelHeaderName>{{ name }}</ChannelHeaderName>
			<template v-if="topic">
				<ChannelHeaderDivider />
				<ChannelHeaderTopic>{{ topic }}</ChannelHeaderTopic>
			</template>
		</ChannelHeaderInfo>

		<ChannelHeaderToolbar class="hidden md:flex">
			<!-- Only the member list toggle works in the showcase; the rest is decoration. -->
			<ChannelHeaderAction v-for="icon of DecorativeToolbarIcons" :key="icon" as="span">
				<UIcon :name="icon" class="size-6" />
			</ChannelHeaderAction>
			<ChannelHeaderAction
				:active="membersOpen"
				:aria-label="ts('discord.header.show_members')"
				@click="toggleMembers"
			>
				<UIcon name="discord:members" class="size-6" aria-hidden="true" />
			</ChannelHeaderAction>
			<ChannelHeaderSearch as="span" :placeholder="searchPlaceholderText" />
		</ChannelHeaderToolbar>
	</ChannelHeader>
</template>

<script lang="ts">
type ChannelHeaderType = "text";

interface ChannelHeaderProps {
	name: string;
	/** Discord channel kind — drives the leading type glyph. */
	type?: ChannelHeaderType;
	/** Channel topic shown after the name divider (desktop Discord header). */
	topic?: string;
	/** Placeholder shown in the decorative search field. */
	searchPlaceholder?: string;
	/** Guild name shown in the desktop header. */
	guildName?: string;
	/** Mobile header “X Online” count (Discord mobile channel chrome). */
	onlineCount?: number;
	/** Decorative notification badge on the mobile back control. */
	notificationCount?: number;
	/** Whether the member list sidebar is open (desktop Discord). */
	membersOpen?: boolean;
}

const TypeIcons = {
	text: "discord:text-channel",
} as const satisfies Record<ChannelHeaderType, string>;

/**
 * Order matches Discord desktop channel header:
 * threads → notifications → pins, then the member list toggle and search.
 */
const DecorativeToolbarIcons = [
	"discord:threads",
	"discord:notifications",
	"discord:pins",
] as const;

interface ChannelHeaderEmits {
	"update:membersOpen": [value: boolean];
	"toggle-members": [];
	/** Mobile: tap channel name to open Members / Media / Pins / … panel. */
	"open-channel-info": [];
}
</script>

<script setup lang="ts">
import {
	ChannelHeader,
	ChannelHeaderAction,
	ChannelHeaderBack,
	ChannelHeaderDivider,
	ChannelHeaderIcon,
	ChannelHeaderInfo,
	ChannelHeaderName,
	ChannelHeaderOnline,
	ChannelHeaderSearch,
	ChannelHeaderTitle,
	ChannelHeaderToolbar,
	ChannelHeaderTopic,
} from "~/components/ui/channel-header";

const { ts } = useI18n();
const {
	name,
	type = "text",
	topic,
	searchPlaceholder,
	guildName,
	onlineCount,
	notificationCount = 0,
	membersOpen = true,
} = defineProps<ChannelHeaderProps>();

const emit = defineEmits<ChannelHeaderEmits>();

const typeIcon = computed(() => TypeIcons[type]);

const searchPlaceholderText = computed(() => {
	if (guildName) {
		return ts("discord.header.search", { name: guildName });
	}
	return searchPlaceholder ?? ts("discord.header.search_plain");
});

function toggleMembers() {
	emit("toggle-members");
	emit("update:membersOpen", !membersOpen);
}
</script>
