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
					<!-- List first in DOM so mobile (column) matches Discord: commands above, app rail below. -->
					<DiscordScrollbar
						:key="selectedApp ?? 'frequently-used'"
						:min-thumb-height="14"
						:max-thumb-height="40"
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
								<DiscordChatInputCommandAppIcon :app size="rail" />
							</button>
						</div>
					</nav>
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
				:min-thumb-height="14"
				:max-thumb-height="40"
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
				:min-thumb-height="14"
				:max-thumb-height="40"
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
	/* Chunky short thumb; track stays nearly invisible like Discord. */
	--discord-slash-command-suggestions-scrollbar-track: transparent;
	--discord-slash-command-suggestions-scrollbar-thumb: oklch(73.06% 0.0048 264.53 / 0.55);
	--discord-slash-command-suggestions-rail-width: 48px;
	/* Frequently Used header (~2rem) + 5 suggestion rows (3rem each). */
	--discord-slash-command-suggestions-height: calc(2rem + 5 * 3rem);

	/* Floating Discord panel: solid fill, inset to match composer, tiny gap below. */
	@apply mx-3 mb-0.5 overflow-hidden rounded-md font-whitney;
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

	/* Desktop: list sits to the right of the rail (DOM order is list → rail).
	   Class is on the DiscordScrollbar root — set columns here, not via :deep(). */
	@apply h-full max-h-full min-h-0 min-w-0 flex-1 md:order-2;
	grid-template-columns: minmax(0, 1fr) 8px;
}

.discord-slash-command-suggestions-scroll :deep(.discord-scrollbar-thumb-rail) {
	@apply my-1.5;
}

.discord-slash-command-suggestions-scroll :deep(.discord-scrollbar-thumb) {
	@apply rounded-full;
}

.discord-slash-command-suggestions-panel:not(
		.discord-slash-command-suggestions-panel-with-frequently-used
	)
	.discord-slash-command-suggestions-scroll {
	@apply flex-none;
	max-height: var(--discord-slash-command-suggestions-height);
}

.discord-slash-command-suggestions-scroll :deep(.discord-scrollbar-viewport) {
	@apply h-full min-h-0;
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
	/* Desktop: row + left rail via md:order. Mobile: column — list above, rail below. */
	@apply flex h-full min-h-0 max-md:flex-col;
}

.discord-slash-command-suggestions-sidebar-scroll {
	/* Never h-full on mobile: in a column flex that ate the list viewport (empty panel + rail-only look).
	   Scroll remains via wheel/touch; native browser scrollbar is hidden (no-scrollbar). */
	@apply min-h-0 shrink-0 self-stretch overflow-x-hidden overflow-y-auto max-md:h-auto max-md:w-full max-md:overflow-x-auto max-md:overflow-y-hidden md:order-1 md:h-full;
	width: var(--discord-slash-command-suggestions-rail-width);
	overscroll-behavior: contain;
	background-color: var(--discord-slash-command-suggestions-sidebar);

	@media (width < 48rem) {
		width: 100%;
	}
}

.discord-slash-command-suggestions-sidebar {
	@apply flex w-full flex-col items-center gap-0.5 py-2 max-md:w-max max-md:min-w-full max-md:flex-row max-md:gap-1 max-md:px-2 max-md:py-1.5;
}

.discord-slash-command-suggestions-panel-with-matched .discord-slash-command-suggestions-scroll {
	@apply max-h-none;
}

.discord-slash-command-suggestions-sidebar-item {
	@apply flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-0 max-md:size-9 max-md:rounded-full;
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

	@media (width < 48rem) {
		border-radius: 9999px;
	}
}

@media (prefers-reduced-motion: reduce) {
	.discord-slash-command-suggestions-sidebar-item {
		transition: none;
	}
}

.discord-slash-command-suggestions-sidebar-recent {
	/* Same 32px footprint as DiscordChatInputCommandAppIcon rail so the active
	   squircle (40px / radius 12px) frames the clock like the app icons. */
	@apply flex size-8 items-center justify-center max-md:size-7;
}

.discord-slash-command-suggestions-sidebar-icon {
	@apply size-8 max-md:size-7;
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
