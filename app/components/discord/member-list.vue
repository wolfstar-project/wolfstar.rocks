<template>
	<aside
		:class="
			cn(
				'discord-member-list flex min-h-0 w-60 shrink-0 flex-col overflow-hidden border-l border-newt-border bg-newt-bg-surface font-whitney text-newt-text-primary',
				props.class,
			)
		"
		:aria-label="label ?? ts('discord.member_list.label')"
	>
		<ScrollArea class="h-full min-h-0 flex-1">
			<div class="px-2 py-3">
				<MemberListSection
					v-for="(section, index) of sections"
					:key="section.id"
					:offline="section.offline"
				>
					<MemberListHeading :id="`${headingIdPrefix}-${index}`">
						{{ section.label }} — {{ section.members.length }}
					</MemberListHeading>
					<MemberList :aria-labelledby="`${headingIdPrefix}-${index}`">
						<MemberListItem
							v-for="member of section.members"
							:key="member.id"
							class="min-h-10 cursor-default gap-3 py-0.5"
							:class="
								member.rowBackground &&
								'bg-cover bg-center bg-no-repeat hover:shadow-[inset_0_0_0_999px_var(--newt-bg-hover)]'
							"
							:style="
								member.rowBackground
									? { backgroundImage: member.rowBackground }
									: undefined
							"
						>
							<StatusIndicator aria-hidden="true" class="shrink-0">
								<Avatar class="size-8">
									<AvatarImage v-if="member.avatar" :src="member.avatar" />
									<AvatarFallback v-else>
										<UIcon
											:name="member.icon ?? 'ph:user-fill'"
											class="size-5"
										/>
									</AvatarFallback>
								</Avatar>
								<StatusDot
									v-if="showPresence(member, section.offline)"
									:status="memberPresence(member)"
									class="border-newt-bg-surface"
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
										:aria-label="
											ts(
												member.verified
													? 'discord.member_list.verified_app'
													: 'discord.member_list.app',
											)
										"
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
const headingIdPrefix = useId();

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

function memberPresence(member: DiscordMemberListMember) {
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
