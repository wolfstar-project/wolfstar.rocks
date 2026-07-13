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
			>
				<div class="discord-slash-command-suggestions-inner">
					<div
						class="discord-slash-command-suggestions-sidebar-scroll no-scrollbar"
						aria-hidden="true"
					>
						<div class="discord-slash-command-suggestions-sidebar">
							<div
								class="discord-slash-command-suggestions-sidebar-item discord-slash-command-suggestions-sidebar-item-active"
								title="Frequently Used"
							>
								<span class="discord-slash-command-suggestions-sidebar-recent">
									<UIcon
										name="discord:recently-used"
										class="discord-slash-command-suggestions-sidebar-icon"
									/>
								</span>
							</div>

							<div
								v-for="app in SlashCommandRailApps"
								:key="app"
								class="discord-slash-command-suggestions-sidebar-item"
								:title="SlashCommandApps[app].label"
							>
								<DiscordSlashCommandAppIcon :app size="rail" />
							</div>
						</div>
					</div>

					<DiscordScrollbar
						always-show-track
						class="discord-slash-command-suggestions-scroll"
					>
						<div class="discord-slash-command-suggestions-list">
							<section class="discord-slash-command-suggestions-recent">
								<p
									class="discord-slash-command-suggestions-header"
									role="presentation"
								>
									<UIcon
										name="discord:recently-used"
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

const ariaLabel = computed(() => `Slash command suggestions for ${prefix}`);
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
	--discord-slash-command-suggestions-rail-width: 48px;
	--discord-slash-command-suggestions-height: 18rem;

	@apply font-whitney;
	background-color: var(--discord-slash-command-suggestions-bg);
}

.discord-slash-command-suggestions-panel {
	@apply min-w-0;
}

.discord-slash-command-suggestions-panel-with-matched {
	@apply flex min-h-0 flex-col;
	max-height: var(--discord-slash-command-suggestions-height);
}

.discord-slash-command-suggestions-scroll {
	--discord-scrollbar-track: var(--discord-slash-command-suggestions-scrollbar-track);
	--discord-scrollbar-thumb: var(--discord-slash-command-suggestions-scrollbar-thumb);

	@apply h-full max-h-full min-h-0 min-w-0 flex-1;
}

.discord-slash-command-suggestions-panel:not(
		.discord-slash-command-suggestions-panel-with-frequently-used
	)
	.discord-slash-command-suggestions-scroll {
	@apply flex-none;
	max-height: var(--discord-slash-command-suggestions-height);
}

.discord-slash-command-suggestions-scroll :deep(.discord-scrollbar-viewport) {
	overscroll-behavior: contain;
}

.discord-slash-command-suggestions-frequently-used {
	@apply min-h-0;
}

.discord-slash-command-suggestions-panel-with-frequently-used
	.discord-slash-command-suggestions-frequently-used {
	height: var(--discord-slash-command-suggestions-height);
	max-height: var(--discord-slash-command-suggestions-height);
}

.discord-slash-command-suggestions-panel-with-matched
	.discord-slash-command-suggestions-frequently-used {
	@apply h-auto max-h-none flex-1;
}

.discord-slash-command-suggestions-inner {
	@apply flex h-full min-h-0;
}

.discord-slash-command-suggestions-sidebar-scroll {
	@apply h-full min-h-0 shrink-0 self-stretch overflow-x-hidden overflow-y-auto;
	width: var(--discord-slash-command-suggestions-rail-width);
	overscroll-behavior: contain;
	background-color: var(--discord-slash-command-suggestions-sidebar);
}

.discord-slash-command-suggestions-sidebar {
	@apply flex w-full flex-col items-center gap-0.5 py-2;
}

.discord-slash-command-suggestions-panel-with-matched .discord-slash-command-suggestions-scroll {
	@apply max-h-none;
}

.discord-slash-command-suggestions-sidebar-item {
	@apply flex size-10 shrink-0 items-center justify-center rounded-lg;
}

.discord-slash-command-suggestions-sidebar-item-active {
	background-color: var(--discord-slash-command-suggestions-sidebar-active);
}

.discord-slash-command-suggestions-sidebar-recent {
	@apply flex size-8 items-center justify-center;
}

.discord-slash-command-suggestions-sidebar-icon {
	@apply size-5;
	color: var(--discord-slash-command-suggestions-sidebar-icon);
}

.discord-slash-command-suggestions-header {
	@apply flex items-center gap-1.5 px-2 py-1.5 font-whitney text-[11px] font-bold tracking-wide uppercase;
	color: var(--discord-slash-command-suggestions-header);
}

.discord-slash-command-suggestions-header-icon {
	@apply size-3.5 shrink-0;
}

.discord-slash-command-suggestions-list {
	@apply min-w-0 px-1 pb-1;
}

.discord-slash-command-suggestions-recent {
	@apply min-w-0;
}

.discord-slash-command-suggestions-matched {
	@apply shrink-0 px-1 pb-1;
}
</style>
