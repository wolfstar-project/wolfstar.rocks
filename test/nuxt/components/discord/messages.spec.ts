import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordMessages from "~/components/discord/messages.vue";

describe("DiscordMessages", () => {
	it("renders the messages container and default slot content (positive)", async () => {
		const wrapper = await mountSuspended(DiscordMessages, {
			slots: { default: "<p>Hello from the slot</p>" },
		});

		expect(wrapper.find(".discord-messages").exists()).toBe(true);
		expect(wrapper.text()).toContain("Hello from the slot");
	});

	it("renders an empty container when no slot content is provided (negative)", async () => {
		const wrapper = await mountSuspended(DiscordMessages);

		expect(wrapper.find(".discord-messages").exists()).toBe(true);
		expect(wrapper.find(".discord-messages").text().trim()).toBe("");
	});
});
