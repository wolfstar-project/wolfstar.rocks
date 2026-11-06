import { DashboardDirectMessages, DashboardDirectMessageThread } from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DIRECT_MESSAGE_THREADS } from "~/utils/direct-messages";

registerEndpoint("/api/users/appeals", {
	method: "GET",
	handler: () => ({ entries: [], openCount: 2 }),
});

const wolfstarNews = DIRECT_MESSAGE_THREADS.find((thread) => thread.id === "wolfstar")?.news ?? [];

describe("dashboard direct messages", () => {
	beforeEach(() => {
		localStorage.removeItem("wolfstar-dm-read");
		localStorage.removeItem("wolfstar-dm-reactions");
		useDirectMessages().openThread("wolfstar");
	});

	it("marks WolfStar's news read once its thread is open", async () => {
		expect(useDirectMessages().totalUnread.value).toBe(wolfstarNews.length);

		const thread = await mountSuspended(DashboardDirectMessageThread);

		expect(thread.findAll("article")).toHaveLength(wolfstarNews.length);
		expect(useDirectMessages().totalUnread.value).toBe(0);
		thread.unmount();
	});

	it("keeps the reader's own reaction", async () => {
		const thread = await mountSuspended(DashboardDirectMessageThread);
		const reaction = thread.get("button[aria-pressed]");

		expect(reaction.attributes("aria-pressed")).toBe("false");
		await reaction.trigger("click");

		expect(reaction.attributes("aria-pressed")).toBe("true");
		expect(reaction.text()).toContain("1");
		thread.unmount();
	});

	it("filters the threads by name and opens one", async () => {
		const list = await mountSuspended(DashboardDirectMessages);

		await list.get('input[type="search"]').setValue("star");
		expect(list.findAll(".dm-row:not(.dm-row--page)")).toHaveLength(2);
		await list.get('input[type="search"]').setValue("staryl");
		expect(list.findAll(".dm-row:not(.dm-row--page)")).toHaveLength(1);

		await list.get(".dm-row:not(.dm-row--page)").trigger("click");
		expect(useDirectMessages().threadId.value).toBe("staryl");
		list.unmount();
	});

	it("switches the Home to the member's appeals, with how many cases can be appealed", async () => {
		const list = await mountSuspended(DashboardDirectMessages);
		const row = list.get(".dm-row--page");

		await vi.waitFor(() => expect(row.text()).toContain("2"));
		expect(row.text()).toContain("Appeals");
		expect(row.attributes("aria-current")).toBeUndefined();

		await row.trigger("click");
		expect(useDirectMessages().page.value).toBe("appeals");
		expect(row.attributes("aria-current")).toBe("page");

		await list.get(".dm-row:not(.dm-row--page)").trigger("click");
		expect(useDirectMessages().page.value).toBe("thread");
		list.unmount();
	});
});
