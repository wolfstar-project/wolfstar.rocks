import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordEmbed from "~/components/discord/embed.vue";

describe("DiscordEmbed", () => {
	it("renders title, author, footer, and slot body (positive)", async () => {
		// ARRANGE
		const timestamp = new Date("2026-07-21T16:00:00Z");

		// ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: {
				title: "Warn issued",
				color: "oklch(63% 0.2 25)",
				author: { name: "WolfStar", icon: "/avatars/wolfstar.png" },
				footer: { text: "Case #42", icon: "/avatars/wolfstar.png" },
				timestamp,
			},
			slots: { default: "<p>User was warned for spam.</p>" },
		});

		// ASSERT
		const embed = wrapper.find("[role='complementary']");
		expect(embed.attributes("aria-label")).toContain("Warn issued");
		const style = embed.attributes("style") ?? "";
		// Browser may normalize `oklch(63% …)` to `oklch(0.63 …)`.
		expect(style).toMatch(/oklch\(63%\s+0\.2\s+25\)|oklch\(0\.63\s+0\.2\s+25\)/);
		expect(wrapper.text()).toContain("Warn issued");
		expect(wrapper.text()).toContain("WolfStar");
		expect(wrapper.text()).toContain("Case #42");
		expect(wrapper.text()).toContain("User was warned for spam.");
		expect(wrapper.find('img[alt="WolfStar avatar"]').exists()).toBe(true);
		expect(wrapper.find("time").attributes("datetime")).toBe(timestamp.toISOString());
	});

	it("sets no accent color and no author icon when both are omitted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { title: "Untitled" },
		});

		// ASSERT
		expect(wrapper.find("[role='complementary']").attributes("style")).toBeUndefined();
		expect(wrapper.find("img").exists()).toBe(false);
		expect(wrapper.text()).not.toContain("•");
	});

	it("renders the timestamp alone, with no separator, when there is no footer (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { timestamp: new Date("2026-01-01T00:00:00Z") },
		});

		// ASSERT
		expect(wrapper.find("time").text().length).toBeGreaterThan(0);
		expect(wrapper.find("img").exists()).toBe(false);
		expect(wrapper.text()).not.toContain("•");
	});

	it("uses a middle-dot footer separator between text and timestamp (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: {
				footer: { text: "Case 3", icon: "/avatars/wolfstar.png" },
				timestamp: new Date("2026-07-20T13:54:00Z"),
			},
		});

		// ASSERT
		const text = wrapper.text();
		expect(text).toMatch(/Case 3\s*•/);
		expect(text).not.toContain("|");
	});

	it("names the embed after its author when it has no title (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { author: { name: "WolfStar" } },
		});

		// ASSERT
		expect(wrapper.find("[role='complementary']").attributes("aria-label")).toContain(
			"WolfStar",
		);
	});

	it("keeps the markup of the description slot (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			slots: {
				default: `
					<blockquote><strong>Type:</strong>Warning</blockquote>
					<p><em>Please use <code>/case edit</code> to set a reason.</em></p>
				`,
			},
		});

		// ASSERT
		expect(wrapper.find("blockquote").exists()).toBe(true);
		expect(wrapper.find("code").text()).toBe("/case edit");
	});
});
