<template>
	<!-- The status ring cuts the dot out of this surface, so it takes the same colour. -->
	<aside
		:class="
			cn(
				'discord-member-list flex min-h-0 w-60 shrink-0 flex-col overflow-hidden border-l border-newt-border bg-newt-bg-surface font-whitney text-newt-text-primary [--newt-status-ring:var(--newt-bg-surface)]',
				props.class,
			)
		"
		:aria-label="label ?? ts('discord.member_list.label')"
	>
		<ScrollArea class="h-full min-h-0 flex-1">
			<div class="px-2 py-3">
				<MemberListSection
					v-for="section of sections"
					:key="section.id"
					:offline="section.offline"
				>
					<MemberListHeading>
						{{ section.label }} — {{ section.members.length }}
					</MemberListHeading>
					<MemberList>
						<MemberListItem
							v-for="member of section.members"
							:key="member.id"
							class="min-h-10 gap-3 py-0.5"
						>
							<template v-if="member.rowBackground" #decoration>
								<span
									class="block size-full bg-cover bg-center bg-no-repeat"
									:style="{ backgroundImage: member.rowBackground }"
								/>
							</template>
							<StatusIndicator class="shrink-0">
								<Avatar size="md">
									<AvatarImage v-if="member.avatar" :src="member.avatar" />
									<AvatarFallback>
										<UIcon
											:name="member.icon ?? 'ph:user-fill'"
											class="size-5"
											aria-hidden="true"
										/>
									</AvatarFallback>
								</Avatar>
								<StatusDot
									v-if="showPresence(member, section.offline)"
									:status="memberPresence(member)"
									:label="ts(PresenceLabelKeys[memberPresence(member)])"
								/>
							</StatusIndicator>
							<MemberListInfo class="flex-1">
								<MemberListNameRow>
									<MemberListName
										:color="member.color"
										class="text-base leading-5"
									>
										{{ member.name }}
									</MemberListName>
									<MemberListAppTag
										v-if="member.app"
										:verified="member.verified"
										:label="ts('discord.member_list.app')"
										:verified-label="ts('discord.member_list.verified_app')"
									/>
								</MemberListNameRow>
								<MemberListRole v-if="secondaryText(member, section.pinned)">
									{{ secondaryText(member, section.pinned) }}
								</MemberListRole>
							</MemberListInfo>
						</MemberListItem>
					</MemberList>
				</MemberListSection>
			</div>
		</ScrollArea>
	</aside>
</template>

<script lang="ts">
interface MemberListProps {
	online: readonly DiscordMemberListMember[];
	offline: readonly DiscordMemberListMember[];
	label?: string;
	showRoles?: boolean;
	class?: HTMLAttributes["class"];
}

interface MemberSection {
	id: string;
	label: string;
	members: readonly DiscordMemberListMember[];
	offline: boolean;
	/** Hoisted / pinned role group (Discord “Display separately”). */
	pinned: boolean;
}

interface PinnedRoleGroup {
	role: string;
	members: DiscordMemberListMember[];
}

type MemberPresence = NonNullable<DiscordMemberListMember["presence"]>;

const PresenceLabelKeys = {
	online: "discord.member_list.online",
	idle: "discord.member_list.idle",
	dnd: "discord.member_list.dnd",
	offline: "discord.member_list.offline",
} as const satisfies Record<MemberPresence, string>;
</script>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import type { DiscordMemberListMember } from "~/types/discord";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	MemberList,
	MemberListAppTag,
	MemberListHeading,
	MemberListInfo,
	MemberListItem,
	MemberListName,
	MemberListNameRow,
	MemberListRole,
	MemberListSection,
} from "~/components/ui/member-list";
import { ScrollArea } from "~/components/ui/scrollbar";
import { StatusDot, StatusIndicator } from "~/components/ui/status-indicator";

const { ts } = useI18n();
const props = defineProps<MemberListProps>();

const sections = computed<MemberSection[]>(() => {
	const pinnedGroups = new Map<string, PinnedRoleGroup>();
	const onlineRest: DiscordMemberListMember[] = [];

	for (const member of props.online) {
		if (member.pinned && member.role) {
			const existing = pinnedGroups.get(member.role);
			if (existing) {
				existing.members.push(member);
			} else {
				pinnedGroups.set(member.role, {
					role: member.role,
					members: [member],
				});
			}
			continue;
		}
		onlineRest.push(member);
	}

	const next: MemberSection[] = [];

	for (const group of pinnedGroups.values()) {
		next.push({
			id: `role-${group.role}`,
			label: group.role,
			members: group.members,
			offline: false,
			pinned: true,
		});
	}

	if (onlineRest.length > 0) {
		next.push({
			id: "online",
			label: ts("discord.member_list.online"),
			members: onlineRest,
			offline: false,
			pinned: false,
		});
	}

	if (props.offline.length > 0) {
		next.push({
			id: "offline",
			label: ts("discord.member_list.offline"),
			members: props.offline,
			offline: true,
			pinned: false,
		});
	}

	return next;
});

function memberPresence(member: DiscordMemberListMember): MemberPresence {
	return member.presence ?? "online";
}

/** Gateway presence pip — hidden for offline rows and HTTP-only (serverless) apps. */
function showPresence(member: DiscordMemberListMember, sectionOffline: boolean) {
	return !sectionOffline && !member.http;
}

function secondaryText(member: DiscordMemberListMember, inPinnedRoleSection: boolean) {
	// Role is already the section heading for hoisted groups — only show status/activity.
	if (inPinnedRoleSection) {
		return member.description;
	}
	if (props.showRoles && member.role && member.description) {
		return `${member.role} · ${member.description}`;
	}
	if (props.showRoles && member.role) {
		return member.role;
	}
	return member.description;
}
</script>
