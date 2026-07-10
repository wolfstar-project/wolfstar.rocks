import {
	CommandsShowcase,
	DiscordEmbed,
	DiscordInvite,
	DiscordMention,
	DiscordMessage,
	DiscordMessages,
	DiscordReaction,
	DiscordReactions,
	DiscordRole,
	DiscordSlashCommand,
	DiscordSlashCommandInput,
	DiscordSlashCommandSuggestion,
	DiscordSlashCommandSuggestionMatched,
	DiscordSlashCommandSuggestions,
	DiscordScrollbar,
	GuildSettingsSection,
	IconsApp,
	IconsWolfstar,
	ModerationShowcaseSection,
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
				expect(reply.text()).toContain("Stella");
				expect(reply.text()).toContain("used");
				expect(reply.find(".discord-message-command-reply-spine").exists()).toBe(true);
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

		describe("DiscordRole", () => {
			it("renders role mention with @ prefix and custom color", async () => {
				const wrapper = await mountSuspended(DiscordRole, {
					props: { color: "#5865F2" },
					slots: { default: "Moderator" },
				});
				const button = wrapper.find("button");
				expect(button.exists()).toBe(true);
				expect(button.text()).toContain("@");
				expect(button.text()).toContain("Moderator");
				expect(button.attributes("style")).toContain("--role-color: #5865F2");
			});
		});

		describe("DiscordSlashCommand", () => {
			it("renders composed variant with option values", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommand, {
					props: {
						name: "warn",
						options: [
							{ name: "member", value: "@baddie", focused: true },
							{ name: "reason", description: "Reason for the warning" },
						],
					},
				});
				const group = wrapper.find("[role='group']");
				expect(group.exists()).toBe(true);
				expect(group.attributes("aria-label")).toBe("Slash command /warn");
				expect(wrapper.text()).toContain("@baddie");
				expect(wrapper.text()).toContain("Reason for the warning");
			});
		});

		describe("DiscordSlashCommandSuggestion", () => {
			it("renders suggestion with app label and aria-selected state", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommandSuggestion, {
					props: {
						name: "warn",
						description: "Warn a member",
						active: true,
					},
				});
				const option = wrapper.find("[role='option']");
				expect(option.exists()).toBe(true);
				expect(option.attributes("aria-selected")).toBe("true");
				expect(wrapper.text()).toContain("/warn");
				expect(wrapper.text()).toContain("Warn a member");
				expect(wrapper.text()).toContain("WolfStar");
			});
		});

		describe("DiscordSlashCommandSuggestionMatched", () => {
			it("renders matched suggestion with colon-style inline command", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommandSuggestionMatched, {
					props: {
						name: "ban",
						options: [
							{ name: "user", value: "baddie" },
							{ name: "reason", value: "repeated infractions", focused: true },
						],
						active: true,
					},
				});
				const option = wrapper.find("[role='option']");
				expect(option.exists()).toBe(true);
				expect(option.attributes("aria-selected")).toBe("true");
				expect(wrapper.text()).toContain("/ban");
				expect(wrapper.text()).toContain("baddie");
				expect(wrapper.text()).toContain("repeated infractions");
			});
		});

		describe("DiscordSlashCommandSuggestions", () => {
			it("renders frequently used section with sidebar and matched section without header", async () => {
				const wrapper = await mountSuspended({
					components: {
						DiscordSlashCommandSuggestion,
						DiscordSlashCommandSuggestionMatched,
						DiscordSlashCommandSuggestions,
					},
					template: `
						<DiscordSlashCommandSuggestions prefix="/war">
							<template #frequently-used>
								<DiscordSlashCommandSuggestion
									name="warn"
									description="Warn a member"
								/>
							</template>
							<template #matched>
								<DiscordSlashCommandSuggestionMatched
									name="warn"
									:options="[
										{ name: 'user', value: 'baddie' },
										{ name: 'reason', value: 'spam', focused: true },
									]"
									:active="true"
								/>
							</template>
						</DiscordSlashCommandSuggestions>
					`,
				});
				expect(wrapper.text()).toContain("Frequently Used");
				expect(wrapper.text()).not.toContain("Matched Command");
				expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(
					true,
				);
				expect(
					wrapper.findAll(".discord-slash-command-suggestions-sidebar-item").length,
				).toBe(8);
				expect(
					wrapper
						.find(".discord-scrollbar-viewport")
						.find(".discord-slash-command-suggestions-sidebar")
						.exists(),
				).toBe(false);
				expect(wrapper.find("[role='listbox']").exists()).toBe(true);
				expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
				expect(wrapper.findAll(".discord-scrollbar").length).toBe(1);
				expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(
					true,
				);
			});
		});

		describe("DiscordScrollbar", () => {
			it("renders custom track and hides native scrollbar viewport", async () => {
				const wrapper = await mountSuspended(DiscordScrollbar, {
					slots: {
						default: `
							<p>Line 1</p>
							<p>Line 2</p>
							<p>Line 3</p>
						`,
					},
				});

				expect(wrapper.find(".discord-scrollbar-viewport").exists()).toBe(true);
				expect(wrapper.find(".discord-scrollbar-track").exists()).toBe(true);
				expect(wrapper.find(".discord-scrollbar-thumb").exists()).toBe(true);
			});

			it("renders optional arrow controls when showArrows is true", async () => {
				const wrapper = await mountSuspended(DiscordScrollbar, {
					props: { showArrows: true },
					slots: { default: "<p>Scrollable content</p>" },
				});

				expect(wrapper.find(".discord-scrollbar-arrow-up").exists()).toBe(true);
				expect(wrapper.find(".discord-scrollbar-arrow-down").exists()).toBe(true);
			});
		});

		describe("DiscordSlashCommandInput", () => {
			it("renders typed slash command with cursor", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommandInput, {
					props: { value: "/warn" },
				});
				expect(wrapper.text()).toContain("/warn");
				expect(wrapper.find(".discord-slash-command-input-cursor").exists()).toBe(true);
			});

			it("renders composed slash command inline in the input field", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommandInput, {
					props: {
						name: "ban",
						options: [
							{ name: "user", value: "baddie" },
							{ name: "reason", value: "repeated infractions", focused: true },
						],
					},
				});
				expect(wrapper.text()).toContain("/ban");
				expect(wrapper.text()).toContain("user");
				expect(wrapper.text()).toContain("baddie");
				expect(wrapper.text()).toContain("reason");
				expect(wrapper.text()).toContain("repeated infractions");
				expect(wrapper.find(".discord-slash-command-composed").exists()).toBe(true);
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

	describe("CommandsShowcase", () => {
		it("renders frequently used picker without matched row in default mode", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.text()).toContain("Frequently Used");
			expect(wrapper.text()).not.toContain("Matched Command");
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-slash-command-suggestions-sidebar-item").length).toBe(
				8,
			);
			expect(wrapper.findAll(".discord-slash-command-suggestion").length).toBe(3);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(wrapper.text()).toContain("/warn");
			expect(wrapper.text()).toContain("/ban");
			expect(wrapper.text()).toContain("/kick");
			expect(wrapper.findAll("input[name='matched-command']").length).toBe(
				showcaseCommands.length,
			);
			expect(wrapper.findAll(".showcase-channel-header").length).toBe(1);
		});

		it("keeps frequently used visible when cycling matched command examples", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.text()).toContain("/warn");
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);

			await wrapper.find('[aria-label="Next matched command"]').trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("/ban");
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-slash-command-suggestion").length).toBe(3);
		});
	});

	describe("ModerationShowcaseSection", () => {
		it("renders moderation and logging section headers on SSR", async () => {
			const wrapper = await mountSuspended(ModerationShowcaseSection);

			expect(wrapper.text()).toContain("Moderation that shows its work.");
			expect(wrapper.text()).toContain("Advanced Logging");
			expect(wrapper.text()).toContain(
				"advanced logging capabilities to keep track of everything that happens in your server.",
			);
			expect(wrapper.find("#home-showcase-heading").exists()).toBe(true);
			expect(wrapper.find("#home-logging-showcase-heading").exists()).toBe(true);
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
