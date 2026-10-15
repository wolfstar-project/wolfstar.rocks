<template>
	<nav class="guild-rail hidden sm:flex" :aria-label="ts('dashboard.server_rail_aria')">
		<!-- Home: the direct messages, with a pill while open and the unread count. -->
		<div class="guild-rail-slot">
			<span
				class="guild-rail-pill"
				:class="{ 'guild-rail-pill--on': !currentGuildId }"
				aria-hidden="true"
			></span>
			<button
				type="button"
				class="guild-rail-home"
				:class="{ 'guild-rail-home--active': !currentGuildId }"
				:aria-current="currentGuildId ? undefined : 'page'"
				:aria-label="ts('dashboard.dm.home_aria')"
				:title="ts('dashboard.dm.home_aria')"
				@click="emit('home')"
			>
				<IconsWolfstar class="size-7 text-neutral-content" aria-hidden="true" />
			</button>
			<span v-if="totalUnread > 0" class="guild-rail-unread">
				<span aria-hidden="true">{{ totalUnread }}</span>
				<span class="sr-only">{{ ts("dashboard.dm.unread", { count: totalUnread }) }}</span>
			</span>
		</div>

		<span class="guild-rail-divider" aria-hidden="true" />

		<template v-for="server of servers" :key="server.id">
			<button
				v-if="server.wolfstarIsIn"
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
			<!-- A server without WolfStar: faded, with a "+", and it invites the bot. -->
			<a
				v-else
				:href="guildAddURL(server.id)"
				class="guild-rail-invite"
				:aria-label="ts('guild_card.invite_bot_aria', { name: server.name })"
				:title="ts('guild_card.invite_bot_aria', { name: server.name })"
			>
				<span class="guild-rail-item">
					<img
						v-if="resolveGuildIconSrc(server, { size: 128 })"
						:src="resolveGuildIconSrc(server, { size: 128 })"
						alt=""
						class="size-full object-cover"
						width="48"
						height="48"
					/>
					<span v-else aria-hidden="true">{{ server.acronym }}</span>
				</span>
				<span class="guild-rail-invite-badge" aria-hidden="true">
					<UIcon name="ic:round-add" class="size-3" />
				</span>
			</a>
		</template>

		<USkeleton
			v-for="n of pending && servers.length === 0 ? 3 : 0"
			:key="n"
			class="guild-rail-skeleton"
		/>

		<span class="guild-rail-divider" aria-hidden="true" />

		<a
			:href="invites.WolfStar"
			class="guild-rail-add"
			:aria-label="ts('dashboard.server_rail_add')"
			:title="ts('dashboard.server_rail_add')"
		>
			<UIcon name="ic:round-add" class="size-5.5" aria-hidden="true" />
		</a>
	</nav>
</template>

<script setup lang="ts">
import { resolveGuildIconSrc, selectDashboardRailGuilds } from "~/utils/guild-dashboard";

const emit = defineEmits<{
	/** The admin picked a server to manage. */
	select: [guildId: string];
	/** The admin opened the Home, where the direct messages are. */
	home: [];
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
const invites = useInvites();
const { totalUnread } = useDirectMessages();

const servers = computed(() => selectDashboardRailGuilds(guilds));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.guild-rail {
	@apply shrink-0 flex-col items-center gap-2 overflow-x-hidden overflow-y-auto pt-3;
	/* As wide as the layout says, and open at the foot for the account card
	   floating over it (the drawer's rail is as tall as the screen anyway). */
	width: var(--console-rail-width, 3.75rem);
	padding-bottom: 4.75rem;
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
	@apply rounded-full bg-neutral;
}

.guild-rail-home:hover,
.guild-rail-home--active {
	@apply rounded-[15px];
}

.guild-rail-slot {
	@apply relative flex shrink-0;
}

/* Discord's pill on the rail's edge: a dot on hover, a bar while open. */
.guild-rail-pill {
	@apply absolute top-1/2 -left-2.5 h-0 w-1 -translate-y-1/2 rounded-r-[4px] lg:-left-3;
	background-color: var(--ui-text-highlighted);
	transition: height 170ms cubic-bezier(0.3, 0, 0.2, 1);
}

.guild-rail-slot:hover .guild-rail-pill {
	@apply h-5;
}

.guild-rail-pill--on,
.guild-rail-slot:hover .guild-rail-pill--on {
	@apply h-10;
}

.guild-rail-unread {
	@apply absolute -right-1.5 -bottom-1 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-error px-1.25 text-[0.6875rem] leading-none font-bold text-error-content;
	box-shadow: 0 0 0 3px var(--console-rail);
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

/* Not joined yet: the icon faded, a "+" on its corner, both clear on hover. */
.guild-rail-invite {
	@apply relative flex shrink-0;
}

.guild-rail-invite .guild-rail-item {
	@apply opacity-50 grayscale;
	transition:
		border-radius 170ms cubic-bezier(0.3, 0, 0.2, 1),
		opacity 170ms,
		filter 170ms;
}

.guild-rail-invite:hover .guild-rail-item,
.guild-rail-invite:focus-visible .guild-rail-item {
	@apply rounded-lg opacity-100 grayscale-0;
}

.guild-rail-invite-badge {
	@apply absolute -right-0.5 -bottom-0.5 flex size-4.5 items-center justify-center rounded-full bg-success text-success-content;
	box-shadow: 0 0 0 3px var(--console-rail);
}

.guild-rail-invite:focus-visible {
	@apply rounded-lg;
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
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
