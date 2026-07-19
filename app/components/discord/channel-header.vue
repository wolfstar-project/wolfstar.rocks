<template>
	<div class="discord-channel-header">
		<div class="discord-channel-header-info">
			<UIcon
				:name="typeIcon"
				class="discord-channel-header-icon size-4.5 shrink-0"
				aria-hidden="true"
			/>
			<span class="discord-channel-header-name">{{ name }}</span>
		</div>

		<div class="discord-channel-header-toolbar" aria-hidden="true">
			<div class="discord-channel-header-actions">
				<UIcon
					v-for="action of LeadingToolbarActions"
					:key="action.icon"
					:name="action.icon"
					class="discord-channel-header-action size-5"
				/>
			</div>

			<div class="discord-channel-header-search">
				<span class="discord-channel-header-search-placeholder">{{
					searchPlaceholder
				}}</span>
				<UIcon
					name="ph:magnifying-glass"
					class="discord-channel-header-search-icon size-3.5 shrink-0"
				/>
			</div>

			<div class="discord-channel-header-actions">
				<UIcon
					v-for="action of TrailingToolbarActions"
					:key="action.icon"
					:name="action.icon"
					class="discord-channel-header-action size-5"
				/>
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
	/** Placeholder shown in the decorative search field. */
	searchPlaceholder?: string;
}

const TypeIcons = {
	text: "discord:text-channel",
} as const satisfies Record<ChannelHeaderType, string>;

/** Order matches Discord desktop: threads → mute → pins → members, then search, then inbox → help. */
const LeadingToolbarActions = [
	{ icon: "ph:chats" },
	{ icon: "ph:bell-slash" },
	{ icon: "ph:push-pin" },
	{ icon: "ph:users" },
] as const;

const TrailingToolbarActions = [{ icon: "ph:tray" }, { icon: "ph:question" }] as const;
</script>

<script setup lang="ts">
const { name, type = "text", searchPlaceholder = "Search" } = defineProps<ChannelHeaderProps>();

const typeIcon = computed(() => TypeIcons[type]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-channel-header {
	@apply flex h-12 items-center justify-between gap-3 border-b px-4;
	border-color: var(--home-border-subtle);
	background-color: var(--color-base-300);
	box-shadow: 0 1px 0 oklch(from var(--color-base-content) l c h / 0.04);
}

.discord-channel-header-info {
	@apply flex min-w-0 items-center gap-2;
}

.discord-channel-header-icon {
	@apply text-muted;
}

.discord-channel-header-name {
	@apply truncate text-[15px] font-semibold text-base-content;
}

.discord-channel-header-toolbar {
	@apply flex shrink-0 items-center gap-4;
}

.discord-channel-header-actions {
	@apply flex items-center gap-4;
}

.discord-channel-header-action {
	@apply text-muted;
}

.discord-channel-header-search {
	@apply flex h-6 w-36 items-center gap-1.5 rounded-sm px-1.5 sm:w-44;
	background-color: oklch(from var(--color-base-content) l c h / 0.1);
}

.discord-channel-header-search-placeholder {
	@apply min-w-0 flex-1 truncate text-xs text-muted;
}

.discord-channel-header-search-icon {
	@apply text-muted;
}
</style>
