<template>
	<aside class="discord-member-list" :aria-label="label">
		<DiscordScrollbar always-show-track class="discord-member-list-scrollbar">
			<div class="discord-member-list-content">
				<section
					v-for="section of sections"
					:key="section.id"
					class="discord-member-list-section"
					:class="{ 'discord-member-list-section-offline': section.id === 'offline' }"
				>
					<h2 class="discord-member-list-heading">
						{{ section.label }} — {{ section.members.length }}
					</h2>
					<ul class="discord-member-list-members">
						<li
							v-for="member of section.members"
							:key="member.id"
							class="discord-member-list-member"
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
									v-if="secondaryText(member)"
									class="discord-member-list-description"
								>
									{{ secondaryText(member) }}
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
import type { DiscordMemberListMember } from "~/types/discord";

interface MemberListProps {
	online: readonly DiscordMemberListMember[];
	offline: readonly DiscordMemberListMember[];
	label?: string;
	showRoles?: boolean;
}

interface MemberSection {
	id: "online" | "offline";
	label: "Online" | "Offline";
	members: readonly DiscordMemberListMember[];
}
</script>

<script setup lang="ts">
const {
	online,
	offline,
	label = "Server members",
	showRoles = false,
} = defineProps<MemberListProps>();

const sections = computed<MemberSection[]>(() => [
	{ id: "online", label: "Online", members: online },
	{ id: "offline", label: "Offline", members: offline },
]);

function secondaryText(member: DiscordMemberListMember) {
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
	@apply flex min-h-0 w-60 shrink-0 flex-col overflow-hidden border-l font-whitney;
	border-color: var(--home-border-subtle);
	background-color: oklch(from var(--color-base-300) calc(l - 0.015) c h);
}

.discord-member-list-scrollbar {
	@apply h-full max-h-full min-h-0 flex-1;
}

.discord-member-list-content {
	@apply px-2 pt-3 pb-4;
}

.discord-member-list-section + .discord-member-list-section {
	@apply mt-3.5;
}

.discord-member-list-heading {
	@apply px-2 pb-0.5 text-[11px] leading-4 font-semibold tracking-wide text-muted uppercase;
}

.discord-member-list-members {
	@apply flex flex-col;
}

.discord-member-list-member {
	@apply flex min-w-0 items-center gap-2.5 rounded px-2 py-1;
}

.discord-member-list-member:hover {
	background-color: oklch(from var(--color-base-content) l c h / 0.05);
}

.discord-member-list-avatar {
	@apply flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-muted;
	background-color: oklch(from var(--color-base-content) l c h / 0.1);
}

.discord-member-list-avatar img {
	@apply size-full object-cover;
}

.discord-member-list-identity {
	@apply min-w-0 flex-1;
}

.discord-member-list-name-row {
	@apply flex min-w-0 items-center gap-1;
}

.discord-member-list-name {
	@apply truncate text-sm leading-[18px] font-medium text-base-content;
}

.discord-member-list-app {
	@apply inline-flex shrink-0 items-center gap-0.5 rounded-sm bg-primary px-1 py-px text-[9px] leading-none font-bold text-primary-content;
}

.discord-member-list-description {
	@apply block truncate text-[11px] leading-[14px] text-muted;
}

.discord-member-list-section-offline .discord-member-list-member {
	@apply opacity-45;
}
</style>
