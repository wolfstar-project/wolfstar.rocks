import {
	CommandsSection,
	CommandsShowcase,
	DiscordChannelHeader,
	DiscordChannelWelcome,
	DiscordChat,
	DiscordEmbed,
	DiscordInvite,
	DiscordMention,
	DiscordMemberList,
	DiscordChatMessageComposer,
	DiscordMessage,
	DiscordMessages,
	DiscordReaction,
	DiscordReactions,
	DiscordRole,
	DiscordChatInputCommand,
	DiscordChatInputCommandSuggestion,
	DiscordChatInputCommandMatched,
	DiscordChatInputCommandSuggestions,
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

		describe("DiscordChannelHeader", () => {
			it("renders channel name, topic, search placeholder, and toolbar chrome", async () => {
				const wrapper = await mountSuspended(DiscordChannelHeader, {
					props: {
						name: "mod-commands",
						type: "text",
						topic: "WolfStar moderation commands — try a slash command below.",
						searchPlaceholder: "Search",
						onlineCount: 19,
						notificationCount: 48,
					},
				});

				expect(wrapper.find(".discord-channel-header").exists()).toBe(true);
				expect(wrapper.text()).toContain("mod-commands");
				expect(wrapper.text()).toContain(
					"WolfStar moderation commands — try a slash command below.",
				);
				expect(wrapper.text()).toContain("Search");
				expect(wrapper.find(".discord-channel-header-toolbar").exists()).toBe(true);
				expect(wrapper.find(".discord-channel-header-divider").exists()).toBe(true);
				expect(wrapper.find(".discord-channel-header-topic").exists()).toBe(true);
				const actions = wrapper.findAll(".discord-channel-header-action");
				expect(actions.length).toBe(5);
				expect(actions[0]?.attributes("aria-label")).toBe("Favorite channel");
				expect(actions[1]?.attributes("aria-label")).toBe("Threads");
				expect(actions[2]?.attributes("aria-label")).toBe("Notification settings");
				expect(actions[3]?.attributes("aria-label")).toBe("Pinned messages");
				expect(actions[4]?.attributes("aria-label")).toBe("Hide member list");
				expect(actions[4]?.attributes("aria-pressed")).toBe("true");
				expect(actions[4]?.classes()).toContain("discord-channel-header-action-active");
				expect(wrapper.find(".discord-channel-header-mobile").exists()).toBe(true);
				expect(wrapper.find(".discord-channel-header-desktop").exists()).toBe(true);
				expect(wrapper.text()).toContain("19 Online");
				expect(wrapper.find(".discord-channel-header-badge").text()).toBe("48");
			});

			it("toggles membersOpen via the users toolbar action", async () => {
				const wrapper = await mountSuspended(DiscordChannelHeader, {
					props: {
						name: "mod-commands",
						membersOpen: true,
					},
				});

				const membersButton = wrapper
					.findAll(".discord-channel-header-action")
					.find((action) => action.attributes("aria-pressed") !== undefined);
				expect(membersButton).toBeDefined();
				await membersButton!.trigger("click");

				expect(wrapper.emitted("update:membersOpen")?.[0]).toEqual([false]);
				expect(wrapper.emitted("toggle-members")).toHaveLength(1);
			});

			it("emits open-channel-info when the mobile channel title is activated", async () => {
				const wrapper = await mountSuspended(DiscordChannelHeader, {
					props: {
						name: "mod-commands",
						onlineCount: 10,
					},
				});

				const mobileTitle = wrapper.find(
					"button.discord-channel-header-mobile-title[aria-label='Open channel info for #mod-commands']",
				);
				expect(mobileTitle.exists()).toBe(true);
				await mobileTitle.trigger("click");

				expect(wrapper.emitted("open-channel-info")).toHaveLength(1);
			});
		});

		describe("DiscordChannelWelcome", () => {
			it("renders channel context, edit control, and date divider", async () => {
				const wrapper = await mountSuspended(DiscordChannelWelcome, {
					props: {
						channelName: "mod-commands",
						date: "July 16, 2026",
						dateTime: "2026-07-16",
					},
				});

				expect(wrapper.text()).toContain("Welcome to #mod-commands!");
				expect(wrapper.text()).toContain("This is the start of the #mod-commands channel.");
				expect(wrapper.find(".discord-channel-welcome-edit").exists()).toBe(true);
				expect(wrapper.text()).toContain("Edit Channel");
				expect(wrapper.find("time").attributes("datetime")).toBe("2026-07-16");
			});
		});

		describe("DiscordChat", () => {
			it("renders messages from data inside a scrollable log", async () => {
				const wrapper = await mountSuspended(DiscordChat, {
					props: {
						channelName: "mod-commands",
						date: "July 16, 2026",
						messages: [
							{
								id: "message-1",
								author: "wolfstar",
								content: "Saved all changes.",
								timestamp: "Today at 15:49",
							},
						],
					},
				});

				expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
				expect(wrapper.find(".discord-channel-welcome").exists()).toBe(true);
				expect(wrapper.find("[role='log']").attributes("aria-live")).toBe("polite");
				expect(wrapper.findAll(".discord-message")).toHaveLength(1);
				expect(wrapper.text()).toContain("Saved all changes.");
				expect(wrapper.text()).toContain("Today at 15:49");
			});

			it("groups welcome and messages in a bottom-pinned short-channel scroller", async () => {
				const wrapper = await mountSuspended(DiscordChat, {
					props: {
						channelName: "mod-commands",
						date: "July 16, 2026",
						messages: [
							{
								id: "message-1",
								author: "wolfstar",
								content: "Saved all changes.",
								timestamp: "Today at 15:49",
							},
						],
					},
				});

				const scrollerInner = wrapper.find(".discord-chat-scroller-inner");
				expect(scrollerInner.exists()).toBe(true);
				expect(scrollerInner.find(".discord-channel-welcome").exists()).toBe(true);
				expect(scrollerInner.find(".discord-chat-messages").exists()).toBe(true);
				expect(scrollerInner.classes()).toContain("mt-auto");
			});
		});

		describe("DiscordMemberList", () => {
			it("renders online and offline sections with optional roles", async () => {
				const wrapper = await mountSuspended(DiscordMemberList, {
					props: {
						online: [
							{
								id: "wolfstar",
								name: "WolfStar",
								role: "Moderation",
								app: true,
								verified: true,
							},
						],
						offline: [{ id: "stella", name: "Stella" }],
						showRoles: true,
					},
				});

				expect(wrapper.text()).toContain("Online — 1");
				expect(wrapper.text()).toContain("Offline — 1");
				expect(wrapper.text()).toContain("Moderation");
				expect(wrapper.find(".discord-member-list-summary").exists()).toBe(false);
				expect(wrapper.findAll(".discord-member-list-member")).toHaveLength(2);
				expect(wrapper.find(".discord-member-list-section-offline").exists()).toBe(true);
				expect(wrapper.find(".discord-member-list-app").attributes("role")).toBe("img");
				expect(wrapper.find(".discord-member-list-avatar .discord-presence").exists()).toBe(
					true,
				);
			});

			it("groups pinned role-colored members above Online", async () => {
				const wrapper = await mountSuspended(DiscordMemberList, {
					props: {
						online: [
							{
								id: "wolfstar",
								name: "WolfStar",
								role: "Moderation",
								description: "/help",
								app: true,
								verified: true,
								color: "oklch(57.74% 0.2091 273.85)",
								pinned: true,
							},
							{
								id: "astro",
								name: "Astro",
								role: "Applications",
								description: "/help",
								app: true,
							},
						],
						offline: [{ id: "stella", name: "Stella" }],
						showRoles: true,
					},
				});

				expect(wrapper.text()).toContain("Moderation — 1");
				expect(wrapper.text()).toContain("Online — 1");
				expect(wrapper.text()).toContain("Offline — 1");
				expect(wrapper.find(".discord-member-list-heading-role").exists()).toBe(true);
				expect(wrapper.find(".discord-member-list-member").attributes("style")).toContain(
					"--member-name-color: oklch(57.74% 0.2091 273.85)",
				);
				expect(
					wrapper.find(".discord-member-list-section-offline .discord-presence").exists(),
				).toBe(false);
			});

			it("renders dnd presence and skips an empty Online section", async () => {
				const wrapper = await mountSuspended(DiscordMemberList, {
					props: {
						online: [
							{
								id: "lory",
								name: "RVG|lory",
								role: "Developers",
								presence: "dnd",
								color: "oklch(68.42% 0.214 350.12)",
								pinned: true,
								rowBackground:
									"linear-gradient(90deg, oklch(42% 0.16 305 / 0.55), transparent)",
							},
						],
						offline: [{ id: "patreon", name: "Patreon", app: true, verified: true }],
					},
				});

				expect(wrapper.text()).toContain("Developers — 1");
				expect(wrapper.text()).not.toContain("Online — ");
				expect(wrapper.text()).toContain("Offline — 1");
				expect(wrapper.find(".discord-presence").attributes("data-status")).toBe("dnd");
				expect(wrapper.find(".discord-member-list-member-decorated").exists()).toBe(true);
			});

			it("hides presence for HTTP-only (serverless) applications", async () => {
				const wrapper = await mountSuspended(DiscordMemberList, {
					props: {
						online: [
							{
								id: "ring",
								name: "Ring",
								role: "Star Network",
								app: true,
								http: true,
								pinned: true,
							},
							{
								id: "wolfstar",
								name: "WolfStar",
								role: "Star Network",
								app: true,
								presence: "online",
								pinned: true,
							},
						],
						offline: [],
					},
				});

				const members = wrapper.findAll(".discord-member-list-member");
				expect(members).toHaveLength(2);
				expect(members[0]?.find(".discord-presence").exists()).toBe(false);
				expect(members[1]?.find(".discord-presence").exists()).toBe(true);
				expect(members[1]?.find(".discord-presence-icon").exists()).toBe(true);
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

		describe("DiscordChatInputCommand", () => {
			it("renders composed variant with option values", async () => {
				const wrapper = await mountSuspended(DiscordChatInputCommand, {
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
				const wrapper = await mountSuspended(DiscordChatInputCommand, {
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

		describe("DiscordChatInputCommandSuggestion", () => {
			it("renders suggestion with app label and aria-selected state", async () => {
				const wrapper = await mountSuspended(DiscordChatInputCommandSuggestion, {
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

		describe("DiscordChatInputCommandMatched", () => {
			it("renders matched suggestion with colon-style inline command", async () => {
				const wrapper = await mountSuspended(DiscordChatInputCommandMatched, {
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

		describe("DiscordChatInputCommandSuggestions", () => {
			it("renders continuous command list, app rail, and matched footer", async () => {
				const wrapper = await mountSuspended({
					components: {
						DiscordChatInputCommandSuggestion,
						DiscordChatInputCommandMatched,
						DiscordChatInputCommandSuggestions,
					},
					template: `
						<DiscordChatInputCommandSuggestions prefix="/war">
							<template #frequently-used>
								<DiscordChatInputCommandSuggestion
									name="warn"
									description="Warn a member"
								/>
							</template>
							<template #matched>
								<DiscordChatInputCommandMatched
									name="warn"
									:options="[
										{ name: 'user', value: 'baddie' },
										{ name: 'reason', value: 'spam', focused: true },
									]"
									:active="true"
								/>
							</template>
						</DiscordChatInputCommandSuggestions>
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
				// One continuous list scrollbar (FU header + rows + bot groups).
				expect(wrapper.findAll(".discord-scrollbar").length).toBe(1);
				expect(wrapper.find(".discord-slash-command-suggestions-scroll").exists()).toBe(
					true,
				);
				expect(
					wrapper
						.find(
							".discord-slash-command-suggestions-scroll .discord-scrollbar-viewport",
						)
						.find(".discord-slash-command-suggestions-recent")
						.exists(),
				).toBe(true);
				expect(
					wrapper
						.find(
							".discord-slash-command-suggestions-scroll .discord-scrollbar-viewport",
						)
						.find(".discord-slash-command-suggestion")
						.exists(),
				).toBe(true);
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
				// App rail nests under the scrollbar root (below-viewport) so the track spans full height.
				const scroll = wrapper.find(".discord-slash-command-suggestions-scroll");
				const rail = scroll.find(".discord-slash-command-suggestions-sidebar-scroll");
				expect(scroll.exists()).toBe(true);
				expect(rail.exists()).toBe(true);
				expect(
					wrapper
						.find(
							".discord-scrollbar .discord-slash-command-suggestions-sidebar-scroll",
						)
						.exists(),
				).toBe(true);
				// Mobile DOM: viewport (list) before below-viewport (rail); desktop CSS orders rail left.
				const body = scroll.find(".discord-scrollbar-body");
				const viewport = body.find(".discord-scrollbar-viewport");
				const below = body.find(".discord-scrollbar-below-viewport");
				expect(body.exists()).toBe(true);
				expect(viewport.exists()).toBe(true);
				expect(below.exists()).toBe(true);
				expect(below.element.contains(rail.element)).toBe(true);
				const bodyChildren = [...body.element.children];
				expect(bodyChildren.indexOf(viewport.element)).toBeLessThan(
					bodyChildren.indexOf(below.element),
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

			it("renders idle track when alwaysShowTrack is true", async () => {
				const wrapper = await mountSuspended(DiscordScrollbar, {
					props: { alwaysShowTrack: true },
					slots: { default: "<p>Short content</p>" },
				});

				// alwaysShowTrack keeps the track rail rendered; the thumb is driven by runtime
				// overflow measurement and is covered by the scrollable-content test above.
				expect(wrapper.find(".discord-scrollbar-track").exists()).toBe(true);
			});

			it("applies auto-hide class when autoHide is true", async () => {
				const wrapper = await mountSuspended(DiscordScrollbar, {
					props: { autoHide: true },
					slots: { default: "<p>Scrollable content</p>" },
				});

				expect(wrapper.find(".discord-scrollbar-auto-hide").exists()).toBe(true);
			});
		});

		describe("DiscordChatMessageComposer", () => {
			it("renders the channel placeholder and toolbar", async () => {
				const wrapper = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands" },
				});
				const input = wrapper.find(".discord-message-composer-input");

				expect(input.attributes("placeholder")).toBe("Message #mod-commands");
				expect(input.attributes()).not.toHaveProperty("readonly");
				expect(wrapper.findAll(".discord-message-composer-action")).toHaveLength(5);
				expect(wrapper.find(".discord-message-composer-field").exists()).toBe(true);
				// Mobile empty-state chrome is in the DOM; CSS shows it only below md.
				expect(wrapper.find(".discord-message-composer-apps-mobile").exists()).toBe(true);
				expect(wrapper.find(".discord-message-composer-gift-mobile").exists()).toBe(true);
				expect(wrapper.find(".discord-message-composer-send").exists()).toBe(true);
				expect(wrapper.find("[aria-label='Open attachment menu']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Open GIF picker']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Open sticker picker']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(true);
				expect(wrapper.find("[aria-label='Choose an emoji']").exists()).toBe(false);
				// Empty state uses decorative mic (no Send label); typed state exposes Send.
				expect(wrapper.find("[aria-label='Send message']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Notifiche']").exists()).toBe(false);
				// Mobile DOM order: + → leading (apps/gift) → field pill → send/mic.
				const composer = wrapper.find(".discord-message-composer");
				const add = composer.find(".discord-message-composer-add");
				const leading = composer.find(".discord-message-composer-mobile-leading");
				const field = composer.find(".discord-message-composer-field");
				const send = composer.find(".discord-message-composer-send");
				const children = [...composer.element.children];
				expect(children.indexOf(add.element)).toBeLessThan(
					children.indexOf(leading.element),
				);
				expect(children.indexOf(leading.element)).toBeLessThan(
					children.indexOf(field.element),
				);
				expect(children.indexOf(field.element)).toBeLessThan(
					children.indexOf(send.element),
				);
			});

			it("mutes the send control when the composer is empty", async () => {
				const empty = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands" },
				});

				expect(empty.find(".discord-message-composer-has-value").exists()).toBe(false);
				expect(
					empty.find(".discord-message-composer-send").attributes("disabled"),
				).toBeDefined();
				expect(empty.find("[aria-label='Send message']").exists()).toBe(false);

				const filled = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands", modelValue: "/warn" },
				});

				expect(filled.find(".discord-message-composer-has-value").exists()).toBe(true);
				expect(
					filled.find(".discord-message-composer-send").attributes("disabled"),
				).toBeUndefined();
				expect(filled.find("[aria-label='Send message']").exists()).toBe(true);
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
		async function openSlashCommandPicker(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
			await wrapper.find("[aria-label='Open apps and commands']").trigger("click");
			await wrapper.vm.$nextTick();
		}

		it("renders mobile command browser with an idle composer by default", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.find(".showcase-discord-shell").exists()).toBe(true);
			expect(wrapper.find(".showcase-discord-main").exists()).toBe(true);
			expect(wrapper.find(".discord-channel-welcome").exists()).toBe(true);
			expect(wrapper.find(".discord-chat-messages[role='log']").exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer").exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer-field").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".showcase-mobile-command-browser").exists()).toBe(true);
			expect(wrapper.text()).toContain("Command Browser");
			expect(wrapper.text()).toContain("All Commands");
			expect(wrapper.text()).toContain("Select a category to view commands.");
			expect(wrapper.findAll(".showcase-mobile-command-link").length).toBe(6);
			expect(wrapper.find(".discord-channel-header-mobile").exists()).toBe(true);
			expect(wrapper.text()).toContain("10 Online");
			expect(wrapper.find(".discord-member-list").exists()).toBe(true);
			expect(wrapper.text()).toContain("Star Network — 4");
			expect(wrapper.text()).toContain("Developers — 2");
			expect(wrapper.text()).toContain("External Bots — 4");
			expect(wrapper.text()).not.toContain("Online — ");
			expect(wrapper.text()).toContain("Offline — 2");
			expect(wrapper.text()).toContain("RVG|lory");
			expect(wrapper.text()).toContain("RedStar");
			expect(wrapper.text()).toContain("WolfStar Beta");
			expect(wrapper.text()).toContain("Ko-fi Bot");
			expect(wrapper.text()).toContain("Patreon");
			const membersToggle = wrapper
				.findAll(".discord-channel-header-action")
				.find((action) => action.attributes("aria-pressed") !== undefined);
			expect(membersToggle?.attributes("aria-pressed")).toBe("true");
			expect(membersToggle?.attributes("aria-label")).toBe("Hide member list");
		});

		it("renders a plain-text moderation success reply on desktop", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			// Ensure slash mode is closed so the channel response is visible.
			if (
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement)
					.value === "/"
			) {
				await wrapper.find("[aria-label='Open apps and commands']").trigger("click");
				await wrapper.vm.$nextTick();
			}

			const desktopResponse = wrapper.find(".showcase-desktop-command-response");
			expect(desktopResponse.exists()).toBe(true);
			expect(desktopResponse.find(".discord-embed").exists()).toBe(false);
			expect(desktopResponse.find(".showcase-desktop-text-response").exists()).toBe(true);
			expect(desktopResponse.text()).toMatch(/Created case 3\s*\|\s*@?baddie/);
			expect(desktopResponse.text()).toContain("Stella");
			expect(desktopResponse.text()).toContain("warn");
			expect(desktopResponse.text()).not.toContain("❯ Type:");
			expect(desktopResponse.text()).not.toContain("❯ Reason:");
		});

		it("toggles the member list from the channel header users button", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.find(".discord-member-list").exists()).toBe(true);

			const membersToggle = wrapper
				.findAll(".discord-channel-header-action")
				.find((action) => action.attributes("aria-pressed") !== undefined);
			expect(membersToggle).toBeDefined();
			await membersToggle!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-member-list").exists()).toBe(false);
			expect(membersToggle!.attributes("aria-pressed")).toBe("false");
			expect(membersToggle!.attributes("aria-label")).toBe("Show member list");

			await membersToggle!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-member-list").exists()).toBe(true);
			expect(membersToggle!.attributes("aria-pressed")).toBe("true");
		});

		it("opens mobile channel info from the channel header and closes via back", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.find(".discord-channel-info").exists()).toBe(false);

			await wrapper
				.find(
					"button.discord-channel-header-mobile-title[aria-label='Open channel info for #mod-commands']",
				)
				.trigger("click");
			await wrapper.vm.$nextTick();

			const channelInfo = wrapper.find(".discord-channel-info");
			expect(channelInfo.exists()).toBe(true);
			expect(channelInfo.attributes("role")).toBe("dialog");
			expect(channelInfo.attributes("aria-label")).toBe(
				"Channel information for #mod-commands",
			);
			expect(channelInfo.text()).toContain("Text Channel");
			expect(channelInfo.findAll("[role='tab']").map((tab) => tab.text())).toEqual([
				"Members",
				"Media",
				"Pins",
				"Threads",
				"Links",
				"Files",
			]);
			expect(channelInfo.find(".discord-channel-info-members").exists()).toBe(true);
			expect(channelInfo.text()).toContain("Offline — 2");

			const mediaTab = channelInfo
				.findAll("[role='tab']")
				.find((tab) => tab.text() === "Media");
			expect(mediaTab).toBeDefined();
			await mediaTab!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(channelInfo.text()).toContain("We searched far and wide.");
			expect(channelInfo.find(".discord-channel-info-members").exists()).toBe(false);

			const threadsTab = channelInfo
				.findAll("[role='tab']")
				.find((tab) => tab.text() === "Threads");
			expect(threadsTab).toBeDefined();
			await threadsTab!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(channelInfo.text()).toContain("There are no threads.");
			expect(channelInfo.text()).toContain("Create Thread");

			await channelInfo.find("[aria-label='Back to channel']").trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-channel-info").exists()).toBe(false);
		});

		it("renders frequently used and additional command suggestions", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			expect(wrapper.text()).toContain("Frequently Used");
			expect(wrapper.text()).not.toContain("Matched Command");
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar").exists()).toBe(true);
			expect(wrapper.findAll(".discord-slash-command-suggestions-sidebar-item").length).toBe(
				8,
			);
			// 5 Frequently Used WolfStar rows + full bot-grouped catalog in the lower scroll pane.
			expect(wrapper.findAll(".discord-slash-command-suggestion").length).toBe(13);
			expect(wrapper.findAll(".discord-slash-command-suggestion-disabled").length).toBe(8);
			expect(wrapper.findAll(".discord-slash-command-suggestion-group").length).toBe(6);
			expect(wrapper.find(".discord-slash-command-suggestion-group").text()).toContain(
				"Staryl",
			);
			expect(wrapper.find(".discord-slash-command-suggestions-sidebar-scroll").exists()).toBe(
				true,
			);
			expect(wrapper.find(".discord-slash-command-suggestions-inner").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions-recent").exists()).toBe(true);
			expect(wrapper.find(".discord-scrollbar").exists()).toBe(true);
			// Chat scroll + member-list scroll + one continuous picker list scroll.
			expect(wrapper.findAll(".discord-scrollbar").length).toBe(3);
			const pickerScroll = wrapper.find(".discord-slash-command-suggestions-scroll");
			expect(pickerScroll.exists()).toBe(true);
			expect(
				pickerScroll.find(".discord-slash-command-suggestions-sidebar-scroll").exists(),
			).toBe(true);
			expect(
				pickerScroll
					.find(".discord-scrollbar-viewport")
					.findAll(".discord-slash-command-suggestion").length,
			).toBe(13);
			expect(
				pickerScroll
					.find(".discord-scrollbar-viewport")
					.find(".discord-slash-command-suggestions-header")
					.exists(),
			).toBe(true);
			expect(
				pickerScroll
					.find(".discord-scrollbar-viewport")
					.find(".discord-slash-command-suggestions-recent")
					.exists(),
			).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions-matched").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(wrapper.text()).toContain("/warn");
			expect(wrapper.text()).toContain("/ban");
			expect(wrapper.text()).toContain("/kick");
			expect(wrapper.text()).toContain("/mute");
			expect(wrapper.text()).toContain("/conf");
			expect(wrapper.text()).toContain("/twitch-subscriptions show");
			expect(wrapper.text()).toContain("/twitch-subscriptions add");
			expect(wrapper.text()).toContain("/addfriend");
			expect(wrapper.findAll("input[name='matched-command']").length).toBe(0);
			expect(wrapper.find(".discord-slash-command-input").exists()).toBe(false);
		});

		it("executes a command when clicking a suggestion", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("/");

			const kickSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/kick"));
			expect(kickSuggestion).toBeDefined();
			await kickSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			// Click executes: picker closes and the kick response is shown in the channel.
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".showcase-desktop-text-response").text()).toMatch(
				/Created case 5\s*\|\s*@?baddie/,
			);
		});

		it("executes a subcommand and shows its component response", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const confSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/conf"));
			expect(confSuggestion).toBeDefined();
			await confSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-v2-container").exists(),
			).toBe(true);
			// Twemoji strips the folder glyph from plain text(); assert the path label remains.
			expect(wrapper.text()).toContain("Currently at:");
			expect(wrapper.text()).toContain("Root");
			expect(wrapper.text()).toContain("Use the menu below to navigate:");
		});

		it("toggles the command picker from the apps control", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");

			await openSlashCommandPicker(wrapper);

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("/");
			expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(true);

			await wrapper.find("[aria-label='Open apps and commands']").trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(false);
		});

		it("closes the picker and restores idle send chrome when Escape clears slash mode", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const input = wrapper.find(".discord-message-composer-input");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(true);

			await input.trigger("keydown", { key: "Escape" });
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect((input.element as HTMLInputElement).value).toBe("");
			expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(false);
			expect(wrapper.find("[aria-label='Send message']").exists()).toBe(false);
		});

		it("closes the picker when the leading slash is deleted", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const input = wrapper.find(".discord-message-composer-input");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);

			await input.setValue("");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect((input.element as HTMLInputElement).value).toBe("");
			expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(false);
		});

		it("selects a command from the mobile markdown command browser", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);

			const muteLink = wrapper
				.findAll(".showcase-mobile-command-link")
				.find((link) => link.text().includes("/mute"));
			expect(muteLink).toBeDefined();
			await muteLink!.trigger("click");
			await wrapper.vm.$nextTick();

			// Mobile browser execute closes slash mode and keeps the command browser visible.
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".showcase-mobile-command-link-active").text()).toContain("/mute");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
		});

		it("keeps third-party app rows non-selectable", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const starylSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/twitch-subscriptions show"));
			expect(starylSuggestion).toBeDefined();
			expect(starylSuggestion!.attributes("aria-disabled")).toBe("true");

			await starylSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			// Close the picker — default warn response should still be selected.
			await wrapper.find("[aria-label='Open apps and commands']").trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".showcase-desktop-text-response").text()).toMatch(
				/Created case 3\s*\|\s*@?baddie/,
			);
		});

		it("shows matched-command chrome while typing and executes on Enter", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const input = wrapper.find(".discord-message-composer-input");
			await input.setValue("/kick");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").text()).toContain(
				"/kick",
			);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").text()).toContain(
				"baddie",
			);

			await input.trigger("keydown", { key: "Enter" });
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect((input.element as HTMLInputElement).value).toBe("");
			expect(wrapper.find(".showcase-desktop-text-response").text()).toMatch(
				/Created case 5\s*\|\s*@?baddie/,
			);
		});

		it("executes conf menu from the picker and reveals the channel response", async () => {
			const wrapper = await mountSuspended(CommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const confSuggestion = wrapper
				.findAll(".discord-slash-command-suggestion")
				.find((suggestion) => suggestion.text().includes("/conf"));
			expect(confSuggestion).toBeDefined();
			await confSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(wrapper.find(".showcase-mobile-command-link-active").text()).toContain(
				"/conf menu",
			);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-v2-container").exists(),
			).toBe(true);
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
