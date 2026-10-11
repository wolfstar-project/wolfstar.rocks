<template>
	<nav class="guild-rail hidden sm:flex" :aria-label="ts('dashboard.server_rail_aria')">
		<NuxtLink
			to="/"
			class="guild-rail-home"
			:aria-label="ts('header.home', { name: 'WolfStar' })"
		>
			<IconsWolfstar class="size-7 text-neutral-content" aria-hidden="true" />
		</NuxtLink>

		<span class="guild-rail-divider" aria-hidden="true" />

		<button
			v-for="server of servers"
			:key="server.id"
			type="button"
			class="guild-rail-item"
			:class="server.id === currentGuildId ? 'guild-rail-item--active' : undefined"
			:aria-current="server.id === currentGuildId ? 'page' : undefined"
			:aria-label="server.name"
			:title="server.name"
			@click="emit('select', server.id)"
		>
			<img
				v-if="resolveGuildIconSrc(server, { size: 128 })"
				:src="resolveGuildIconSrc(server, { size: 128 })"
				alt=""
				class="size-full object-cover"
				width="48"
				height="48"
			/>
			<span v-else aria-hidden="true">{{ server.acronym }}</span>
		</button>

		<USkeleton
			v-for="n of pending && servers.length === 0 ? 3 : 0"
			:key="n"
			class="guild-rail-skeleton"
		/>

		<span class="guild-rail-divider" aria-hidden="true" />

		<button
			type="button"
			class="guild-rail-add"
			:aria-label="ts('dashboard.server_rail_all')"
			:title="ts('dashboard.server_rail_all')"
			@click="emit('browse')"
		>
			<UIcon name="ic:round-apps" class="size-5.5" aria-hidden="true" />
		</button>
	</nav>
</template>

<script setup lang="ts">
import { resolveGuildIconSrc, selectDashboardRailGuilds } from "~/utils/guild-dashboard";

const emit = defineEmits<{
	/** The admin picked a server to manage. */
	select: [guildId: string];
	/** The admin wants the list of every server they can manage. */
	browse: [];
}>();

const { currentGuildId, guilds } = defineProps<{
	/** Guild whose dashboard is open, highlighted in the rail. */
	currentGuildId?: string;
	/** The viewer's guilds, as loaded once by the dashboard layout. */
	guilds: readonly OauthFlattenedGuild[];
	/** Whether those guilds are still loading, so the rail shows placeholders. */
	pending?: boolean;
}>();

const { ts } = useI18n();

const servers = computed(() => selectDashboardRailGuilds(guilds));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.guild-rail {
	@apply w-15 shrink-0 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto py-3 md:w-16 lg:w-17;
	background-color: var(--console-rail);
}

.guild-rail-home,
.guild-rail-item,
.guild-rail-add {
	@apply flex size-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden border-0 p-0 text-base font-semibold lg:size-12;
	transition:
		border-radius 170ms cubic-bezier(0.3, 0, 0.2, 1),
		background-color 170ms;
}

/* The mark sits on a fixed dark tile in both themes, like the wordmark does. */
.guild-rail-home {
	@apply rounded-[15px] bg-neutral;
}

.guild-rail-item {
	@apply rounded-full;
	background-color: var(--console-surface);
	color: var(--ui-text-toned);
}

.guild-rail-item:hover,
.guild-rail-item--active {
	@apply rounded-lg;
}

.guild-rail-item:hover {
	background-color: var(--color-primary);
	color: var(--color-primary-content);
}

.guild-rail-item--active {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.guild-rail-item:has(img),
.guild-rail-item:has(img):hover {
	background-color: transparent;
}

.guild-rail-add {
	@apply rounded-full text-success;
	background-color: var(--console-surface);
}

.guild-rail-add:hover {
	@apply rounded-lg;
}

.guild-rail-skeleton {
	@apply size-11 shrink-0 rounded-full lg:size-12;
}

.guild-rail-divider {
	@apply h-0.5 w-7 shrink-0 rounded-[1px];
	background-color: var(--home-border-subtle);
}

.guild-rail-home:focus-visible,
.guild-rail-item:focus-visible,
.guild-rail-add:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}
</style>
