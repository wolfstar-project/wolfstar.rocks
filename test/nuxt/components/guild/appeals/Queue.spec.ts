import type { AppealQueueEntry, AppealQueueFilter } from "#shared/utils/appeal-queue";
import type { AppealDecisionResult } from "~/composables/useAppealQueue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Queue from "~/components/guild/appeals/Queue.vue";

const GUILD_ID = "123456789012345678";

function makeEntry(id: string, overrides: Partial<AppealQueueEntry> = {}): AppealQueueEntry {
	return {
		id,
		caseId: Number(id) + 41,
		caseType: "Ban",
		formName: null,
		user: { id: "111111111111111111", displayName: "alt_account", avatar: null },
		status: "pending",
		answers: [
			{
				questionId: "why",
				label: "Why should the case be undone?",
				value: "That was my brother on my account.",
			},
		],
		reason: null,
		reviewer: null,
		createdAt: new Date().toISOString(),
		decidedAt: null,
		...overrides,
	};
}

const mockEntries = ref<AppealQueueEntry[]>([]);
const mockTotal = ref(0);
const mockCounts = ref({ accepted: 0, denied: 0, pending: 0 });
const mockCanReview = ref(true);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockBusyId = ref<string | null>(null);
const mockDecide = vi.fn();
const mockRefresh = vi.fn();
const mockToastAdd = vi.fn();
const mockUseAppealQueue = vi.fn();

mockNuxtImport("useAppealQueue", () => (params: unknown) => {
	mockUseAppealQueue(params);
	return {
		busyId: mockBusyId,
		canReview: mockCanReview,
		counts: mockCounts,
		decide: mockDecide,
		entries: mockEntries,
		error: ref(null),
		refresh: mockRefresh,
		status: mockStatus,
		total: mockTotal,
	};
});

mockNuxtImport("useActiveGuild", () => () => ({ activeGuildId: ref(GUILD_ID) }));
mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

// The dialog is teleported to the body: a wrapper left mounted keeps it there.
const mounted: { unmount: () => void }[] = [];

async function mount() {
	const wrapper = await mountSuspended(Queue, { attachTo: document.body });
	mounted.push(wrapper);
	return wrapper;
}

function params() {
	return mockUseAppealQueue.mock.calls.at(-1)![0] as {
		filter: { value: AppealQueueFilter };
		limit: { value: number };
	};
}

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the decision dialog");
	return element;
}

function dialogButton(text: string): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find(
		(element) => element.textContent?.trim() === text,
	);
	if (!found) throw new Error(`expected a "${text}" button`);
	return found;
}

