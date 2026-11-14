<template>
	<nav class="guild-rail hidden sm:flex" :aria-label="ts('dashboard.server_rail_aria')">
		<DiscordScrollbar
			overlay
			auto-hide
			themed
			:max-thumb-height="THUMB_MAX_HEIGHT"
			class="guild-rail-scroll"
		>
			<div class="guild-rail-list">
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
						<span class="sr-only">{{
							ts("dashboard.dm.unread", { count: totalUnread })
						}}</span>
					</span>
				</div>

				<span class="guild-rail-divider" aria-hidden="true" />

				<template v-for="server of servers" :key="server.id">
					<button
						v-if="server.wolfstarIsIn"
						type="button"
						class="guild-rail-item"
						:class="
							server.id === currentGuildId ? 'guild-rail-item--active' : undefined
						"
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
							width="40"
							height="40"
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
								width="40"
								height="40"
							/>
							<span v-else aria-hidden="true">{{ server.acronym }}</span>
						</span>
						<span class="guild-rail-invite-badge" aria-hidden="true">
							<UIcon name="ic:round-add" class="size-2.5" />
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
					<UIcon name="ic:round-add" class="size-5" aria-hidden="true" />
				</a>
			</div>
		</DiscordScrollbar>
	</nav>
</template>

<script setup lang="ts">
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

/** The rail's thumb stays a short slim pill however many servers there are, as in Discord's app. */
const THUMB_MAX_HEIGHT = 120;

const { ts } = useI18n();
const invites = useInvites();
const { totalUnread } = useDirectMessages();

const servers = computed(() => selectDashboardRailGuilds(guilds));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.guild-rail {
	@apply min-h-0 shrink-0 flex-col overflow-hidden;
	/* As wide as the layout says. */
	width: var(--console-rail-width, 4.5rem);
	background-color: var(--console-rail);
}

.guild-rail-scroll {
	@apply h-full max-h-full min-h-0 flex-1;
	--discord-scrollbar-thumb-width: 3px;
}

/* The thumb stops above the account card floating over the rail's foot. */
.guild-rail-scroll :deep(.discord-scrollbar-track) {
	bottom: 4.75rem;
}

.guild-rail-list {
	@apply flex flex-col items-center gap-2 pt-3;
	/* Open at the foot for the account card floating over it (the drawer's
	   rail is as tall as the screen anyway). */
	padding-bottom: 4.75rem;
}

.guild-rail-home,
.guild-rail-item,
.guild-rail-add {
	/* Discord's rounded squares: a 40px tile with a 12px corner. */
	@apply flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[12px] border-0 p-0 text-[0.9375rem] font-semibold;
	transition: background-color 170ms;
}

/* The mark sits on a fixed dark tile in both themes, like the wordmark does. */
.guild-rail-home {
	@apply bg-neutral;
}

.guild-rail-slot {
	@apply relative flex shrink-0;
}

/* Discord's pill on the rail's edge: a dot on hover, a bar while open. */
.guild-rail-pill {
	/* On the rail's edge, 16px left of the icon. */
	@apply absolute top-1/2 -left-4 h-0 w-1 -translate-y-1/2 rounded-r-[4px];
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
	background-color: var(--console-solid);
	color: var(--ui-text-toned);
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

/* Not joined yet: the icon as any other, with a "+" on its corner. */
.guild-rail-invite {
	@apply relative flex shrink-0;
}

.guild-rail-invite-badge {
	/* As small as Discord's mention badge. */
	@apply absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-success text-success-content;
	box-shadow: 0 0 0 3px var(--console-rail);
}

.guild-rail-invite:focus-visible {
	@apply rounded-[12px];
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.guild-rail-add {
	@apply text-success;
	background-color: var(--console-solid);
}

.guild-rail-skeleton {
	@apply size-10 shrink-0 rounded-[12px];
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
