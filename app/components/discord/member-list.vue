<template>
	<aside class="discord-member-list" :aria-label="label">
		<DiscordScrollbar always-show-track class="discord-member-list-scrollbar">
			<div class="discord-member-list-content">
				<section
					v-for="section of sections"
					:key="section.id"
					class="discord-member-list-section"
					:class="{ 'discord-member-list-section-offline': section.offline }"
				>
					<h2
						class="discord-member-list-heading"
						:class="{ 'discord-member-list-heading-role': section.pinned }"
					>
						{{ section.label }} — {{ section.members.length }}
					</h2>
					<ul class="discord-member-list-members">
						<li
							v-for="member of section.members"
							:key="member.id"
							class="discord-member-list-member"
							:class="{
								'discord-member-list-member-decorated': Boolean(
									member.rowBackground,
								),
							}"
							:style="memberRowStyle(member)"
						>
							<div class="discord-member-list-avatar" aria-hidden="true">
								<NuxtImg
									v-if="member.avatar"
									:src="member.avatar"
									:alt="`${member.name} avatar`"
									width="32"
									height="32"
								/>
								<UIcon
									v-else
									:name="member.icon ?? 'ph:user-fill'"
									class="size-5"
								/>
								<span
									v-if="!section.offline"
									class="discord-presence"
									:data-status="memberPresence(member)"
								/>
							</div>
							<div class="discord-member-list-identity">
								<div class="discord-member-list-name-row">
									<span class="discord-member-list-name">{{ member.name }}</span>
									<span
										v-if="member.app"
										class="discord-member-list-app"
										role="img"
										:aria-label="
											member.verified ? 'Verified application' : 'Application'
										"
									>
										<UIcon
											v-if="member.verified"
											name="ph:check-bold"
											class="size-2.5"
											aria-hidden="true"
										/>
										APP
									</span>
								</div>
								<span
									v-if="secondaryText(member, section.pinned)"
									class="discord-member-list-description"
								>
									{{ secondaryText(member, section.pinned) }}
								</span>
							</div>
						</li>
					</ul>
				</section>
			</div>
		</DiscordScrollbar>
	</aside>
</template>

<script lang="ts">
import type { DiscordMemberListMember, DiscordMemberPresence } from "~/types/discord";

interface MemberListProps {
	online: readonly DiscordMemberListMember[];
	offline: readonly DiscordMemberListMember[];
	label?: string;
	showRoles?: boolean;
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
const {
	online,
	offline,
	label = "Server members",
	showRoles = false,
} = defineProps<MemberListProps>();

const sections = computed<MemberSection[]>(() => {
	const pinnedGroups = new Map<string, PinnedRoleGroup>();
	const onlineRest: DiscordMemberListMember[] = [];

	for (const member of online) {
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
			label: "Online",
			members: onlineRest,
			offline: false,
			pinned: false,
		});
	}

	if (offline.length > 0) {
		next.push({
			id: "offline",
			label: "Offline",
			members: offline,
			offline: true,
			pinned: false,
		});
	}

	return next;
});

function memberPresence(member: DiscordMemberListMember): DiscordMemberPresence {
	return member.presence ?? "online";
}

function memberRowStyle(member: DiscordMemberListMember) {
	const style: Record<string, string> = {};
	if (member.color) {
		style["--member-name-color"] = member.color;
	}
	if (member.rowBackground) {
		style["--member-row-bg"] = member.rowBackground;
	}
	return Object.keys(style).length > 0 ? style : undefined;
}

