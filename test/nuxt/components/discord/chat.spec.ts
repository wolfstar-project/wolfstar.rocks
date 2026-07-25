import type { DiscordChatMessage } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChat from "~/components/discord/chat.vue";

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

		expect(wrapper.find(".discord-chat-messages[role='log']").exists()).toBe(true);
		expect(wrapper.text()).toContain("Hello channel");
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
});
