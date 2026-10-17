import { DashboardDirectMessages, DashboardDirectMessageThread } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { DIRECT_MESSAGE_THREADS } from "~/utils/direct-messages";

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
		expect(list.findAll(".dm-row")).toHaveLength(2);
		await list.get('input[type="search"]').setValue("staryl");
		expect(list.findAll(".dm-row")).toHaveLength(1);

		await list.get(".dm-row").trigger("click");
		expect(useDirectMessages().threadId.value).toBe("staryl");
		list.unmount();
	});
});
