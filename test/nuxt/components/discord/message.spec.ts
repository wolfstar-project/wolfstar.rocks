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
		const article = wrapper.find("article");
		expect(article.exists()).toBe(true);
		expect(article.attributes("aria-label")).toBe("Message from WolfStar");
		expect(article.text()).toContain("WolfStar");
		const badge = wrapper.find("[aria-label='Verified application badge']");
		expect(badge.attributes("role")).toBe("img");
		expect(badge.text()).toBe("APP");
		const time = wrapper.find("time");
		expect(time.attributes("datetime")).toBe("2026-07-21T16:00:00");
		expect(time.text()).toBe("Today at 4:00 PM");
		expect(wrapper.text()).toContain("Moderation help is ready.");
	});

	it("omits the APP badge, time and ephemeral footer for a normal user message (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "stella" },
			slots: { default: "Can someone help?" },
		});

		// ASSERT
		expect(wrapper.find("[aria-label='Verified application badge']").exists()).toBe(false);
		expect(wrapper.find("time").exists()).toBe(false);
		expect(wrapper.find("article").attributes("data-ephemeral")).toBeUndefined();
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
		expect(wrapper.find("article").attributes("data-ephemeral")).toBe("true");
		const footer = wrapper.find("[role='status']");
		expect(footer.attributes("aria-label")).toBe("Ephemeral message notice");
		expect(footer.text()).toContain("Only you can see this");
		const dismiss = footer.find("button[aria-label='Dismiss ephemeral message']");
		expect(dismiss.attributes("type")).toBe("button");
		expect(dismiss.text()).toBe("Dismiss message");
	});

	it("puts the command reply above the author line (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: {
				name: "wolfstar",
				reply: { kind: "command", user: "stella", commandName: "help" },
			},
			slots: { default: "Help response" },
			attachTo: document.body,
		});

		// ASSERT
		const reply = wrapper.find("[role='complementary']");
		expect(reply.exists()).toBe(true);
		expect(reply.attributes("aria-label")).toContain("used the help slash command");
		expect(reply.text()).not.toContain("/help");
		const replyBox = reply.element.getBoundingClientRect();
		const badge = wrapper.find("[aria-label='Verified application badge']").element;
		expect(replyBox.bottom).toBeLessThanOrEqual(badge.getBoundingClientRect().top);
		// The reply line sits close to the author line, not a full column gap away.
		expect(getComputedStyle(wrapper.find("article").element).rowGap).toBe("6px");

		wrapper.unmount();
	});

	it("lets a caller's text colour reach the message content (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "baddie" },
			attrs: { class: "text-error" },
			slots: { default: "<span class='spam'>spam</span>" },
			attachTo: document.body,
		});

		// ASSERT
		const article = wrapper.find("article").element;
		const content = wrapper.find(".spam").element;
		expect(getComputedStyle(content).color).toBe(getComputedStyle(article).color);

		wrapper.unmount();
	});

	it("does not render reply chrome when reply is omitted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordMessage, {
			props: { name: "wolfstar" },
			slots: { default: "Plain message" },
		});

		// ASSERT
		expect(wrapper.find("[role='complementary']").exists()).toBe(false);
		expect(wrapper.find("[data-slot='message-reply']").exists()).toBe(false);
	});
});
