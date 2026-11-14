<template>
	<ChannelHeader
		class="discord-channel-header h-14 gap-2 px-2 font-whitney md:h-12 md:gap-3 md:ps-4 md:pe-3"
	>
		<!-- Narrow layout (Discord mobile): back + badge · #channel / Online · search. -->
		<span
			class="relative inline-flex size-10 shrink-0 items-center justify-center md:hidden"
			aria-hidden="true"
		>
			<UIcon name="ph:arrow-left-bold" class="size-5" />
			<span
				v-if="notificationCount > 0"
				data-slot="notification-badge"
				class="absolute top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-newt-danger px-1 text-[10px] font-bold text-newt-on-accent"
				>{{ notificationCount }}</span
			>
		</span>

		<button
			type="button"
			class="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-start text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-newt-text-link md:hidden"
			:aria-label="ts('discord.header.open_info', { name })"
			@click="emit('open-channel-info')"
		>
			<span class="flex min-w-0 items-center gap-1">
				<ChannelHeaderIcon>
					<UIcon :name="typeIcon" class="block size-4" />
				</ChannelHeaderIcon>
				<ChannelHeaderName class="min-w-0 shrink">{{ name }}</ChannelHeaderName>
				<UIcon
					name="ph:caret-right-bold"
					class="size-3 shrink-0 text-newt-text-muted"
					aria-hidden="true"
				/>
			</span>
			<ChannelHeaderOnline v-if="onlineCount !== undefined" class="mt-0.5 flex">
				{{ onlineCount }} Online
			</ChannelHeaderOnline>
		</button>

		<span
			class="inline-flex size-10 shrink-0 items-center justify-center md:hidden"
			aria-hidden="true"
		>
			<UIcon name="discord:search" class="size-5" />
		</span>

		<!-- Desktop layout. -->
		<ChannelHeaderInfo class="hidden md:flex">
			<ChannelHeaderIcon>
				<UIcon :name="typeIcon" class="block size-5" />
			</ChannelHeaderIcon>
			<ChannelHeaderName class="min-w-0 shrink">{{ name }}</ChannelHeaderName>
			<template v-if="topic">
				<ChannelHeaderDivider />
				<ChannelHeaderTopic>{{ topic }}</ChannelHeaderTopic>
			</template>
		</ChannelHeaderInfo>

		<ChannelHeaderToolbar class="hidden md:flex">
			<ChannelHeaderAction
				v-for="action of ToolbarActions"
				:key="action.id"
				:active="action.id === 'members' && membersOpen"
				:aria-label="action.id === 'members' ? membersToggleLabel : ts(action.labelKey)"
				:aria-pressed="action.id === 'members' ? membersOpen : undefined"
				@click="action.id === 'members' ? toggleMembers() : undefined"
			>
				<UIcon :name="action.icon" class="size-6" aria-hidden="true" />
			</ChannelHeaderAction>

			<!-- Decorative: the showcase has no search, so keep it out of the tab order. -->
			<ChannelHeaderSearch
				:placeholder="searchPlaceholderText"
				aria-hidden="true"
				tabindex="-1"
				class="cursor-default"
			/>
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

type ToolbarActionId = "threads" | "notifications" | "pins" | "members";

interface ToolbarAction {
	id: ToolbarActionId;
	icon: string;
	labelKey: string;
}

const TypeIcons = {
	text: "discord:text-channel",
} as const satisfies Record<ChannelHeaderType, string>;

/**
 * Order matches Discord desktop channel header:
 * threads → notifications → pins → members, then search.
 */
const ToolbarActions = [
	{ id: "threads", icon: "discord:threads", labelKey: "discord.header.threads" },
	{
		id: "notifications",
		icon: "discord:notifications",
		labelKey: "discord.header.notifications",
	},
	{ id: "pins", icon: "discord:pins", labelKey: "discord.header.pins" },
	{ id: "members", icon: "discord:members", labelKey: "discord.header.show_members" },
] as const satisfies readonly ToolbarAction[];

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
	ChannelHeaderDivider,
	ChannelHeaderIcon,
	ChannelHeaderInfo,
	ChannelHeaderName,
	ChannelHeaderOnline,
	ChannelHeaderSearch,
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

const membersToggleLabel = computed(() =>
	ts(membersOpen ? "discord.header.hide_members" : "discord.header.show_members"),
);

function toggleMembers() {
	emit("toggle-members");
	emit("update:membersOpen", !membersOpen);
}
</script>
