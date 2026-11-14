import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import DiscordMessage from "~/components/discord/message.vue";
import DiscordMessages from "~/components/discord/messages.vue";

describe("DiscordMessages", () => {
	it("renders the messages as a polite log (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessages, {
			slots: { default: "<p>Hello from the slot</p>" },
		});

		// ASSERT
		const log = wrapper.find("[role='log']");
		expect(log.exists()).toBe(true);
		expect(log.attributes("aria-live")).toBe("polite");
		expect(log.text()).toContain("Hello from the slot");
	});

	it("pads each message row inside the card (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessages, {
			slots: { default: () => h(DiscordMessage, { name: "stella" }, () => "Hi") },
			attachTo: document.body,
		});

		// ASSERT
		const row = wrapper.find("article").element;
		expect(getComputedStyle(row).paddingLeft).not.toBe("0px");

		wrapper.unmount();
	});

	it("renders an empty log when no slot content is provided (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessages);

		// ASSERT
		const log = wrapper.find("[role='log']");
		expect(log.exists()).toBe(true);
		expect(log.text().trim()).toBe("");
	});
});