function secondaryText(member: DiscordMemberListMember, inPinnedRoleSection: boolean) {
	// Role is already the section heading for hoisted groups — only show status/activity.
	if (inPinnedRoleSection) {
		return member.description;
	}
	if (showRoles && member.role && member.description) {
		return `${member.role} · ${member.description}`;
	}
	if (showRoles && member.role) {
		return member.role;
	}
	return member.description;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-member-list {
	/* Discord member sidebar surfaces (oklch only). */
	--discord-member-list-bg: oklch(23.47% 0.005 272.95);
	--discord-member-list-border: oklch(19.34% 0.004 273.16);
	--discord-member-list-text: oklch(91.56% 0.004 272.93);
	--discord-member-list-muted: oklch(71.01% 0.01 273.13);
	--discord-member-list-hover: oklch(100% 0 0 / 0.04);
	--discord-member-list-avatar-bg: oklch(100% 0 0 / 0.1);
	--discord-member-list-presence: oklch(72.27% 0.191 149.58);
	--discord-member-list-presence-idle: oklch(83.11% 0.1448 82.47);
	--discord-member-list-presence-dnd: oklch(63.72% 0.208 25.33);
	--discord-member-list-presence-bar: oklch(23.47% 0.005 272.95);
	--discord-member-list-presence-ring: oklch(23.47% 0.005 272.95);
	--discord-member-list-app-bg: oklch(57.74% 0.2091 273.85);
	--discord-member-list-app-text: oklch(100% 0 0);

	@apply flex min-h-0 w-60 shrink-0 flex-col overflow-hidden border-l font-whitney;
	border-color: var(--discord-member-list-border);
	background-color: var(--discord-member-list-bg);
	color: var(--discord-member-list-text);
}

.discord-member-list-scrollbar {
	@apply h-full max-h-full min-h-0 flex-1;
}

.discord-member-list-content {
	@apply px-2 pt-6 pb-5;
}

.discord-member-list-section + .discord-member-list-section {
	@apply mt-6;
}

.discord-member-list-heading {
	@apply px-2 pb-1 text-[12px] leading-4 font-semibold tracking-wide uppercase;
	color: var(--discord-member-list-muted);
}

.discord-member-list-members {
	@apply m-0 flex list-none flex-col p-0;
}

.discord-member-list-member {
	@apply relative flex min-h-[2.625rem] min-w-0 items-center gap-3 overflow-hidden rounded-md px-2 py-1.5;
}

.discord-member-list-member:hover {
	background-color: var(--discord-member-list-hover);
}

.discord-member-list-member-decorated {
	background-image: var(--member-row-bg);
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
}

.discord-member-list-member-decorated:hover {
	/* Keep decoration visible; Discord darkens slightly via overlay. */
	background-color: transparent;
	box-shadow: inset 0 0 0 999px var(--discord-member-list-hover);
}

.discord-member-list-avatar {
	@apply relative flex size-8 shrink-0 items-center justify-center overflow-visible rounded-full;
	color: var(--discord-member-list-muted);
	background-color: var(--discord-member-list-avatar-bg);
}

.discord-member-list-avatar img {
	@apply size-full rounded-full object-cover;
}

.discord-presence {
	@apply absolute right-[-2px] bottom-[-2px] size-3.5 rounded-full;
	background-color: var(--discord-member-list-presence);
	box-shadow: 0 0 0 3px var(--discord-member-list-presence-ring);
}

.discord-presence[data-status="idle"] {
	background-color: var(--discord-member-list-presence-idle);
}

.discord-presence[data-status="dnd"] {
	@apply flex items-center justify-center;
	background-color: var(--discord-member-list-presence-dnd);
}

.discord-presence[data-status="dnd"]::after {
	content: "";
	width: 0.45rem;
	height: 0.125rem;
	border-radius: 999px;
	background-color: var(--discord-member-list-presence-bar);
}

.discord-member-list-identity {
	@apply relative z-1 min-w-0 flex-1;
}

.discord-member-list-name-row {
	@apply flex min-w-0 items-center gap-1;
}

.discord-member-list-name {
	@apply truncate text-base leading-5 font-medium;
	color: var(--member-name-color, var(--discord-member-list-text));
}

.discord-member-list-app {
	@apply inline-flex shrink-0 items-center gap-0.5 rounded-sm px-1 py-px text-[9px] leading-none font-bold;
	background-color: var(--discord-member-list-app-bg);
	color: var(--discord-member-list-app-text);
}

.discord-member-list-description {
	@apply block truncate text-xs leading-4;
	color: var(--discord-member-list-muted);
}

.discord-member-list-section-offline .discord-member-list-member {
	@apply opacity-45;
}

.discord-member-list-section-offline .discord-member-list-name {
	color: var(--discord-member-list-muted);
}
</style>
