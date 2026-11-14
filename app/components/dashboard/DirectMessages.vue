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

		<DiscordScrollbar overlay auto-hide themed class="dm-list-scroll">
			<nav class="dm-list" :aria-label="ts('dashboard.dm.title')">
				<!-- The member's own appeals: a page of the Home above the threads. -->
				<button
					type="button"
					class="dm-row dm-row--page"
					:class="{ 'dm-row--current': page === 'appeals' }"
					:aria-current="page === 'appeals' ? 'page' : undefined"
					@click="showAppeals"
				>
					<UIcon name="ic:round-balance" class="size-5.5 shrink-0" aria-hidden="true" />
					<span class="grow truncate text-[0.9375rem] font-semibold">
						{{ ts("dashboard.my_appeals.title") }}
					</span>
					<span v-if="openCount > 0" class="dm-unread">
						<span aria-hidden="true">{{ openCount }}</span>
						<span class="sr-only">{{
							ts("dashboard.my_appeals.badge", { count: openCount })
						}}</span>
					</span>
				</button>
				<div class="dm-divider" aria-hidden="true"></div>

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
		</DiscordScrollbar>

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
const { threads, threadId, openThread, unreadCount, page, openAppeals, appealGuildId } =
	useDirectMessages();
const { openCount } = useMyAppeals({ guild: appealGuildId });

const query = ref("");

// Each thread previews its newest post, as Discord lists DMs.
const rows = computed(() => {
	const search = query.value.trim().toLocaleLowerCase();
	return threads.value
		.map((thread) => ({ name: thread.author ?? thread.name, thread }))
		.filter(({ name }) => name.toLocaleLowerCase().includes(search))
		.map(({ name, thread }) => {
			const newest = thread.news.at(-1);
			const text =
				newest &&
				(discordPlainText(newest.content) ||
					newest.embeds[0]?.title ||
					discordPlainText(newest.embeds[0]?.description ?? ""));
			// A post of images alone is still a post.
			const preview =
				text || ts(newest ? "dashboard.dm.image_preview" : "dashboard.dm.no_messages");
			return {
				avatar: thread.avatar,
				current: page.value === "thread" && thread.id === threadId.value,
				id: thread.id,
				name,
				preview,
				unread: unreadCount(thread),
			};
		});
});

function open(id: DirectMessageThreadId) {
	openThread(id);
	emit("navigate");
}

function showAppeals() {
	openAppeals();
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

.dm-list-scroll {
	@apply h-full max-h-full min-h-0 flex-1;
}

.dm-sidebar--floating .dm-list-scroll :deep(.discord-scrollbar-track) {
	bottom: 4.75rem;

	/* Clear of the phone's taller account card. */
	@variant max-sm {
		bottom: 7rem;
	}
}

.dm-list {
	@apply flex flex-col gap-0.5 px-2 pt-3 pb-2;
}

/* The list scrolls out above the floating card, never under it. */
.dm-sidebar--floating .dm-list {
	padding-bottom: 4.75rem;

	/* The phone's account card is taller. */
	@variant max-sm {
		padding-bottom: 7rem;
	}
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

.dm-row--page {
	@apply min-h-10.5 gap-3 pr-2 pl-2.5;
	color: var(--ui-text-toned);
}

.dm-row--page.dm-row--current {
	color: var(--ui-text-highlighted);
}

.dm-divider {
	@apply mx-2 mt-2 mb-3 h-px;
	background-color: var(--home-border-subtle);
}

.dm-unread {
	@apply inline-flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-error px-1.25 text-[0.6875rem] font-bold text-error-content;
}
</style>
