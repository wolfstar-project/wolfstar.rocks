<template>
	<!--
		The panel covers only the channel of the showcase. The page around it
		stays in use, so the dialog is not modal.
	-->
	<ChannelInfo
		class="discord-channel-info absolute inset-0 z-20 max-w-none font-whitney motion-safe:animate-in motion-safe:duration-180 motion-safe:ease-out motion-safe:fade-in motion-safe:slide-in-from-right-3"
		:label="ts('discord.channel_info.label', { name })"
		@close="emit('close')"
	>
		<ChannelInfoToolbar>
			<ChannelInfoAction :aria-label="ts('discord.channel_info.back')" @click="emit('close')">
				<UIcon name="ph:arrow-left-bold" class="size-5" aria-hidden="true" />
			</ChannelInfoAction>

			<!-- The showcase has no search, alerts or settings to open. -->
			<ChannelInfoActions>
				<ChannelInfoAction v-for="icon of DecorativeActionIcons" :key="icon" as="span">
					<UIcon :name="icon" class="size-5" />
				</ChannelInfoAction>
			</ChannelInfoActions>
		</ChannelInfoToolbar>

		<ChannelInfoIdentity>
			<ChannelInfoIcon>
				<UIcon name="discord:text-channel" class="block size-5" />
			</ChannelInfoIcon>
			<div class="min-w-0">
				<ChannelInfoName>{{ name }}</ChannelInfoName>
				<ChannelInfoType>{{ ts("discord.channel_info.text_channel") }}</ChannelInfoType>
			</div>
		</ChannelInfoIdentity>

		<Tabs v-model="activeTab" class="flex min-h-0 flex-1 flex-col">
			<TabsList
				class="mx-4 max-w-[calc(100%-2rem)] shrink-0"
				:aria-label="ts('discord.channel_info.sections')"
			>
				<TabsTrigger v-for="tab of ChannelInfoTabs" :key="tab.id" :value="tab.id">
					{{ ts(tab.labelKey) }}
				</TabsTrigger>
			</TabsList>

			<TabsContent
				v-for="tab of ChannelInfoTabs"
				:key="tab.id"
				:value="tab.id"
				class="flex min-h-0 flex-1 flex-col"
			>
				<ChannelInfoPanel v-if="tab.id === 'members'" class="overflow-hidden p-0">
					<DiscordMemberList
						class="discord-channel-info-members h-full w-full border-0 bg-transparent"
						:online
						:offline
						show-roles
						:label="ts('discord.channel_info.members_in', { name })"
					/>
				</ChannelInfoPanel>

				<ChannelInfoPanel v-else-if="tab.id === 'threads'">
					<ChannelInfoEmpty>
						<ChannelInfoEmptyIcon>
							<UIcon name="discord:threads" class="size-8" />
						</ChannelInfoEmptyIcon>
						<ChannelInfoEmptyTitle>
							{{ ts("discord.channel_info.no_threads") }}
						</ChannelInfoEmptyTitle>
						<ChannelInfoEmptyBody>
							{{ ts("discord.channel_info.threads_hint") }}
						</ChannelInfoEmptyBody>
						<Button class="mt-2 rounded-full" disabled>
							{{ ts("discord.channel_info.create_thread") }}
						</Button>
					</ChannelInfoEmpty>
				</ChannelInfoPanel>

				<ChannelInfoPanel v-else>
					<ChannelInfoEmpty>
						<ChannelInfoEmptyBody>
							{{ ts("discord.channel_info.no_results") }}<br />
							{{ ts("discord.channel_info.no_results_hint") }}
						</ChannelInfoEmptyBody>
					</ChannelInfoEmpty>
				</ChannelInfoPanel>
			</TabsContent>
		</Tabs>
	</ChannelInfo>
</template>

<script lang="ts">
type ChannelInfoTabId = "members" | "media" | "pins" | "threads" | "links" | "files";

interface ChannelInfoTab {
	id: ChannelInfoTabId;
	labelKey: string;
}

interface ChannelInfoProps {
	name: string;
	online: readonly DiscordMemberListMember[];
	offline: readonly DiscordMemberListMember[];
	/** Initial tab — defaults to Members like Discord mobile. */
	initialTab?: ChannelInfoTabId;
}

const ChannelInfoTabs = [
	{ id: "members", labelKey: "discord.channel_info.tabs.members" },
	{ id: "media", labelKey: "discord.channel_info.tabs.media" },
	{ id: "pins", labelKey: "discord.channel_info.tabs.pins" },
	{ id: "threads", labelKey: "discord.channel_info.tabs.threads" },
	{ id: "links", labelKey: "discord.channel_info.tabs.links" },
	{ id: "files", labelKey: "discord.channel_info.tabs.files" },
] as const satisfies readonly ChannelInfoTab[];

const DecorativeActionIcons = ["discord:search", "discord:notifications", "ph:gear-six"] as const;

interface ChannelInfoEmits {
	close: [];
}
</script>

<script setup lang="ts">
import type { DiscordMemberListMember } from "~/types/discord";
import { Button } from "~/components/ui/button";
import {
	ChannelInfo,
	ChannelInfoAction,
	ChannelInfoActions,
	ChannelInfoEmpty,
	ChannelInfoEmptyBody,
	ChannelInfoEmptyIcon,
	ChannelInfoEmptyTitle,
	ChannelInfoIcon,
	ChannelInfoIdentity,
	ChannelInfoName,
	ChannelInfoPanel,
	ChannelInfoToolbar,
	ChannelInfoType,
} from "~/components/ui/channel-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const { ts } = useI18n();
const { name, online, offline, initialTab = "members" } = defineProps<ChannelInfoProps>();

const emit = defineEmits<ChannelInfoEmits>();

const activeTab = ref<string>(initialTab);
</script>
