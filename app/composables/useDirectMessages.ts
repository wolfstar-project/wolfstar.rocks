import type { DirectMessageThread, DirectMessageThreadId } from "~/utils/direct-messages";
import { DIRECT_MESSAGE_THREADS, unreadNews } from "~/utils/direct-messages";

/**
 * The Home's direct messages: which thread is open, what has not been read
 * yet, and the reader's own reactions. Read markers and reactions are kept in
 * this browser; nothing here reaches the server.
 */
export function useDirectMessages() {
	const threadId = useState<DirectMessageThreadId>("dm:thread", () => "wolfstar");
	const lastRead = useLocalStorage<Partial<Record<DirectMessageThreadId, number>>>(
		"wolfstar-dm-read",
		{},
	);
	const reactions = useLocalStorage<Record<string, string[]>>("wolfstar-dm-reactions", {});

	const threads = DIRECT_MESSAGE_THREADS;
	const thread = computed<DirectMessageThread | undefined>(() =>
		threads.find((entry) => entry.id === threadId.value),
	);

	function unreadCount(entry: DirectMessageThread): number {
		return unreadNews(entry.news, lastRead.value[entry.id] ?? 0).length;
	}

	const totalUnread = computed(() =>
		threads.reduce((total, entry) => total + unreadCount(entry), 0),
	);

	function markRead(entry: DirectMessageThread) {
		const newest = entry.news.at(-1)?.id ?? 0;
		if ((lastRead.value[entry.id] ?? 0) >= newest) return;
		lastRead.value = { ...lastRead.value, [entry.id]: newest };
	}

	function reactionKey(entry: DirectMessageThread, newsId: number) {
		return `${entry.id}:${newsId}`;
	}

	function hasReacted(entry: DirectMessageThread, newsId: number, emoji: string): boolean {
		return reactions.value[reactionKey(entry, newsId)]?.includes(emoji) ?? false;
	}

	function toggleReaction(entry: DirectMessageThread, newsId: number, emoji: string) {
		const key = reactionKey(entry, newsId);
		const current = reactions.value[key] ?? [];
		const next = current.includes(emoji)
			? current.filter((item) => item !== emoji)
			: [...current, emoji];
		reactions.value = { ...reactions.value, [key]: next };
	}

	function openThread(id: DirectMessageThreadId) {
		threadId.value = id;
	}

	return {
		hasReacted,
		markRead,
		openThread,
		thread,
		threadId,
		threads,
		toggleReaction,
		totalUnread,
		unreadCount,
	};
}
