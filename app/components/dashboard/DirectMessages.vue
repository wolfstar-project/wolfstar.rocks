<template>
	<div class="dm-sidebar" :class="{ 'dm-sidebar--floating': floating }">
		<div class="dm-sidebar-header">
			<label class="dm-search">
				<UIcon name="ic:round-search" class="size-4 shrink-0" aria-hidden="true" />
				<input
					v-model="query"
					type="search"
					class="dm-search-input"
					:placeholder="ts('dashboard.dm.search')"
					:aria-label="ts('dashboard.dm.search')"
				/>
			</label>
		</div>

		<nav class="dm-list" :aria-label="ts('dashboard.dm.title')">
			<p class="dm-list-label">{{ ts("dashboard.dm.title") }}</p>
			<button
				v-for="row of rows"
				:key="row.id"
				type="button"
				class="dm-row"
				:class="{ 'dm-row--current': row.current }"
				:aria-current="row.current ? 'page' : undefined"
				@click="open(row.id)"
			>
				<img
					:src="row.avatar"
					alt=""
					width="34"
					height="34"
					class="size-8.5 rounded-full"
				/>
				<span class="flex min-w-0 grow flex-col gap-px">
					<span class="flex min-w-0 items-center gap-1.5">
						<span class="truncate text-sm font-semibold">{{ row.name }}</span>
						<DashboardBotTag />
					</span>
					<span class="truncate text-xs text-muted">{{ row.preview }}</span>
				</span>
				<span v-if="row.unread > 0" class="dm-unread">
					<span aria-hidden="true">{{ row.unread }}</span>
					<span class="sr-only">{{
						ts("dashboard.dm.unread", { count: row.unread })
					}}</span>
				</span>
			</button>
			<p v-if="rows.length === 0" class="px-2 py-3 text-[0.8125rem] text-muted">
				{{ ts("select.nothing_matches") }}
			</p>
		</nav>

		<DashboardAccountCard :floating />
	</div>
</template>

<script setup lang="ts">
import type { DirectMessageThreadId } from "~/utils/direct-messages";

/** The Home's sidebar: the bots' threads, searchable, above the account card. */
const { floating = false } = defineProps<{
	/** Lays the account card over the server rail, as the server sidebar does. */
	floating?: boolean;
}>();

const emit = defineEmits<{
	/** A thread was opened, so a phone can show its page. */
	navigate: [];
}>();

const { ts } = useI18n();
const { threads, threadId, openThread, unreadCount } = useDirectMessages();
const { user: authUser } = useUserSession();
const { user: discordUser } = useUser(authUser);
const readerName = computed(
	() =>
		discordUser.value?.global_name ?? discordUser.value?.username ?? authUser.value?.name ?? "",
);

const query = ref("");

// Each thread previews its newest message, as Discord lists DMs.
const rows = computed(() => {
	const search = query.value.trim().toLocaleLowerCase();
	return threads
		.filter((thread) => thread.name.toLocaleLowerCase().includes(search))
		.map((thread) => {
			const newest = thread.news.at(-1);
			const preview = newest?.textKey
				? ts(newest.textKey, { name: readerName.value })
				: newest?.embed
					? ts(newest.embed.titleKey)
					: ts("dashboard.dm.no_messages");
			return {
				avatar: thread.avatar,
				current: thread.id === threadId.value,
				id: thread.id,
				name: thread.name,
				preview,
				unread: unreadCount(thread),
			};
		});
});

function open(id: DirectMessageThreadId) {
	openThread(id);
	emit("navigate");
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.dm-sidebar {
	@apply flex h-full min-h-0 flex-col;
	background-color: var(--console-surface);
}

.dm-sidebar-header {
	@apply flex h-12 shrink-0 items-center px-2.5;
	border-bottom: 1px solid var(--home-border-subtle);
	box-shadow: var(--console-shadow-low);
}

.dm-search {
	@apply flex h-7.5 w-full cursor-text items-center gap-2 rounded-[6px] px-2.5 text-[0.8125rem];
	background-color: var(--console-input);
	color: var(--ui-text-muted);
}

.dm-search:focus-within {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.dm-search-input {
	@apply min-w-0 grow border-0 bg-transparent p-0 text-[0.8125rem] outline-none;
	color: var(--ui-text-highlighted);
}

.dm-search-input::placeholder {
	color: var(--ui-text-muted);
}

.dm-list {
	@apply flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-3 pb-2;
}

/* The list scrolls out above the floating card, never under it. */
.dm-sidebar--floating .dm-list {
	padding-bottom: 4.75rem;
}

.dm-list-label {
	@apply px-2 pb-1.5 text-[0.6875rem] font-bold tracking-[0.06em] uppercase;
	color: var(--ui-text-muted);
}

.dm-row {
	@apply flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-[6px] border-0 bg-transparent p-2 text-left;
	color: var(--ui-text-highlighted);
}

.dm-row:hover {
	background-color: var(--console-hover);
}

.dm-row--current,
.dm-row--current:hover {
	background-color: var(--console-active);
}

.dm-row:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.dm-unread {
	@apply inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-error px-1.25 text-[0.6875rem] font-bold text-error-content;
}
</style>
