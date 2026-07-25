import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordMessageReply from "~/components/discord/message-reply.vue";

describe("DiscordMessageReply", () => {
	it("renders a command reply with formatted path and accessible label (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessageReply, {
			props: {
				kind: "command",
				user: "stella",
				commandName: "conf",
				subcommandGroup: "menu",
				subcommand: "save",
			},
		});

		// ASSERT
		const reply = wrapper.find("[role='complementary']");
		expect(reply.exists()).toBe(true);
		expect(reply.classes()).toContain("discord-message-reply-kind-command");
		expect(reply.attributes("aria-label")).toBe("Stella used the conf menu save slash command");
		expect(wrapper.find(".discord-message-reply-command-name").text()).toBe("conf menu save");
		expect(wrapper.find(".discord-message-reply-spine").attributes("aria-hidden")).toBe("true");
		expect(wrapper.find(".discord-message-reply-preview").exists()).toBe(false);
	});

	it("renders a message reply preview instead of a command chip (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessageReply, {
			props: {
				kind: "message",
				user: "redstar",
				content: "Can someone help me with moderation?",
			},
		});

		// ASSERT
		const reply = wrapper.find("[role='complementary']");
		expect(reply.classes()).not.toContain("discord-message-reply-kind-command");
		expect(reply.attributes("aria-label")).toBe(
			"Replying to RedStar: Can someone help me with moderation?",
		);
		expect(wrapper.find(".discord-message-reply-preview").text()).toContain(
			"Can someone help me with moderation?",
		);
		expect(wrapper.find(".discord-message-reply-command").exists()).toBe(false);
		expect(wrapper.find(".discord-message-reply-username-emphasis").exists()).toBe(true);
	});

	it("does not invent a command name when command props are missing (negative)", async () => {
		// ARRANGE / ACT — kind is command but commandName is omitted
		const wrapper = await mountSuspended(DiscordMessageReply, {
			props: { kind: "command", user: "stella" },
		});

		// ASSERT
		expect(wrapper.find(".discord-message-reply-command-name").text()).toBe("");
		expect(wrapper.find("[role='complementary']").attributes("aria-label")).toBe(
			"Stella used the  slash command",
		);
	});
});