// Accessibility audits for GuildAppealsQueue live in test/nuxt/a11y.spec.ts.
describe("GuildAppealsQueue", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEntries.value = [
			makeEntry("1"),
			makeEntry("5", {
				caseType: "Timeout",
				user: { id: "222222222222222222", displayName: "loud_user", avatar: null },
				answers: [
					{ questionId: "why", label: "Why?", value: "I was hyped for the event." },
				],
			}),
		];
		mockTotal.value = 2;
		mockCounts.value = { accepted: 3, denied: 1, pending: 2 };
		mockCanReview.value = true;
		mockStatus.value = "success";
		mockBusyId.value = null;
		mockDecide.mockResolvedValue({ ok: true, state: "done" } satisfies AppealDecisionResult);
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("lists each appeal with who sent it, its case, its status and what it says", async () => {
		const wrapper = await mount();

		const rows = wrapper.findAll("li.queue-row");
		expect(rows).toHaveLength(2);
		expect(rows[0]!.text()).toContain("@alt_account");
		expect(rows[0]!.text()).toContain("Ban");
		expect(rows[0]!.text()).toContain("Case #42");
		expect(rows[0]!.text()).toContain("Pending");
		expect(rows[0]!.text()).toContain("That was my brother on my account.");
		expect(rows[1]!.text()).toContain("Timeout");
		expect(rows[1]!.text()).toContain("Case #46");
		// One question, one answer: its question is not repeated above it.
		expect(rows[0]!.text()).not.toContain("Why should the case be undone?");
	});

	it("names the question above each answer when the form asked several", async () => {
		mockEntries.value = [
			makeEntry("1", {
				formName: "Ban appeal",
				answers: [
					{ questionId: "a", label: "What happened?", value: "A mistake." },
					{
						questionId: "b",
						label: "What will change?",
						value: "I will read the rules.",
					},
				],
			}),
		];
		const wrapper = await mount();

		const text = wrapper.get("li.queue-row").text();
		expect(text).toContain("Ban appeal");
		expect(text).toContain("What happened?");
		expect(text).toContain("I will read the rules.");
	});

	it("filters by status, with the count of each, and starts from the first page", async () => {
		const wrapper = await mount();

		const pills = wrapper.findAll("button.queue-filter");
		expect(pills.map((pill) => pill.text())).toStrictEqual([
			"Pending 2",
			"Accepted 3",
			"Denied 1",
			"All",
		]);
		expect(pills[0]!.attributes("aria-pressed")).toBe("true");
		expect(params().filter.value).toBe("pending");

		await pills[2]!.trigger("click");
		await nextTick();

		expect(params().filter.value).toBe("denied");
		expect(params().limit.value).toBe(25);
		expect(wrapper.findAll("button.queue-filter")[2]!.attributes("aria-pressed")).toBe("true");
	});

	it("asks for a reason before it accepts, and hands the decision on", async () => {
		const wrapper = await mount();

		await wrapper.get('[aria-label="Accept the appeal of @alt_account"]').trigger("click");
		await vi.waitFor(() => expect(dialog().textContent).toContain("Accept this appeal?"));

		const textarea = dialog().querySelector("textarea")!;
		textarea.value = "  Thank you for explaining. ";
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
		await nextTick();
		dialogButton("Accept").click();

		await vi.waitFor(() =>
			expect(mockDecide).toHaveBeenCalledExactlyOnceWith(
				"1",
				"Approve",
				"  Thank you for explaining. ",
			),
		);
		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ color: "success", title: "Appeal accepted" }),
			),
		);
	});

	it("denies from its own dialog, which does not repeat the last reason", async () => {
		const wrapper = await mount();

		await wrapper.get('[aria-label="Deny the appeal of @loud_user"]').trigger("click");
		await vi.waitFor(() => expect(dialog().textContent).toContain("Deny this appeal?"));
		expect(dialog().querySelector("textarea")!.value).toBe("");
		dialogButton("Deny").click();

		await vi.waitFor(() => expect(mockDecide).toHaveBeenCalledExactlyOnceWith("5", "Deny", ""));
		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({ title: "Appeal denied" }),
			),
		);
	});

	it("says why the bot could not do it", async () => {
		mockDecide.mockResolvedValue({ ok: false, code: "undoFailed" });
		const wrapper = await mount();

		await wrapper.get('[aria-label="Accept the appeal of @alt_account"]').trigger("click");
		await vi.waitFor(() => expect(dialog().textContent).toContain("Accept this appeal?"));
		dialogButton("Accept").click();

		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					description: "The case could not be undone, so the appeal is still pending.",
					title: "The appeal was not decided",
				}),
			),
		);
	});

	it("tells the staff that the bot has not answered yet", async () => {
		mockDecide.mockResolvedValue({ ok: true, state: "timeout" });
		const wrapper = await mount();

		await wrapper.get('[aria-label="Deny the appeal of @alt_account"]').trigger("click");
		await vi.waitFor(() => expect(dialog().textContent).toContain("Deny this appeal?"));
		dialogButton("Deny").click();

		await vi.waitFor(() =>
			expect(mockToastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "info",
					title: expect.stringContaining("has not answered"),
				}),
			),
		);
	});

	it("shows who decided a decided appeal, and why, and no buttons", async () => {
		mockEntries.value = [
			makeEntry("1", {
				status: "denied",
				reason: "Too soon after the ban.",
				reviewer: { id: "333333333333333333", displayName: "mod_one", avatar: null },
				decidedAt: new Date().toISOString(),
			}),
		];
		const wrapper = await mount();

		const row = wrapper.get("li.queue-row");
		expect(row.text()).toContain("Denied");
		expect(row.text()).toContain("Decided by @mod_one");
		expect(row.text()).toContain("Reason: Too soon after the ban.");
		expect(row.findAll("button")).toHaveLength(0);
	});

	it("leaves out the buttons for who does not review, and says so", async () => {
		mockCanReview.value = false;
		const wrapper = await mount();

		expect(wrapper.find('[aria-label^="Accept the appeal"]').exists()).toBe(false);
		expect(wrapper.text()).toContain("you do not review them");
	});

	it("keeps the buttons still while a decision is being made", async () => {
		mockBusyId.value = "1";
		const wrapper = await mount();

		for (const label of [
			"Accept the appeal of @alt_account",
			"Deny the appeal of @loud_user",
		]) {
			expect(wrapper.get(`[aria-label="${label}"]`).attributes("disabled")).toBeDefined();
		}
	});

	it("says there is nothing to decide when the filter is empty", async () => {
		mockEntries.value = [];
		mockTotal.value = 0;
		const wrapper = await mount();

		expect(wrapper.text()).toContain("No appeals waiting");

		await wrapper.findAll("button.queue-filter")[3]!.trigger("click");
		await nextTick();
		expect(wrapper.text()).toContain("No appeals yet");
	});

	it("offers to try again when the appeals could not be loaded", async () => {
		mockEntries.value = [];
		mockStatus.value = "error";
		const wrapper = await mount();

		expect(wrapper.get('[role="alert"]').text()).toContain("could not be loaded");
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
		await retry!.trigger("click");

		expect(mockRefresh).toHaveBeenCalledOnce();
	});

	it("loads the next page, behind the rows it has", async () => {
		mockTotal.value = 40;
		const wrapper = await mount();

		expect(wrapper.text()).toContain("Showing 2 of 40");
		const more = wrapper.findAll("button").find((button) => button.text() === "Show more");
		await more!.trigger("click");
		await nextTick();

		expect(params().limit.value).toBe(50);
	});
});
