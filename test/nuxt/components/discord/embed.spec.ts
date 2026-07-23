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
		const embed = wrapper.find(".discord-embed");
		expect(embed.exists()).toBe(true);
		const accent = wrapper.find(".discord-embed-left-border");
		expect(accent.exists()).toBe(true);
		const style = accent.attributes("style") ?? "";
		// Browser may normalize `oklch(63% …)` to `oklch(0.63 …)`.
		expect(style).toMatch(/oklch\(63%\s+0\.2\s+25\)|oklch\(0\.63\s+0\.2\s+25\)/);
		expect(wrapper.text()).toContain("Warn issued");
		expect(wrapper.text()).toContain("WolfStar");
		expect(wrapper.text()).toContain("Case #42");
		expect(wrapper.text()).toContain("User was warned for spam.");
		expect(wrapper.find('img[alt="WolfStar avatar"]').exists()).toBe(true);
		expect(wrapper.find(".discord-embed-footer-image").exists()).toBe(true);
		expect(wrapper.find(".discord-embed-footer-separator").text()).toBe("•");
	});

	it("falls back to the default border color when color is omitted (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { title: "Untitled" },
		});

		// ASSERT
		const style = wrapper.find(".discord-embed-left-border").attributes("style") ?? "";
		expect(style).toContain("var(--discord-embed-default-border)");
		expect(wrapper.find('img[alt$="avatar"]').exists()).toBe(false);
		expect(wrapper.text()).not.toContain("•");
	});

	it("applies the light theme class when theme is light (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { title: "Light embed", theme: "light" },
		});

		// ASSERT
		expect(wrapper.find(".discord-embed--light").exists()).toBe(true);
		expect(wrapper.find(".discord-embed").classes()).toContain("discord-embed--light");
	});

	it("does not render footer chrome when only a timestamp is provided (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordEmbed, {
			props: { timestamp: new Date("2026-01-01T00:00:00Z") },
		});

		// ASSERT
		expect(wrapper.find(".discord-embed-footer-image").exists()).toBe(false);
		expect(wrapper.find(".discord-embed-footer").exists()).toBe(true);
		expect(wrapper.text().length).toBeGreaterThan(0);
		expect(wrapper.find(".discord-embed-footer-separator").exists()).toBe(false);
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
		const footerText = wrapper.find(".discord-embed-footer").text();
		expect(footerText).toMatch(/Case 3\s*•/);
		expect(footerText).not.toContain("|");
		expect(wrapper.find(".discord-embed-footer-separator").text()).toBe("•");
	});

	it("styles inline code and blockquotes in the description slot (positive)", async () => {
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
		expect(wrapper.find(".discord-embed-description blockquote").exists()).toBe(true);
		expect(wrapper.find(".discord-embed-description code").text()).toBe("/case edit");
		expect(wrapper.find(".discord-embed-description em").exists()).toBe(true);
	});
});
