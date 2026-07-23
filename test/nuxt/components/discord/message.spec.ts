import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordMessage from "~/components/discord/message.vue";

describe("DiscordMessage", () => {
	it("renders an article with profile name, APP badge, and slot content (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: {
				name: "wolfstar",
				timestamp: "Today at 4:00 PM",
				datetime: "2026-07-21T16:00:00",
			},
			slots: { default: "Moderation help is ready." },
		});

		// ASSERT
		const article = wrapper.find("article.discord-message");
		expect(article.exists()).toBe(true);
		expect(article.attributes("aria-label")).toBe("Message from WolfStar");
		expect(wrapper.find("header").text()).toContain("WolfStar");
		expect(wrapper.find(".app-badge").attributes("aria-label")).toBe(
			"Verified application badge",
		);
		expect(wrapper.find("time.discord-message-timestamp").attributes("datetime")).toBe(
			"2026-07-21T16:00:00",
		);
		expect(wrapper.text()).toContain("Moderation help is ready.");
	});

	it("omits the APP badge and ephemeral footer for a normal user message (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "stella" },
			slots: { default: "Can someone help?" },
		});

		// ASSERT
		expect(wrapper.find(".app-badge").exists()).toBe(false);
		expect(wrapper.find(".discord-message-ephemeral").exists()).toBe(false);
		expect(wrapper.find("[role='status']").exists()).toBe(false);
		expect(wrapper.find("article").attributes("aria-label")).toBe("Message from Stella");
	});

	it("shows the ephemeral footer and dismiss control when ephemeral (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "wolfstar", ephemeral: true },
			slots: { default: "Only you see this." },
		});

		// ASSERT
		expect(wrapper.find("article").classes()).toContain("discord-message-ephemeral");
		const footer = wrapper.find("[role='status']");
		expect(footer.attributes("aria-label")).toBe("Ephemeral message notice");
		expect(footer.text()).toContain("Only you can see this");
		expect(wrapper.find("button[aria-label='Dismiss ephemeral message']").exists()).toBe(true);
	});

	it("renders command reply context when reply kind is command (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: {
				name: "wolfstar",
				reply: { kind: "command", user: "stella", commandName: "help" },
			},
			slots: { default: "Help response" },
		});

		// ASSERT
		expect(wrapper.find("article").classes()).toContain("discord-message-with-reply");
		const reply = wrapper.find("[role='complementary']");
		expect(reply.exists()).toBe(true);
		expect(reply.attributes("aria-label")).toContain("used the help slash command");
		expect(reply.text()).not.toContain("/help");
	});

	it("does not render reply chrome when reply is omitted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "wolfstar" },
			slots: { default: "Plain message" },
		});

		// ASSERT
		expect(wrapper.find("article").classes()).not.toContain("discord-message-with-reply");
		expect(wrapper.find("[role='complementary']").exists()).toBe(false);
		expect(wrapper.find(".discord-message-reply").exists()).toBe(false);
	});
});
