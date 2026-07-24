<template>
	<div class="discord-channel-header">
		<div class="discord-channel-header-mobile">
			<div class="discord-channel-header-back" aria-hidden="true">
				<UIcon name="ph:arrow-left-bold" class="size-5" />
				<span v-if="notificationCount > 0" class="discord-channel-header-badge">{{
					notificationCount
				}}</span>
			</div>

			<button
				type="button"
				class="discord-channel-header-mobile-title"
				:aria-label="`Open channel info for #${name}`"
				@click="emit('open-channel-info')"
			>
				<span class="discord-channel-header-mobile-name-row">
					<UIcon
						:name="typeIcon"
						class="discord-channel-header-icon size-4 shrink-0"
						aria-hidden="true"
					/>
					<span class="discord-channel-header-name">{{ name }}</span>
					<UIcon
						name="ph:caret-right-bold"
						class="discord-channel-header-chevron size-3 shrink-0"
						aria-hidden="true"
					/>
				</span>
				<span v-if="onlineCount !== undefined" class="discord-channel-header-online">
					<span class="discord-channel-header-online-dot" aria-hidden="true" />
					<span>{{ onlineCount }} Online</span>
				</span>
			</button>

			<div class="discord-channel-header-mobile-search" aria-hidden="true">
				<UIcon name="discord:search" class="size-5" />
			</div>
		</div>

		<div class="discord-channel-header-desktop">
			<div class="discord-channel-header-info">
				<div class="discord-channel-header-title">
					<UIcon
						:name="typeIcon"
						class="discord-channel-header-icon size-5 shrink-0"
						aria-hidden="true"
					/>
					<span class="discord-channel-header-name">{{ name }}</span>
				</div>

				<template v-if="topic">
					<span class="discord-channel-header-divider" aria-hidden="true" />
					<span class="discord-channel-header-topic">{{ topic }}</span>
				</template>
			</div>

			<div class="discord-channel-header-toolbar">
				<button
					v-for="action of ToolbarActions"
					:key="action.id"
					type="button"
					class="discord-channel-header-action"
					:class="{
						'discord-channel-header-action-interactive': action.id === 'members',
						'discord-channel-header-action-active':
							action.id === 'members' && membersOpen,
					}"
					:aria-label="action.id === 'members' ? membersToggleLabel : action.label"
					:aria-pressed="action.id === 'members' ? membersOpen : undefined"
					@click="action.id === 'members' ? toggleMembers() : undefined"
				>
					<UIcon :name="action.icon" class="size-6" aria-hidden="true" />
				</button>

				<div class="discord-channel-header-search" aria-hidden="true">
					<span class="discord-channel-header-search-placeholder">{{
						searchPlaceholderText
					}}</span>
					<UIcon
						name="discord:search"
						class="discord-channel-header-search-icon size-4 shrink-0"
					/>
				</div>
			</div>
		</div>
	</div>
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
	label: string;
}

const TypeIcons = {
	text: "discord:text-channel",
} as const satisfies Record<ChannelHeaderType, string>;

/**
 * Order matches Discord desktop channel header:
 * threads → notifications → pins → members, then search.
 */
const ToolbarActions = [
	{ id: "threads", icon: "discord:threads", label: "Threads" },
	{ id: "notifications", icon: "discord:notifications", label: "Notification settings" },
	{ id: "pins", icon: "discord:pins", label: "Pinned messages" },
	{ id: "members", icon: "discord:members", label: "Show member list" },
] as const satisfies readonly ToolbarAction[];
</script>

<script setup lang="ts">
const {
	name,
	type = "text",
	topic,
	searchPlaceholder = "Search",
	guildName,
	onlineCount,
	notificationCount = 0,
	membersOpen = true,
} = defineProps<ChannelHeaderProps>();

const emit = defineEmits<{
	"update:membersOpen": [value: boolean];
	"toggle-members": [];
	/** Mobile: tap channel name to open Members / Media / Pins / … panel. */
	"open-channel-info": [];
}>();

const typeIcon = computed(() => TypeIcons[type]);

const searchPlaceholderText = computed(() => {
	if (guildName) {
		return `Search ${guildName}`;
	}
	return searchPlaceholder;
});

const membersToggleLabel = computed(() => (membersOpen ? "Hide member list" : "Show member list"));

