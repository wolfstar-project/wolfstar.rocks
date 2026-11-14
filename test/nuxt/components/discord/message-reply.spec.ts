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
		expect(reply.attributes("aria-label")).toBe("Stella used the conf menu save slash command");
		expect(reply.text()).toMatch(/^Stella\s*used\s*conf menu save$/);
		expect(reply.find("[role='img']").attributes("aria-label")).toBe("Stella's avatar");
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
		expect(reply.attributes("aria-label")).toBe(
			"Replying to RedStar: Can someone help me with moderation?",
		);
		expect(reply.text()).toContain("Can someone help me with moderation?");
		expect(reply.text()).not.toContain("used");
	});

	it("does not invent a command name when command props are missing (negative)", async () => {
		// ARRANGE / ACT — kind is command but commandName is omitted
		const wrapper = await mountSuspended(DiscordMessageReply, {
			props: { kind: "command", user: "stella" },
		});

		// ASSERT
		const reply = wrapper.find("[role='complementary']");
		expect(reply.text()).toMatch(/^Stella\s*used$/);
		expect(reply.attributes("aria-label")).toBe("Stella used the  slash command");
	});
});
