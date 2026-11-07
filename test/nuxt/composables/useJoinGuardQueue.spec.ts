import type { JoinGuardQueuePage, JoinGuardRequestState } from "#shared/utils/join-guard";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD_ID = "555555555555555555";
const BASE = `/api/guilds/${GUILD_ID}/joinguard`;

const counts = { all: 1, Banned: 0, Kicked: 0, Verified: 0, Waiting: 1 };
let queries: Record<string, unknown>[] = [];
let posted: unknown[] = [];
let looks = 0;
let requestError: JoinGuardRequestState["error"] = null;

registerEndpoint(`${BASE}/checkpoints`, {
	method: "GET",
	handler: (event): JoinGuardQueuePage => {
		const query = getQuery(event);
		queries.push(query);
		return { counts, entries: [], nextCursor: query.cursor ? null : "cursor-2", waiting: 3 };
	},
});

// h3's `readBody` needs Node's `Buffer`, which the browser has not: the body
// is read off the request stream the stub keeps on the event.
registerEndpoint(`${BASE}/requests`, {
	method: "POST",
	handler: async (event) => {
		const stream = (event as unknown as { _requestBody?: ReadableStream })._requestBody;
		posted.push(await new Response(stream).json());
		return { id: "req-1" };
	},
});

registerEndpoint(`${BASE}/requests/req-1`, {
	method: "GET",
	handler: (): JoinGuardRequestState => {
		looks += 1;
		return { error: requestError, id: "req-1", kind: "Kick", processed: looks >= 2 };
	},
});

const noWait = { delays: [0, 0, 0, 0], wait: () => Promise.resolve() };

describe("useJoinGuardQueue", () => {
	beforeEach(() => {
		queries = [];
		posted = [];
		looks = 0;
		requestError = null;
		clearNuxtData();
	});

	it("reads a filter's first page, the counts and who waits", async () => {
		const queue = useJoinGuardQueue({ filter: "Waiting", guildId: GUILD_ID }, noWait);

		await vi.waitFor(() => expect(queue.status.value).toBe("success"));
		expect(queries[0]).toMatchObject({ status: "Waiting" });
		expect(queue.counts.value).toStrictEqual(counts);
		expect(queue.waiting.value).toBe(3);
		expect(queue.hasMore.value).toBe(true);

		await queue.loadMore();
		expect(queries.at(-1)).toMatchObject({ cursor: "cursor-2", status: "Waiting" });
		expect(queue.hasMore.value).toBe(false);
	});

	it("writes a kick with its reason and waits until the bot did it", async () => {
		const queue = useJoinGuardQueue({ filter: "Waiting", guildId: GUILD_ID }, noWait);
		await vi.waitFor(() => expect(queue.status.value).toBe("success"));

		const pending = queue.act("c1", "Kick", "  Raid  ");
		expect(queue.rowRequests.value.c1).toStrictEqual({ kind: "Kick", state: "sending" });

		await expect(pending).resolves.toStrictEqual({ state: "done" });
		expect(posted).toStrictEqual([{ checkpointId: "c1", kind: "Kick", reason: "Raid" }]);
		expect(looks).toBe(2);
		expect(queue.rowRequests.value.c1).toStrictEqual({ kind: "Kick", state: "done" });
	});

	it("keeps the bot's reason on the row when it could not", async () => {
		requestError = { code: "NotMember", detail: "left" };
		const queue = useJoinGuardQueue({ filter: "Waiting", guildId: GUILD_ID }, noWait);
		await vi.waitFor(() => expect(queue.status.value).toBe("success"));

		await queue.act("c1", "Verify");

		expect(posted).toStrictEqual([{ checkpointId: "c1", kind: "Verify" }]);
		expect(queue.rowRequests.value.c1).toStrictEqual({
			error: { code: "NotMember", detail: "left" },
			kind: "Verify",
			state: "failed",
		});
	});

	it("asks the bot to post the button", async () => {
		const queue = useJoinGuardQueue({ filter: "Waiting", guildId: GUILD_ID }, noWait);

		await expect(queue.postButton()).resolves.toStrictEqual({ state: "done" });
		expect(posted).toStrictEqual([{ kind: "PostButton" }]);
		expect(queue.postingButton.value).toBe(false);
	});
});