function toggleMembers() {
	emit("toggle-members");
	emit("update:membersOpen", !membersOpen);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-channel-header {
	/* Discord-true desktop dark chrome (oklch only). */
	--discord-channel-header-bg: oklch(26.65% 0.006 272.93);
	--discord-channel-header-border: oklch(19.34% 0.004 273.16);
	--discord-channel-header-edge: oklch(0% 0 0 / 0.2);
	--discord-channel-header-text: oklch(91.56% 0.004 272.93);
	--discord-channel-header-muted: oklch(71.01% 0.01 273.13);
	/* Search field: Discord #1e1f22 fill, #949ba4 placeholder, brighter icon. */
	--discord-channel-header-search-bg: oklch(19.34% 0.004 273.16);
	--discord-channel-header-search-border: oklch(28.84% 0.007 272.93);
	--discord-channel-header-search-placeholder: oklch(69.5% 0.015 255);
	--discord-channel-header-search-icon: oklch(91.56% 0.004 272.93);
	--discord-channel-header-badge: oklch(63.17% 0.208 24.62);
	--discord-channel-header-online: oklch(72.27% 0.191 149.58);

	@apply border-b;
	border-color: var(--discord-channel-header-border);
	background-color: var(--discord-channel-header-bg);
	box-shadow: 0 1px 0 var(--discord-channel-header-edge);
	color: var(--discord-channel-header-text);
}

.discord-channel-header-desktop {
	@apply flex h-12 items-center justify-between gap-3 pr-3 pl-4;
}

.discord-channel-header-mobile {
	display: none;
}

.discord-channel-header-info {
	@apply flex min-w-0 items-center gap-2;
}

.discord-channel-header-title {
	@apply flex min-w-0 shrink-0 items-center gap-2;
}

.discord-channel-header-icon {
	color: var(--discord-channel-header-muted);
}

.discord-channel-header-name {
	@apply truncate font-whitney text-base font-semibold;
	color: var(--discord-channel-header-text);
}

/* Dark gray circular separator between channel name and topic. */
.discord-channel-header-divider {
	@apply size-1 shrink-0 rounded-full;
	background-color: var(--discord-channel-header-muted);
	opacity: 0.7;
}

.discord-channel-header-topic {
	@apply min-w-0 truncate font-whitney text-[13px] font-medium;
	color: var(--discord-channel-header-muted);
}

/* Discord desktop: 24px icons with 8px margin each side → 16px gap. */
.discord-channel-header-toolbar {
	@apply flex shrink-0 items-center gap-4;
}

.discord-channel-header-action {
	@apply inline-flex size-6 shrink-0 cursor-default items-center justify-center border-0 bg-transparent p-0;
	color: var(--discord-channel-header-muted);
}

.discord-channel-header-action-interactive {
	@apply cursor-pointer;
}

.discord-channel-header-action:hover,
.discord-channel-header-action-active {
	color: var(--discord-channel-header-text);
}

.discord-channel-header-action:focus-visible {
	@apply outline-2 outline-offset-2 outline-primary;
}

/*
 * Discord desktop header search (matches channel-header chrome):
 * ~28px tall · 4px radius · 8px pad · left placeholder · right magnifier.
 */
.discord-channel-header-search {
	@apply flex h-7 w-60 shrink-0 items-center justify-between gap-3 rounded px-2;
	background-color: var(--discord-channel-header-search-bg);
	border: 1px solid var(--discord-channel-header-search-border);
}

.discord-channel-header-search-placeholder {
	@apply min-w-0 flex-1 truncate font-whitney text-sm leading-none font-medium;
	color: var(--discord-channel-header-search-placeholder);
}

.discord-channel-header-search-icon {
	color: var(--discord-channel-header-search-icon);
}

/* Discord mobile channel header (< md): back + badge · #channel / Online · search */
@media (width < 48rem) {
	.discord-channel-header-desktop {
		display: none;
	}

	.discord-channel-header-mobile {
		@apply flex h-14 items-center gap-2 px-2;
	}

	.discord-channel-header-back,
	.discord-channel-header-mobile-search {
		@apply relative inline-flex size-10 shrink-0 items-center justify-center;
		color: var(--discord-channel-header-text);
	}

	.discord-channel-header-badge {
		@apply absolute top-0.5 right-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold;
		background-color: var(--discord-channel-header-badge);
		color: oklch(100% 0 0);
	}

	.discord-channel-header-mobile-title {
		@apply min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left;
		color: inherit;
	}

	.discord-channel-header-mobile-title:focus-visible {
		@apply outline-2 outline-offset-2 outline-primary;
	}

	.discord-channel-header-mobile-name-row {
		@apply flex min-w-0 items-center gap-1;
	}

	.discord-channel-header-chevron {
		color: var(--discord-channel-header-muted);
	}

	.discord-channel-header-online {
		@apply mt-0.5 flex items-center gap-1.5 text-xs;
		color: var(--discord-channel-header-muted);
	}

	.discord-channel-header-online-dot {
		@apply size-2 shrink-0 rounded-full;
		background-color: var(--discord-channel-header-online);
	}
}
</style>
