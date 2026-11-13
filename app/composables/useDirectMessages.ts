import type { Announcement } from "#shared/types/announcement";
import type { DirectMessageThread, DirectMessageThreadId } from "~/utils/direct-messages";

/** The pages of the Home: a bot's thread, or the member's own appeals. */
export type HomePage = "thread" | "appeals";

/** Where a thread's posts are: still loading, shown, or failed to load. */
export type DirectMessageStatus = "pending" | "ready" | "error";

/**
 * The Home's direct messages: which thread is open, its posts and what has
 * not been read yet. The posts are read from Discord through the server once
 * a visit; read markers are kept in this browser.
 *
 * The Home also holds the member's appeals, a page of its own in the sidebar
 * above the threads, so which of the two is open is kept here too.
 */
export function useDirectMessages() {
	const threadId = useState<DirectMessageThreadId>("dm:thread", () => "wolfstar");
	const page = useState<HomePage>("home:page", () => "thread");
	// The server of the bot's appeal link, listed even when the member is not in it.
	const appealGuildId = useState<string | null>("home:appeal-guild", () => null);
	const lastRead = useLocalStorage<Partial<Record<DirectMessageThreadId, string>>>(
		"wolfstar-dm-read",
		{},
	);

	const posts = useState<Partial<Record<DirectMessageThreadId, Announcement[]>>>(
		"dm:posts",
		() => ({}),
	);
	const statuses = useState<Partial<Record<DirectMessageThreadId, DirectMessageStatus>>>(
		"dm:status",
		() => ({}),
	);

	async function load(id: DirectMessageThreadId, force = false) {
		const source = DIRECT_MESSAGE_THREADS.find((entry) => entry.id === id)?.source;
		if (!source || statuses.value[id] === "pending") return;
		if (statuses.value[id] === "ready" && !force) return;
		statuses.value = { ...statuses.value, [id]: "pending" };
		try {
			const news = await $fetch<Announcement[]>(source);
			posts.value = { ...posts.value, [id]: news };
			statuses.value = { ...statuses.value, [id]: "ready" };
		} catch {
			statuses.value = { ...statuses.value, [id]: "error" };
		}
	}

	// Read once a visit, in the browser: the posts are not part of the page.
	if (import.meta.client) {
		for (const entry of DIRECT_MESSAGE_THREADS) {
			if (entry.source && statuses.value[entry.id] === undefined) void load(entry.id);
		}
	}

	const threads = computed<DirectMessageThread[]>(() =>
		// A copy of each entry: the list of threads is a shared constant.
		DIRECT_MESSAGE_THREADS.map((entry) =>
			Object.assign({}, entry, { news: posts.value[entry.id] ?? [] }),
		),
	);
	const thread = computed<DirectMessageThread | undefined>(() =>
		threads.value.find((entry) => entry.id === threadId.value),
	);

	function statusOf(entry: Pick<DirectMessageThread, "id" | "source">): DirectMessageStatus {
		if (!entry.source) return "ready";
		return statuses.value[entry.id] ?? "pending";
	}

	function unreadCount(entry: DirectMessageThread): number {
		return unreadNews(entry.news, lastRead.value[entry.id]).length;
	}

	const totalUnread = computed(() =>
		threads.value.reduce((total, entry) => total + unreadCount(entry), 0),
	);

	function markRead(entry: DirectMessageThread) {
		const newest = entry.news.at(-1)?.id;
		if (!newest || unreadCount(entry) === 0) return;
		lastRead.value = { ...lastRead.value, [entry.id]: newest };
	}

	function openThread(id: DirectMessageThreadId) {
		threadId.value = id;
		page.value = "thread";
	}

	/** Opens the member's appeals, with the server of a link when they came from one. */
	function openAppeals(guildId?: string) {
		page.value = "appeals";
		if (guildId) appealGuildId.value = guildId;
	}

	return {
		appealGuildId,
		markRead,
		openAppeals,
		openThread,
		page,
		reload: (id: DirectMessageThreadId) => load(id, true),
		statusOf,
		thread,
		threadId,
		threads,
		totalUnread,
		unreadCount,
	};
}
