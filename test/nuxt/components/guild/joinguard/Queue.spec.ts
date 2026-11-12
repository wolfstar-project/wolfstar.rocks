import type { JoinGuardQueueEntry, JoinGuardQueueFilter } from "#shared/utils/join-guard";
import type { JoinGuardRowRequest, useJoinGuardQueue } from "~/composables/useJoinGuardQueue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Queue from "~/components/guild/joinguard/Queue.vue";

const mockToastAdd = vi.fn();
mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

const NOW = Date.now();

function makeEntry(overrides: Partial<JoinGuardQueueEntry> = {}): JoinGuardQueueEntry {
	return {
		accountCreatedAt: NOW - 5 * 86_400_000,
		caseId: null,
		createdAt: NOW - 3_600_000,
		defaultAvatar: false,
		expiresAt: null,
		generatedName: false,
		id: "c1",
		linkedAccounts: 0,
		member: {
			avatarUrl: null,
			displayName: "Sunny",
			id: "111111111111111111",
			username: "sunny.art",
		},
		moderator: null,
		resolution: null,
		resolvedAt: null,
		ruleId: "r1",
		ruleName: "Fresh accounts",
		status: "Waiting",
		trust: 1,
		...overrides,
	};
}

function makeQueue(entries: JoinGuardQueueEntry[]) {
	const queue = {
		act: vi.fn(),
		counts: ref({ all: 7, Banned: 1, Kicked: 2, Verified: 2, Waiting: 2 }),
		entries: ref(entries),
		error: ref(null),
		hasMore: ref(false),
		loadMore: vi.fn(),
		loadingMore: ref(false),
		postButton: vi.fn(),
		postingButton: ref(false),
		refresh: vi.fn(),
		rowRequests: ref<Record<string, JoinGuardRowRequest>>({}),
		status: ref("success"),
		waiting: ref(2),
	};
	return queue;
}

type FakeQueue = ReturnType<typeof makeQueue>;

const mounted: { unmount: () => void }[] = [];

async function mountQueue(queue: FakeQueue, filter: JoinGuardQueueFilter = "Waiting") {
	const wrapper = await mountSuspended(Queue, {
		attachTo: document.body,
		props: {
			"filter": filter,
			"onUpdate:filter": (value: JoinGuardQueueFilter) => wrapper.setProps({ filter: value }),
			"queue": queue as unknown as ReturnType<typeof useJoinGuardQueue>,
		},
	});
	mounted.push(wrapper);
	return wrapper;
}

// Accessibility audits for the Join Guard components live in test/nuxt/a11y.spec.ts.
describe("GuildJoinguardQueue", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("lists who waits, what stopped them, and the filters with their counts", async () => {
		const wrapper = await mountQueue(
			makeQueue([makeEntry({ defaultAvatar: true, generatedName: true, trust: 0 })]),
		);

		const text = wrapper.text();
		expect(text).toContain("@sunny.art");
		expect(text).toContain("Not Trusted");
		expect(text).toContain("created 5 days ago");
		expect(text).toContain(
			"Stopped by Fresh accounts · default avatar · generated name · no linked accounts",
		);

		const filters = wrapper.findAll("button[aria-pressed]");
		expect(filters.map((button) => button.text())).toStrictEqual([
			"Waiting 2",
			"Verified 2",
			"Kicked 2",
			"Banned 1",
			"All 7",
		]);
		expect(filters[0]!.attributes("aria-pressed")).toBe("true");

		await filters[4]!.trigger("click");
		expect(wrapper.emitted("update:filter")).toStrictEqual([["all"]]);
	});

	it("says Sending… while a request is in flight, without its buttons", async () => {
		const queue = makeQueue([makeEntry()]);
		queue.rowRequests.value = { c1: { kind: "Verify", state: "sending" } };
		const wrapper = await mountQueue(queue);

		expect(wrapper.text()).toContain("Sending…");
		expect(wrapper.find('[aria-label="Verify @sunny.art"]').exists()).toBe(false);
	});

	it("shows the bot's reason on the row when it could not act", async () => {
		const queue = makeQueue([makeEntry()]);
		queue.rowRequests.value = {
			c1: {
				error: { code: "RoleNotManageable", detail: "Unverified" },
				kind: "Verify",
				state: "failed",
			},
		};
		const wrapper = await mountQueue(queue);

		expect(wrapper.text()).toContain(
			"WolfStar couldn't do it: the pending or verified role is above WolfStar's highest role.",
		);
		expect(wrapper.find('[aria-label="Verify @sunny.art"]').exists()).toBe(true);
	});

	it("verifies a member through a request, and reports the bot's failure", async () => {
		const queue = makeQueue([makeEntry()]);
		queue.act.mockResolvedValue({
			error: { code: "MissingPermissions", detail: "Manage Roles" },
			state: "failed",
		});
		const wrapper = await mountQueue(queue);

		await wrapper.get('[aria-label="Verify @sunny.art"]').trigger("click");
		await vi.waitFor(() => expect(mockToastAdd).toHaveBeenCalled());

		expect(queue.act).toHaveBeenCalledExactlyOnceWith("c1", "Verify");
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "error",
				description: expect.stringContaining("missing a permission"),
			}),
		);
	});

	it("asks for an optional reason before a kick", async () => {
		const queue = makeQueue([makeEntry()]);
		queue.act.mockResolvedValue({ state: "done" });
		const wrapper = await mountQueue(queue);

		await wrapper.get('[aria-label="Kick @sunny.art"]').trigger("click");
		await vi.waitFor(() =>
			expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
				"Kick @sunny.art?",
			),
		);
		const reason = document.querySelector<HTMLTextAreaElement>('[role="dialog"] textarea');
		reason!.value = "Raid account";
		reason!.dispatchEvent(new Event("input", { bubbles: true }));
		await nextTick();
		const confirm = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
			(button) => button.textContent?.trim() === "Kick member",
		);
		confirm!.click();

		await vi.waitFor(() =>
			expect(queue.act).toHaveBeenCalledExactlyOnceWith("c1", "Kick", "Raid account"),
		);
		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ color: "success", title: "@sunny.art kicked" }),
			),
		);
	});

	it("says who decided a row that no longer waits", async () => {
		const wrapper = await mountQueue(
			makeQueue([
				makeEntry({ resolution: "Checkpoint", status: "Verified", trust: 2 }),
				makeEntry({
					id: "c2",
					moderator: {
						avatarUrl: null,
						displayName: "redstar071",
						id: "2",
						username: "redstar071",
					},
					resolution: "Moderator",
					status: "Kicked",
				}),
			]),
			"all",
		);

		expect(wrapper.text()).toContain("Verified at the checkpoint");
		expect(wrapper.text()).toContain("Kicked by redstar071");
		expect(wrapper.find('[aria-label="Verify @sunny.art"]').exists()).toBe(false);
	});

	it("says so when nobody is in the filter, and loads more by cursor", async () => {
		const empty = await mountQueue(makeQueue([]));
		expect(empty.text()).toContain("Nobody here.");

		const queue = makeQueue([makeEntry()]);
		queue.hasMore.value = true;
		const wrapper = await mountQueue(queue);
		const more = wrapper.findAll("button").find((button) => button.text() === "Load more");
		await more!.trigger("click");
		expect(queue.loadMore).toHaveBeenCalledOnce();
	});
});
