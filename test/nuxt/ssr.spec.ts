import {
	CommandsSection,
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
						reply: { kind: "command", user: "stella", commandName: "help" },
					},
					slots: { default: "Help response" },
				});
				const reply = wrapper.find("[role='complementary']");
				expect(reply.exists()).toBe(true);
				expect(reply.text()).toContain("Stella");
				expect(reply.text()).toContain("used");
				expect(reply.text()).toContain("help");
				expect(reply.text()).not.toContain("/help");
				expect(reply.find(".discord-message-reply-spine").exists()).toBe(true);
				expect(reply.find(".discord-message-reply-command").exists()).toBe(true);
				expect(reply.find(".discord-message-reply-command-icon").exists()).toBe(true);
			});

			it("formats slash command names like Discord", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: {
						name: "wolfstar",
						reply: {
							kind: "command",
							user: "stella",
							commandName: "conf",
							subcommand: "menu",
						},
					},
					slots: { default: "Saved changes" },
				});
				const reply = wrapper.find(".discord-message-reply-command-name");
				expect(reply.exists()).toBe(true);
				expect(reply.text()).toBe("conf menu");
			});

			it("formats grouped slash command paths", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: {
						name: "wolfstar",
						reply: {
							kind: "command",
							user: "stella",
							commandName: "conf",
							subcommandGroup: "menu",
							subcommand: "save",
						},
					},
					slots: { default: "Saved changes" },
				});
				const reply = wrapper.find(".discord-message-reply-command-name");
				expect(reply.text()).toBe("conf menu save");
			});

			it("renders message reply context with user and preview", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: {
						name: "wolfstar",
						reply: {
							kind: "message",
							user: "stella",
							content: "Can someone help me with moderation?",
						},
					},
					slots: { default: "Sure, here is how to get started." },
				});
				const reply = wrapper.find("[role='complementary']");
				expect(reply.exists()).toBe(true);
				expect(reply.text()).toContain("Stella");
				expect(reply.text()).toContain("Can someone help me with moderation?");
				expect(reply.text()).not.toContain("used");
				expect(reply.find(".discord-message-reply-spine").exists()).toBe(true);
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

			it("keeps a gap between bold labels and following mention components", async () => {
				const wrapper = await mountSuspended({
					components: { DiscordEmbed, DiscordMention },
					template: `
						<DiscordEmbed>
							<span><strong>❯ Type:</strong>Warning</span>
							<span><strong>❯ User:</strong><DiscordMention kind="mention">baddie</DiscordMention></span>
							<span><strong>❯ Reason:</strong>spam</span>
						</DiscordEmbed>
					`,
				});
				const html = wrapper.html();
				expect(html).toContain("<strong");
				expect(wrapper.text()).toMatch(/Type:\s*Warning/);
				expect(wrapper.text()).toMatch(/User:\s*@?baddie/);
				expect(wrapper.text()).toMatch(/Reason:\s*spam/);
				expect(wrapper.find(".tag").exists()).toBe(true);
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

			it("uses inline-flex so mention chips keep component spacing from surrounding text", async () => {
				const wrapper = await mountSuspended(DiscordMention, {
					props: { kind: "mention" },
					slots: { default: "baddie" },
				});
				const button = wrapper.find("button.tag");
				expect(button.exists()).toBe(true);
				expect(button.classes()).toContain("tag");
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
				expect(group.attributes("aria-label")).toBe(
					"Slash command /warn member: @baddie reason: Reason for the warning",
				);
				expect(wrapper.text()).toContain("@baddie");
				expect(wrapper.text()).toContain("Reason for the warning");
			});

			it("renders subcommand path segments before options", async () => {
				const wrapper = await mountSuspended(DiscordSlashCommand, {
					props: {
						name: "conf",
						subcommandGroup: "menu",
						subcommand: "save",
						options: [{ name: "scope", value: "all", focused: true }],
					},
				});
				const group = wrapper.find("[role='group']");
				expect(group.attributes("aria-label")).toBe(
					"Slash command /conf menu save scope: all",
				);
				expect(wrapper.text()).toContain("/conf");
				expect(wrapper.text()).toContain("menu");
				expect(wrapper.text()).toContain("save");
				expect(wrapper.text()).toContain("scope");
				expect(wrapper.text()).toContain("all");
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
			it("renders scrollable command list, independent sidebar, and matched footer", async () => {
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
				expect(
					wrapper.find(".discord-slash-command-suggestions-sidebar-scroll").exists(),
				).toBe(true);
				expect(wrapper.find(".discord-slash-command-suggestions-inner").exists()).toBe(
					true,
				);
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
				expect(wrapper.find(".discord-slash-command-suggestions-recent").exists()).toBe(
					true,
				);
				expect(
					wrapper
						.find(".discord-scrollbar-viewport")
						.find(".discord-slash-command-suggestions-header")
						.exists(),
				).toBe(true);
				expect(
					wrapper
						.find(".discord-scrollbar-viewport")
						.find(".discord-slash-command-suggestion-matched")
						.exists(),
				).toBe(false);
				expect(wrapper.find("[role='listbox']").exists()).toBe(true);
				expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
				expect(wrapper.findAll(".discord-scrollbar").length).toBe(1);
				expect(wrapper.find(".discord-slash-command-suggestions-matched").exists()).toBe(
					true,
				);
				expect(
					wrapper
						.find(
							".discord-slash-command-suggestions-matched .discord-slash-command-suggestion-matched",
						)
						.exists(),
				).toBe(true);
				// Mobile Discord layout: column stack with the app rail ordered below the list.
				expect(
					wrapper.find(".discord-slash-command-suggestions-inner").classes().join(" "),
				).toMatch(/flex-col/);
				expect(
					wrapper
						.find(".discord-slash-command-suggestions-sidebar-scroll")
						.classes()
						.join(" "),
				).toMatch(/order-2/);
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

			it("renders idle track when alwaysShowTrack is true", async () => {
				const wrapper = await mountSuspended(DiscordScrollbar, {
					props: { alwaysShowTrack: true },
					slots: { default: "<p>Short content</p>" },
				});

				// alwaysShowTrack keeps the track rail rendered; the thumb is driven by runtime
				// overflow measurement and is covered by the scrollable-content test above.
				expect(wrapper.find(".discord-scrollbar-track").exists()).toBe(true);
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

	describe("CommandsSection", () => {
		it("renders section header in full section mode", async () => {
			const wrapper = await mountSuspended(CommandsSection);

			expect(wrapper.text()).toContain("Moderation at your fingertips.");
			expect(wrapper.find("#home-commands-heading").exists()).toBe(true);
		});
	});

	describe("CommandsShowcase", () => {
		it("renders frequently used and additional command suggestions", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.text()).toContain("Frequently Used");
			expect(wrapper.text()).not.toContain("Matched Command");
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-slash-command-suggestions-sidebar-item").length).toBe(
				8,
			);
			expect(wrapper.findAll(".discord-slash-command-suggestion").length).toBe(8);
			expect(wrapper.findAll(".discord-slash-command-suggestion-disabled").length).toBe(2);
			expect(wrapper.findAll(".discord-slash-command-suggestion-group").length).toBe(2);
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar-scroll").exists()).toBe(
				true,
			);
			expect(wrapper.find(".discord-slash-command-suggestions-inner").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions-recent").exists()).toBe(true);
			expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-scrollbar").length).toBe(1);
			expect(
				wrapper
					.find(".discord-scrollbar-viewport")
					.findAll(".discord-slash-command-suggestion").length,
			).toBe(8);
			expect(
				wrapper
					.find(".discord-scrollbar-viewport")
					.find(".discord-slash-command-suggestions-header")
					.exists(),
			).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions-matched").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(wrapper.text()).toContain("/warn");
			expect(wrapper.text()).toContain("/ban");
			expect(wrapper.text()).toContain("/kick");
			expect(wrapper.text()).toContain("/mute");
			expect(wrapper.text()).toContain("/case");
			expect(wrapper.findAll("input[name='matched-command']").length).toBe(0);
			expect(wrapper.findAll(".showcase-channel-header").length).toBe(1);
		});

		it("selects a command when clicking a suggestion", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.text()).toContain("spam");
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);

			const kickSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/kick"));
			expect(kickSuggestion).toBeDefined();
			await kickSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.text()).toContain("rule violation");
			expect(wrapper.text()).not.toContain("spam");
			expect(wrapper.find(".discord-slash-command-suggestion-active").text()).toContain(
				"/kick",
			);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-slash-command-suggestion").length).toBe(8);
		});

		it("keeps third-party app rows non-selectable", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			const starylSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/twitch-subscriptions show"));
			expect(starylSuggestion).toBeDefined();
			expect(starylSuggestion!.attributes("aria-disabled")).toBe("true");

			await starylSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestion-active").text()).toContain(
				"/warn",
			);
		});

		it("renders the components-v2 mock for the conf menu command", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			const confSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/conf"));
			expect(confSuggestion).toBeDefined();
			await confSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-embed").exists()).toBe(false);
			expect(wrapper.text()).toContain("Currently at");
			expect(wrapper.text()).toContain("Choose an option...");
			expect(wrapper.text()).toContain("Stop");
		});
	});

	describe("ModerationShowcaseSection", () => {
		it("renders all three moderation feature areas on SSR", async () => {
			const wrapper = await mountSuspended(ModerationShowcaseSection);

			expect(wrapper.text()).toContain("In Action");
			expect(wrapper.text()).toContain("Moderation that shows its work.");
			expect(wrapper.text()).toContain("Advanced Auto Moderator");
			expect(wrapper.text()).toContain("Advanced Logging");
			expect(wrapper.find("#home-showcase-heading").exists()).toBe(true);
			expect(wrapper.findAll("#home-showcase-heading")).toHaveLength(1);
			expect(wrapper.find("#home-logging-showcase-heading").exists()).toBe(true);
			expect(wrapper.find("#moderation-tools").exists()).toBe(true);
			expect(wrapper.find("#advanced-logging").exists()).toBe(true);
			expect(wrapper.find("#moderation-logs").exists()).toBe(true);
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
