<template>
	<section class="discord-slash-command-suggestions" :aria-label="ariaLabel">
		<div
			role="listbox"
			:aria-label="listboxLabel"
			class="discord-slash-command-suggestions-panel"
			:class="{
				'discord-slash-command-suggestions-panel-with-matched':
					slots['frequently-used'] && slots.matched,
				'discord-slash-command-suggestions-panel-with-frequently-used':
					!!slots['frequently-used'],
			}"
		>
			<div
				v-if="slots['frequently-used']"
				class="discord-slash-command-suggestions-frequently-used"
				@wheel="onSuggestionsWheel"
			>
				<div class="discord-slash-command-suggestions-sidebar-scroll" aria-hidden="true">
					<div class="discord-slash-command-suggestions-sidebar">
						<div
							class="discord-slash-command-suggestions-sidebar-item discord-slash-command-suggestions-sidebar-item-active"
						>
							<UIcon
								name="discord:recentely-used"
								class="discord-slash-command-suggestions-sidebar-icon"
							/>
						</div>

						<div class="discord-slash-command-suggestions-sidebar-item">
							<nuxt-img
								src="/avatars/wolfstar.png"
								width="24"
								height="24"
								alt=""
								class="discord-slash-command-suggestions-sidebar-avatar"
							/>
						</div>

						<div
							v-for="bot in mockSidebarBots"
							:key="bot.label"
							class="discord-slash-command-suggestions-sidebar-item"
						>
							<UIcon
								:name="bot.icon"
								class="discord-slash-command-suggestions-sidebar-icon"
							/>
						</div>
					</div>
				</div>

				<DiscordScrollbar
					always-show-track
					class="discord-slash-command-suggestions-scroll"
				>
					<div class="discord-slash-command-suggestions-list">
						<section class="discord-slash-command-suggestions-recent">
							<p class="discord-slash-command-suggestions-header" role="presentation">
								<UIcon
									name="discord:recentely-used"
									class="discord-slash-command-suggestions-header-icon"
									aria-hidden="true"
								/>
								Frequently Used
							</p>
							<slot name="frequently-used" />
						</section>
						<slot />
					</div>
				</DiscordScrollbar>
			</div>

			<div
				v-if="slots['frequently-used'] && slots.matched"
				class="discord-slash-command-suggestions-matched"
			>
				<slot name="matched" />
			</div>

			<DiscordScrollbar
				v-else-if="slots.matched"
				always-show-track
				class="discord-slash-command-suggestions-scroll"
			>
				<div class="discord-slash-command-suggestions-list">
					<slot name="matched" />
				</div>
			</DiscordScrollbar>

			<DiscordScrollbar
				v-else-if="!slots['frequently-used'] && !slots.matched"
				always-show-track
				class="discord-slash-command-suggestions-scroll"
			>
				<slot />
			</DiscordScrollbar>
		</div>
	</section>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface SlashCommandSuggestionsProps {
	listboxLabel?: string;
	prefix: string;
}

