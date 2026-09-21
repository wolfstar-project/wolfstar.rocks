<template>
	<nav class="guild-rail hidden lg:flex" :aria-label="t('dashboard.server_rail_aria')">
		<NuxtLink
			to="/"
			class="guild-rail-home"
			:aria-label="t('header.home', { name: 'WolfStar' })"
		>
			<IconsWolfstar class="size-7 text-primary" aria-hidden="true" />
		</NuxtLink>

		<span class="guild-rail-divider" aria-hidden="true" />

		<NuxtLink
			v-for="server of servers"
			:key="server.id"
			:to="`/guilds/${server.id}/manage`"
			class="guild-rail-item"
			:class="server.id === currentGuildId ? 'guild-rail-item--active' : undefined"
			:aria-current="server.id === currentGuildId ? 'page' : undefined"
			:aria-label="server.name"
			:title="server.name"
		>
			<UAvatar
				:src="resolveGuildIconSrc(server, { size: 64 })"
				:text="server.acronym"
				alt=""
				size="lg"
				:ui="{ root: 'rounded-2xl' }"
			/>
		</NuxtLink>

		<USkeleton
			v-for="n of pending && servers.length === 0 ? 3 : 0"
			:key="n"
			class="size-12 rounded-2xl"
		/>

		<span class="guild-rail-divider" aria-hidden="true" />

		<NuxtLink
			to="/profile"
			class="guild-rail-add"
			:aria-label="t('dashboard.server_rail_all')"
			:title="t('dashboard.server_rail_all')"
		>
			<UIcon name="heroicons:plus" class="size-5.5" aria-hidden="true" />
		</NuxtLink>
	</nav>
</template>

<script setup lang="ts">
import { resolveGuildIconSrc, selectDashboardRailGuilds } from "~/utils/guild-dashboard";

const { currentGuildId, guilds } = defineProps<{
	/** Guild whose dashboard is open, highlighted in the rail. */
	currentGuildId?: string;
	/** The viewer's guilds, as loaded once by the dashboard layout. */
	guilds: readonly OauthFlattenedGuild[];
	/** Whether those guilds are still loading, so the rail shows placeholders. */
	pending?: boolean;
}>();

const { t } = useI18n();

const servers = computed(() => selectDashboardRailGuilds(guilds));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.guild-rail {
	@apply w-18 shrink-0 flex-col items-center gap-2 overflow-y-auto py-3;
	background-color: var(--color-base-200);
	border-right: 1px solid var(--home-border-subtle);
}

.guild-rail-home,
.guild-rail-item,
.guild-rail-add {
	@apply flex size-12 shrink-0 items-center justify-center rounded-2xl transition-[border-radius,background-color] duration-200;
}

.guild-rail-home,
.guild-rail-add {
	background-color: var(--color-base-300);
}

.guild-rail-add {
	@apply text-success;
}

.guild-rail-home:hover,
.guild-rail-item:hover,
.guild-rail-add:hover,
.guild-rail-item--active {
	@apply rounded-xl;
	background-color: var(--color-base-300);
}

.guild-rail-item--active {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.guild-rail-divider {
	@apply my-1 h-0.5 w-8 shrink-0 rounded-full;
	background-color: var(--home-border-subtle);
}
</style>
