<template>
	<section class="discord-slash-command-suggestions" :aria-label="ariaLabel">
		<div
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
					<nav
						class="discord-slash-command-suggestions-sidebar-scroll no-scrollbar"
						:aria-label="railLabel"
					>
						<div class="discord-slash-command-suggestions-sidebar">
							<button
								type="button"
								class="discord-slash-command-suggestions-sidebar-item"
								:class="{
									'discord-slash-command-suggestions-sidebar-item-active':
										selectedApp === null,
								}"
								:aria-pressed="selectedApp === null"
								title="Frequently Used"
								aria-label="Frequently Used"
								@click="selectedApp = null"
							>
								<span class="discord-slash-command-suggestions-sidebar-recent">
									<UIcon
										name="discord:recently-used"
										class="discord-slash-command-suggestions-sidebar-icon"
										aria-hidden="true"
									/>
								</span>
							</button>

							<button
								v-for="app in SlashCommandRailApps"
								:key="app"
								type="button"
								class="discord-slash-command-suggestions-sidebar-item"
								:class="{
									'discord-slash-command-suggestions-sidebar-item-active':
										selectedApp === app,
								}"
								:aria-pressed="selectedApp === app"
								:title="SlashCommandApps[app].label"
								:aria-label="`${SlashCommandApps[app].label} commands`"
								@click="selectedApp = app"
							>
								<DiscordSlashCommandAppIcon :app size="rail" />
							</button>
						</div>
					</nav>

					<DiscordScrollbar
						:key="selectedApp ?? 'frequently-used'"
						always-show-track
						class="discord-slash-command-suggestions-scroll"
					>
						<div
							role="listbox"
							:aria-label="listboxLabel"
							class="discord-slash-command-suggestions-list"
						>
							<section
								v-if="selectedApp === null"
								class="discord-slash-command-suggestions-recent"
							>
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
				role="listbox"
				:aria-label="matchedLabel"
				class="discord-slash-command-suggestions-matched"
			>
				<slot name="matched" />
			</div>

			<DiscordScrollbar
				v-else-if="slots.matched"
				always-show-track
				class="discord-slash-command-suggestions-scroll"
			>
				<div
					role="listbox"
					:aria-label="listboxLabel"
					class="discord-slash-command-suggestions-list"
				>
					<slot name="matched" />
				</div>
			</DiscordScrollbar>

			<DiscordScrollbar
				v-else-if="!slots['frequently-used'] && !slots.matched"
				always-show-track
				class="discord-slash-command-suggestions-scroll"
			>
				<div role="listbox" :aria-label="listboxLabel">
					<slot />
				</div>
			</DiscordScrollbar>
		</div>
	</section>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface SlashCommandSuggestionsProps {
	listboxLabel?: string;
	matchedLabel?: string;
	prefix: string;
	railLabel?: string;
}

interface SlashCommandSuggestionsSlots {
	"frequently-used"?(props?: Record<string, never>): VNode[];
	"matched"?(props?: Record<string, never>): VNode[];
	"default"?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<SlashCommandSuggestionsSlots>();

const {
	listboxLabel = "Slash command suggestions",
	matchedLabel = "Matched slash command",
	prefix,
	railLabel = "Applications",
} = defineProps<SlashCommandSuggestionsProps>();

/** `null` shows the frequently used list; an app name filters to that app's commands. */
const selectedApp = defineModel<SlashCommandAppName | null>("selectedApp", { default: null });

const slots = useSlots();

const ariaLabel = computed(() => `Slash command suggestions for ${prefix}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestions {
	--discord-slash-command-suggestions-bg: oklch(23.42% 0.0059 264.45);
	--discord-slash-command-suggestions-sidebar: oklch(20.18% 0.0046 264.47);
	--discord-slash-command-suggestions-sidebar-active: oklch(35.52% 0.0099 264.44);
	--discord-slash-command-suggestions-sidebar-hover: oklch(32.11% 0.0094 268.56);
	--discord-slash-command-suggestions-sidebar-icon: oklch(73.06% 0.0048 264.53);
	--discord-slash-command-suggestions-header: oklch(73.06% 0.0048 264.53);
	--discord-slash-command-suggestions-scrollbar-track: oklch(73.06% 0.0048 264.53 / 0.12);
	--discord-slash-command-suggestions-scrollbar-thumb: oklch(73.06% 0.0048 264.53 / 0.45);
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
	@apply flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-0;
	transition: background-color 120ms ease;
}

.discord-slash-command-suggestions-sidebar-item:hover,
.discord-slash-command-suggestions-sidebar-item:focus-visible {
	background-color: var(--discord-slash-command-suggestions-sidebar-hover);
}

.discord-slash-command-suggestions-sidebar-item-active,
.discord-slash-command-suggestions-sidebar-item-active:hover {
	border-radius: 12px;
	background-color: var(--discord-slash-command-suggestions-sidebar-active);
}

@media (prefers-reduced-motion: reduce) {
	.discord-slash-command-suggestions-sidebar-item {
		transition: none;
	}
}

.discord-slash-command-suggestions-sidebar-recent {
	@apply flex size-8 items-center justify-center;
}

.discord-slash-command-suggestions-sidebar-icon {
	@apply size-10;
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
