import type { DiscordChatMessage } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import DiscordChat from "~/components/discord/chat.vue";
import DiscordMessage from "~/components/discord/message.vue";

describe("DiscordChat", () => {
	it("renders plain text messages from the messages array (positive)", async () => {
		const messages: readonly DiscordChatMessage[] = [
			{
				id: "1",
				author: "stella",
				content: "Hello channel",
				timestamp: "Today at 15:47",
			},
		];

		const wrapper = await mountSuspended(DiscordChat, {
			props: {
				channelName: "mod-commands",
				date: "July 21, 2026",
				topic: "WolfStar moderation commands — try a slash command below.",
				messages,
			},
		});

		const log = wrapper.find("[role='log']");
		expect(log.attributes("aria-label")).toBe("Messages in mod-commands");
		expect(log.attributes("aria-live")).toBe("polite");
		expect(log.text()).toContain("Hello channel");
		expect(wrapper.text()).toContain(
			"This is the start of the #mod-commands channel. WolfStar moderation commands — try a slash command below.",
		);
		expect(wrapper.find(".discord-slash-command-composed").exists()).toBe(false);
	});

	it("renders typed slash-command messages from the messages array (positive)", async () => {
		const messages: readonly DiscordChatMessage[] = [
			{
				id: "typed-warn",
				author: "stella",
				timestamp: "Today at 15:49",
				command: {
					name: "warn",
					options: [
						{ name: "user", value: "baddie" },
						{ name: "reason", value: "spam", focused: true },
					],
				},
			},
		];

		const wrapper = await mountSuspended(DiscordChat, {
			props: {
				channelName: "mod-commands",
				date: "July 21, 2026",
				messages,
			},
		});

		const composed = wrapper.find(".discord-slash-command-composed");
		expect(composed.exists()).toBe(true);
		expect(composed.text()).toContain("/warn");
		expect(composed.text()).toContain("baddie");
		expect(composed.text()).toContain("spam");
		expect(wrapper.find("[aria-label='Message from Stella']").exists()).toBe(true);
	});

	it("makes the message scroller a named, focusable region (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChat, {
			props: { channelName: "general", date: "July 21, 2026", messages: [] },
		});

		const region = wrapper.find("[role='group']");
		expect(region.attributes("tabindex")).toBe("0");
		expect(region.attributes("aria-label")).toBe("general channel messages");
		expect(region.find("[role='log']").exists()).toBe(true);
	});

	it("pads a message row that a message slot wraps (positive)", async () => {
		const wrapper = await mountSuspended(DiscordChat, {
			props: {
				channelName: "general",
				date: "July 21, 2026",
				messages: [{ id: "1", author: "stella", content: "Hi" }],
			},
			slots: {
				message: () =>
					h("div", { style: "display: contents" }, [
						h(DiscordMessage, { name: "stella" }, () => "Hi"),
					]),
			},
			attachTo: document.body,
		});

		const row = wrapper.find("article").element;
		expect(getComputedStyle(row).paddingLeft).toBe("8px");

		wrapper.unmount();
	});

	it("hides the scrollbar thumb until the log is hovered (negative)", async () => {
		const wrapper = await mountSuspended(DiscordChat, {
			props: { channelName: "general", date: "July 21, 2026", messages: [] },
			attachTo: document.body,
		});

		const region = wrapper.find("[role='group']").element;
		expect(getComputedStyle(region).scrollbarColor).toBe("rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)");

		wrapper.unmount();
	});
});
