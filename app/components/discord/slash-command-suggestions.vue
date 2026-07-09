<template>
	<section class="discord-slash-command-suggestions" :aria-label="ariaLabel">
		<nav class="discord-slash-command-suggestions-sidebar" aria-hidden="true">
			<div
				class="discord-slash-command-suggestions-sidebar-item discord-slash-command-suggestions-sidebar-item-active"
			>
				<UIcon
					name="ph:clock-counter-clockwise-fill"
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
				<UIcon :name="bot.icon" class="discord-slash-command-suggestions-sidebar-icon" />
			</div>
		</nav>

		<div class="discord-slash-command-suggestions-panel">
			<div
				role="listbox"
				:aria-label="listboxLabel"
				class="discord-slash-command-suggestions-list"
			>
				<template v-if="$slots['frequently-used']">
					<p class="discord-slash-command-suggestions-header" role="presentation">
						<UIcon
							name="ph:clock-counter-clockwise-fill"
							class="discord-slash-command-suggestions-header-icon"
							aria-hidden="true"
						/>
						Frequently Used
					</p>
					<slot name="frequently-used" />
				</template>

				<template v-if="$slots.matched">
					<p class="discord-slash-command-suggestions-header" role="presentation">
						<UIcon
							name="ph:terminal-window-fill"
							class="discord-slash-command-suggestions-header-icon"
							aria-hidden="true"
						/>
						Matched Command
					</p>
					<slot name="matched" />
				</template>

				<slot v-if="!$slots['frequently-used'] && !$slots.matched" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
const { listboxLabel = "Slash command suggestions", prefix } = defineProps<{
	listboxLabel?: string;
	prefix: string;
}>();

const mockSidebarBots = [
	{ icon: "ph:rocket-launch-fill", label: "Staryl" },
	{ icon: "ph:terminal-window-fill", label: "MoreCommands" },
	{ icon: "ph:planet-fill", label: "Wolfy" },
	{ icon: "ph:diamond-fill", label: "Fmbot" },
	{ icon: "ph:cat-fill", label: "Cat bot" },
	{ icon: "ph:flame-fill", label: "Dyno" },
] as const;

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

	@apply grid grid-cols-[40px_minmax(0,1fr)];
	background-color: var(--discord-slash-command-suggestions-bg);
}

.discord-slash-command-suggestions-sidebar {
	@apply flex flex-col items-center gap-1.5 py-2;
	background-color: var(--discord-slash-command-suggestions-sidebar);
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

.discord-slash-command-suggestions-panel {
	@apply min-w-0 py-2 pr-1;
}

.discord-slash-command-suggestions-header {
	@apply flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold tracking-wide uppercase;
	color: var(--discord-slash-command-suggestions-header);
}

.discord-slash-command-suggestions-header-icon {
	@apply size-3.5 shrink-0;
}

.discord-slash-command-suggestions-list {
	@apply max-h-48 overflow-y-auto pr-1;
	scrollbar-width: thin;
	scrollbar-color: var(--discord-slash-command-suggestions-scrollbar-thumb)
		var(--discord-slash-command-suggestions-scrollbar-track);
}

.discord-slash-command-suggestions-list::-webkit-scrollbar {
	width: 4px;
}

.discord-slash-command-suggestions-list::-webkit-scrollbar-track {
	border-radius: 9999px;
	background-color: var(--discord-slash-command-suggestions-scrollbar-track);
}

.discord-slash-command-suggestions-list::-webkit-scrollbar-thumb {
	border-radius: 9999px;
	background-color: var(--discord-slash-command-suggestions-scrollbar-thumb);
}
</style>