interface SlashCommandSuggestionsSlots {
	"frequently-used"?(props?: Record<string, never>): VNode[];
	"matched"?(props?: Record<string, never>): VNode[];
	"default"?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<SlashCommandSuggestionsSlots>();

const { listboxLabel = "Slash command suggestions", prefix } =
	defineProps<SlashCommandSuggestionsProps>();

const slots = useSlots();

const mockSidebarBots = [
	{ icon: "ph:rocket-launch-fill", label: "Staryl" },
	{ icon: "ph:terminal-window-fill", label: "MoreCommands" },
	{ icon: "ph:planet-fill", label: "Wolfy" },
	{ icon: "ph:diamond-fill", label: "Fmbot" },
	{ icon: "ph:cat-fill", label: "Cat bot" },
	{ icon: "ph:flame-fill", label: "Dyno" },
] as const;

const ariaLabel = computed(() => `Slash command suggestions for ${prefix}`);

function onSuggestionsWheel(event: WheelEvent) {
	const root = event.currentTarget;
	if (!(root instanceof HTMLElement)) return;

	const viewport = root.querySelector(".discord-scrollbar-viewport");
	if (!(viewport instanceof HTMLElement)) return;

	const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;
	if (maxScrollTop <= 0) return;

	const nextScrollTop = viewport.scrollTop + event.deltaY;
	const canScrollUp = event.deltaY < 0 && viewport.scrollTop > 0;
	const canScrollDown = event.deltaY > 0 && viewport.scrollTop < maxScrollTop;
	if (!canScrollUp && !canScrollDown) return;

	event.preventDefault();
	viewport.scrollTop = Math.min(Math.max(nextScrollTop, 0), maxScrollTop);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestions {
	--discord-slash-command-suggestions-bg: hsl(220, 7%, 12%);
	--discord-slash-command-suggestions-sidebar: hsl(220, 7%, 9%);
	--discord-slash-command-suggestions-sidebar-active: hsla(220, 6.5%, 24%, 1);
	--discord-slash-command-suggestions-sidebar-icon: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-suggestions-header: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-suggestions-scrollbar-track: hsla(220, 2.7%, 66.1%, 0.12);
	--discord-slash-command-suggestions-scrollbar-thumb: hsla(220, 2.7%, 66.1%, 0.45);

	@apply font-whitney;
	background-color: var(--discord-slash-command-suggestions-bg);
}

.discord-slash-command-suggestions-panel {
	@apply min-w-0;
}

.discord-slash-command-suggestions-panel-with-matched {
	@apply flex max-h-48 min-h-0 flex-col;
}

.discord-slash-command-suggestions-scroll {
	--discord-scrollbar-track: var(--discord-slash-command-suggestions-scrollbar-track);
	--discord-scrollbar-thumb: var(--discord-slash-command-suggestions-scrollbar-thumb);

	@apply h-full max-h-full min-h-0 min-w-0;
}

.discord-slash-command-suggestions-panel:not(
		.discord-slash-command-suggestions-panel-with-frequently-used
	)
	.discord-slash-command-suggestions-scroll {
	@apply max-h-48;
}

.discord-slash-command-suggestions-scroll :deep(.discord-scrollbar-viewport) {
	overscroll-behavior: contain;
}

.discord-slash-command-suggestions-frequently-used {
	@apply grid h-48 max-h-48 min-h-0 grid-cols-[40px_minmax(0,1fr)] items-stretch;
}

.discord-slash-command-suggestions-panel-with-matched
	.discord-slash-command-suggestions-frequently-used {
	@apply h-auto max-h-none flex-1;
}

.discord-slash-command-suggestions-sidebar-scroll {
	@apply min-h-0 self-stretch;
	overflow: hidden;
	background-color: var(--discord-slash-command-suggestions-sidebar);
}

.discord-slash-command-suggestions-sidebar {
	@apply flex flex-col items-center gap-1.5 py-1.5;
}

.discord-slash-command-suggestions-panel-with-matched .discord-slash-command-suggestions-scroll {
	@apply max-h-none flex-1;
}

.discord-slash-command-suggestions-sidebar-item {
	@apply flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full;
}

.discord-slash-command-suggestions-sidebar-item-active {
	background-color: var(--discord-slash-command-suggestions-sidebar-active);
}

.discord-slash-command-suggestions-sidebar-icon {
	@apply size-4;
	color: var(--discord-slash-command-suggestions-sidebar-icon);
}

.discord-slash-command-suggestions-sidebar-avatar {
	@apply size-full rounded-full object-cover;
}

.discord-slash-command-suggestions-header {
	@apply flex items-center gap-1.5 px-2 py-1.5 font-whitney text-[11px] font-bold tracking-wide uppercase;
	color: var(--discord-slash-command-suggestions-header);
}

.discord-slash-command-suggestions-header-icon {
	@apply size-3.5 shrink-0;
}

.discord-slash-command-suggestions-list {
	@apply min-w-0;
}

.discord-slash-command-suggestions-recent {
	@apply min-w-0;
}

.discord-slash-command-suggestions-matched {
	@apply shrink-0;
}
</style>
