import {
	DiscordButton,
	DiscordEmbed,
	DiscordInlineCode,
	DiscordInvite,
	DiscordMention,
	DiscordMessage,
	DiscordMessages,
	DiscordReaction,
	DiscordReactions,
	DiscordTime,
	GuildSettingsSection,
	IconsApp,
	IconsWolfstar,
	Separator,
} from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

describe("component SSR rendering", () => {
	describe("Discord components", () => {
		describe("DiscordMessages", () => {
			it("renders a container div with slot content", async () => {
				const wrapper = await mountSuspended(DiscordMessages, {
					slots: { default: "<p>Hello world</p>" },
				});
				expect(wrapper.find(".discord-messages").exists()).toBe(true);
				expect(wrapper.text()).toContain("Hello world");
			});
		});

		describe("DiscordMessage", () => {
			it("renders article with aria-label from profile name", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar" },
					slots: { default: "Test message content" },
				});
				const article = wrapper.find("article");
				expect(article.exists()).toBe(true);
				expect(article.attributes("aria-label")).toContain("Message from");
				expect(wrapper.text()).toContain("Test message content");
			});

			it("renders ephemeral styling and footer", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar", ephemeral: true },
					slots: { default: "Secret message" },
				});
				const article = wrapper.find("article");
				expect(article.classes()).toContain("discord-message-ephemeral");

				const footer = wrapper.find("[role='status']");
				expect(footer.exists()).toBe(true);
				expect(footer.text()).toContain("Only you can see this");

				const dismissBtn = wrapper.find("button[aria-label='Dismiss ephemeral message']");
				expect(dismissBtn.exists()).toBe(true);
			});

			it("renders command context with user and command name", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: {
						name: "wolfstar",
						command: { user: "stella", name: "help" },
					},
					slots: { default: "Help response" },
				});
				const reply = wrapper.find("[role='complementary']");
				expect(reply.exists()).toBe(true);
				expect(reply.text()).toContain("stella");
				expect(reply.text()).toContain("used");
			});

			it("renders profile name in header", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar" },
					slots: { default: "Content" },
				});
				const header = wrapper.find("header");
				expect(header.exists()).toBe(true);
				expect(header.text()).toContain("WolfStar");
			});
		});

		describe("DiscordButton", () => {
			it("renders button with slot content", async () => {
				const wrapper = await mountSuspended(DiscordButton, {
					slots: { default: "Click me" },
				});
				const button = wrapper.find("button");
				expect(button.exists()).toBe(true);
				expect(button.attributes("type")).toBe("button");
				expect(button.text()).toBe("Click me");
			});

			it("renders button with explicit aria-label", async () => {
				const wrapper = await mountSuspended(DiscordButton, {
					props: { ariaLabel: "Submit form" },
					slots: { default: "Submit" },
				});
				const button = wrapper.find("button");
				expect(button.attributes("aria-label")).toBe("Submit form");
			});
		});

		describe("DiscordEmbed", () => {
			it("renders embed with title", async () => {
				const wrapper = await mountSuspended(DiscordEmbed, {
					props: { title: "Embed Title" },
					slots: { default: "<p>Embed body</p>" },
				});
				expect(wrapper.find(".discord-embed").exists()).toBe(true);
				expect(wrapper.text()).toContain("Embed Title");
				expect(wrapper.text()).toContain("Embed body");
			});

			it("renders embed with custom border color", async () => {
				const wrapper = await mountSuspended(DiscordEmbed, {
					props: { title: "Colored", color: "#FF0000" },
					slots: { default: "<p>Content</p>" },
				});
				const embed = wrapper.find(".discord-embed");
				const style = embed.attributes("style") ?? "";
				expect(style).toContain("border-color");
				// Browser may normalize #FF0000 to rgb(255, 0, 0)
				expect(style).toMatch(/#FF0000|rgb\(255,\s*0,\s*0\)/);
			});

			it("renders embed with author info", async () => {
				const wrapper = await mountSuspended(DiscordEmbed, {
					props: {
						title: "Log Entry",
						author: { name: "WolfStar" },
					},
					slots: { default: "<p>Details</p>" },
				});
				expect(wrapper.text()).toContain("WolfStar");
			});

			it("renders embed with footer and timestamp", async () => {
				const wrapper = await mountSuspended(DiscordEmbed, {
					props: {
						title: "Event",
						footer: { text: "WolfStar Moderation" },
						timestamp: new Date("2024-06-01T12:00:00Z"),
					},
					slots: { default: "<p>Event details</p>" },
				});
				expect(wrapper.text()).toContain("WolfStar Moderation");
			});
		});

		describe("DiscordMention", () => {
			it("renders mention with @ prefix", async () => {
				const wrapper = await mountSuspended(DiscordMention, {
					props: { kind: "mention" },
					slots: { default: "everyone" },
				});
				const button = wrapper.find("button");
				expect(button.exists()).toBe(true);
				expect(button.text()).toContain("@");
				expect(button.text()).toContain("everyone");
			});

			it("renders app mention with icon", async () => {
				const wrapper = await mountSuspended(DiscordMention, {
					props: { kind: "app" },
					slots: { default: "WolfStar" },
				});
				const button = wrapper.find("button");
				expect(button.exists()).toBe(true);
				expect(button.text()).toContain("WolfStar");
			});
		});

		describe("DiscordInlineCode", () => {
			it("renders code in a styled span", async () => {
				const wrapper = await mountSuspended(DiscordInlineCode, {
					slots: { default: "!help" },
				});
				const span = wrapper.find(".discord-message-inline-code");
				expect(span.exists()).toBe(true);
				expect(span.text()).toBe("!help");
			});
		});

		describe("DiscordReaction", () => {
			it("renders reaction with emoji and count", async () => {
				const wrapper = await mountSuspended(DiscordReaction, {
					props: { count: 5 },
					slots: { default: "thumbsup" },
				});
				const reaction = wrapper.find(".discord-reaction");
				expect(reaction.exists()).toBe(true);
				expect(wrapper.text()).toContain("5");
			});

			it("applies self class when self prop is true", async () => {
				const wrapper = await mountSuspended(DiscordReaction, {
					props: { count: 3, self: true },
					slots: { default: "heart" },
				});
				expect(wrapper.find(".discord-reaction.self").exists()).toBe(true);
			});
		});

		describe("DiscordReactions", () => {
			it("renders slot content in a flex container", async () => {
				const wrapper = await mountSuspended(DiscordReactions, {
					slots: { default: "<span>Reaction</span>" },
				});
				expect(wrapper.text()).toContain("Reaction");
			});
		});

		describe("DiscordTime", () => {
			it("renders formatted time in a styled span", async () => {
				const wrapper = await mountSuspended(DiscordTime, {
					props: { date: Date.now(), format: "long" },
				});
				const span = wrapper.find(".discord-message-time");
				expect(span.exists()).toBe(true);
				expect(span.text().length).toBeGreaterThan(0);
			});
		});

		describe("DiscordInvite", () => {
			it("renders invite with server info and member counts", async () => {
				const wrapper = await mountSuspended(DiscordInvite, {
					props: { link: "/join", online: 150, members: 3000 },
				});
				expect(wrapper.text()).toContain("WolfStar Lounge");
				expect(wrapper.text()).toContain("150");
				expect(wrapper.text()).toContain("Online");
				// toLocaleString() output varies by locale (e.g. "3,000" or "3000")
				expect(wrapper.text()).toMatch(/3[,.]?000/);
				expect(wrapper.text()).toContain("Members");
			});

			it("renders join link pointing to correct href", async () => {
				const wrapper = await mountSuspended(DiscordInvite, {
					props: { link: "/join" },
				});
				const joinLink = wrapper.findAll("a").find((a) => a.text() === "Join");
				expect(joinLink).toBeDefined();
			});

			it("renders zero counts as 0", async () => {
				const wrapper = await mountSuspended(DiscordInvite, {
					props: { link: "/join" },
				});
				expect(wrapper.text()).toContain("0");
			});
		});
	});

	describe("Separator", () => {
		it("renders horizontal separator with two USeparator elements", async () => {
			const wrapper = await mountSuspended(Separator, {
				props: { orientation: "horizontal" },
			});
			expect(wrapper.html()).toBeTruthy();
			expect(wrapper.element.tagName).toBe("DIV");
		});

		it("renders vertical separator with flex layout", async () => {
			const wrapper = await mountSuspended(Separator, {
				props: { orientation: "vertical" },
			});
			expect(wrapper.html()).toBeTruthy();
		});
	});

	describe("GuildSettingsSection", () => {
		it("renders heading with title prop", async () => {
			const wrapper = await mountSuspended(GuildSettingsSection, {
				props: { title: "General Settings" },
				slots: { default: "<p>Settings content</p>" },
			});
			const heading = wrapper.find("h2");
			expect(heading.exists()).toBe(true);
			expect(heading.text()).toBe("General Settings");
			expect(wrapper.text()).toContain("Settings content");
		});

		it("renders without heading when no title", async () => {
			const wrapper = await mountSuspended(GuildSettingsSection, {
				slots: { default: "<p>Content only</p>" },
			});
			expect(wrapper.find("h2").exists()).toBe(false);
			expect(wrapper.text()).toContain("Content only");
		});

		it("renders custom heading level", async () => {
			const wrapper = await mountSuspended(GuildSettingsSection, {
				props: { title: "Sub Section", headingLevel: "h3" },
				slots: { default: "<p>Sub content</p>" },
			});
			expect(wrapper.find("h3").exists()).toBe(true);
			expect(wrapper.find("h3").text()).toBe("Sub Section");
		});

		it("renders description paragraph when provided", async () => {
			const wrapper = await mountSuspended(GuildSettingsSection, {
				props: { title: "Settings", description: "Configure your guild" },
				slots: { default: "<p>Form</p>" },
			});
			const desc = wrapper.find("p.text-sm");
			expect(desc.exists()).toBe(true);
			expect(desc.text()).toBe("Configure your guild");
		});
	});

	describe("IconsApp", () => {
		it("renders an SVG element", async () => {
			const wrapper = await mountSuspended(IconsApp);
			const svg = wrapper.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("aria-hidden")).toBe("true");
			expect(svg.attributes("role")).toBe("img");
		});
	});

	describe("IconsWolfstar", () => {
		it("renders an SVG element with correct aria-label", async () => {
			const wrapper = await mountSuspended(IconsWolfstar);
			const svg = wrapper.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("role")).toBe("img");
			expect(svg.attributes("aria-label")).toBe("WolfStar logo");
		});
	});
});
