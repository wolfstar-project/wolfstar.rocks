<template>
	<aside class="discord-member-list" :aria-label="label">
		<DiscordScrollbar class="discord-member-list-scrollbar">
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
									v-if="showPresence(member, section.offline)"
									class="discord-presence"
									:data-status="memberPresence(member)"
								>
									<UIcon
										:name="presenceIcon(member)"
										class="discord-presence-icon"
										aria-hidden="true"
									/>
								</span>
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

const PresenceIcons = {
	online: "discord:status-online",
	idle: "discord:status-idle",
	dnd: "discord:status-dnd",
	offline: "discord:status-online",
} as const satisfies Record<DiscordMemberPresence, string>;

function memberPresence(member: DiscordMemberListMember): DiscordMemberPresence {
	return member.presence ?? "online";
}

/** Gateway presence pip — hidden for offline rows and HTTP-only (serverless) apps. */
function showPresence(member: DiscordMemberListMember, sectionOffline: boolean) {
	return !sectionOffline && !member.http;
}

function presenceIcon(member: DiscordMemberListMember) {
	return PresenceIcons[memberPresence(member)];
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
	--discord-member-list-presence-ring: oklch(23.47% 0.005 272.95);
	--discord-member-list-app-bg: oklch(57.74% 0.2091 273.85);
	--discord-member-list-app-text: oklch(100% 0 0);

	@apply flex min-h-0 w-60 shrink-0 flex-col overflow-hidden border-l font-whitney;
	border-color: var(--discord-member-list-border);
	background-color: var(--discord-member-list-bg);
	color: var(--discord-member-list-text);
}

.discord-member-list-scrollbar {
	/* Discord member sidebar: thin overlay thumb, no painted track; hidden until hover. */
	--discord-scrollbar-track: transparent;
	--discord-scrollbar-thumb: oklch(0% 0 0 / 0.4);

	@apply relative h-full max-h-full min-h-0 flex-1;
	/* Content uses full width; track overlays the right edge (see track rules below). */
	grid-template-columns: minmax(0, 1fr);
}

.discord-member-list-scrollbar :deep(.discord-scrollbar-viewport),
.discord-member-list-scrollbar :deep(.discord-scrollbar-track) {
	grid-column: 1;
}

.discord-member-list-scrollbar :deep(.discord-scrollbar-track) {
	@apply pointer-events-none absolute inset-y-0 right-0 z-1 w-1 opacity-0;
	transition: opacity 120ms ease;
}

.discord-member-list:hover .discord-member-list-scrollbar :deep(.discord-scrollbar-track),
.discord-member-list-scrollbar:focus-within :deep(.discord-scrollbar-track) {
	@apply pointer-events-auto opacity-100;
}

.discord-member-list-scrollbar :deep(.discord-scrollbar-thumb-rail) {
	@apply my-0.5 w-full rounded-full;
	background-color: transparent;
}

.discord-member-list-scrollbar :deep(.discord-scrollbar-thumb) {
	@apply rounded-full;
}

@media (prefers-reduced-motion: reduce) {
	.discord-member-list-scrollbar :deep(.discord-scrollbar-track) {
		transition: none;
	}
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
	/*
	 * Discord avatar status pip: sidebar-colored cutout/halo around the glyph.
	 * Status SVGs use r=6 in a 16×16 viewBox (~75% fill). At 16px the colored
	 * disk is ~12px; a 17px ring leaves ~2.5px of --discord-member-list-presence-ring
	 * between fill and avatar (no extra box-shadow — that stacked with SVG pad to ~5px).
	 */
	@apply absolute -right-1 -bottom-1 flex size-[17px] items-center justify-center rounded-full;
	background-color: var(--discord-member-list-presence-ring);
}

.discord-presence-icon {
	@apply size-4;
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
