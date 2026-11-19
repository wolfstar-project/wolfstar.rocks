import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import BlogPageActions from "~/pages/(marketing)/blog/@components/BlogPageActions.vue";

const MARKDOWN = "---\ntitle: WolfStar v7 alpha\n---\n\nThe WolfStar v7 alpha is live.\n";

describe("BlogPageActions", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("starts the clipboard write during the click, before the Markdown arrives", async () => {
		let sendMarkdown: (text: string) => void = () => {};
		const markdownSent = new Promise<string>((resolve) => {
			sendMarkdown = resolve;
		});
		registerEndpoint("/blog/wolfstar-v7-alpha.md", { handler: () => markdownSent });

		const write = vi.fn<(items: ClipboardItem[]) => Promise<void>>(() => Promise.resolve());
		vi.stubGlobal("navigator", { ...navigator, clipboard: { write } });

		const wrapper = await mountSuspended(BlogPageActions, { route: "/blog/wolfstar-v7-alpha" });
		await wrapper.get("button").trigger("click");

		// Safari refuses a write that starts after the click has been handled.
		expect(write).toHaveBeenCalledTimes(1);

		sendMarkdown(MARKDOWN);
		const item = write.mock.calls[0]?.[0][0];
		const blob = await item?.getType("text/plain");

		expect(await blob?.text()).toBe(MARKDOWN);
	});
});
