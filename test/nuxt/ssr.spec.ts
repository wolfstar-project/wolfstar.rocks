import {
	WolfstarCommandsSection,
	WolfstarCommandsShowcase,
	StarylCommandsShowcase,
	StarylHeroSection,
	StarylNotificationShowcase,
	StarylSetupSection,
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
	DiscordRole,
	DiscordChatInputCommand,
	DiscordChatInputCommandSuggestion,
	DiscordChatInputCommandMatched,
	DiscordChatInputCommandSuggestions,
	GuildSettingsSection,
	WolfstarHeroSection,
	IconsApp,
	IconsWolfstar,
	WolfstarModerationShowcaseSection,
	WolfstarProductProofSection,
	Separator,
} from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

interface TextNode {
	text(): string;
}

/**
 * The text with the slash of each command name joined to it: newt/ui spaces the
 * slash from the command path with a non-breaking space (`/` then U+00A0, then `warn`).
 */
function commandText(node: TextNode) {
	return node.text().replaceAll("/\u00A0", "/");
}

/** The first slash command suggestion whose text names `command`, such as `/kick`. */
function findSuggestion(wrapper: Awaited<ReturnType<typeof mountSuspended>>, command: string) {
	return wrapper
		.findAll(".discord-slash-command-suggestion")
		.find((suggestion: TextNode) => commandText(suggestion).includes(command));
}

/** The command path a suggestion announces, without the slash: `case archive`. */
function suggestionPath(suggestion: { attributes(name: string): string | undefined }) {
	return /slash command: \/(.+?)(?:\. |$)/.exec(suggestion.attributes("aria-label") ?? "")?.[1];
}

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

				expect(wrapper.find("div.discord-channel-header").exists()).toBe(true);
				expect(wrapper.text()).toContain("mod-commands");
				expect(wrapper.text()).toContain(
					"WolfStar moderation commands — try a slash command below.",
				);
				expect(wrapper.text()).toContain("Search");
				// The search, the back control and the other actions are decoration.
				const controls = wrapper
					.findAll("button")
					.map((button) => button.attributes("aria-label"));
				expect(controls).toEqual([
					"Open channel info for #mod-commands",
					"Show member list",
				]);
				const membersButton = wrapper.find("button[aria-pressed]");
				expect(membersButton.attributes("aria-label")).toBe("Show member list");
				expect(membersButton.attributes("aria-pressed")).toBe("true");
				expect(membersButton.attributes("data-state")).toBe("active");
				expect(wrapper.text()).toContain("19 Online");
				expect(
					wrapper
						.findAll("[aria-hidden='true']")
						.some((element) => element.text() === "48"),
				).toBe(true);
			});

			it("toggles membersOpen via the users toolbar action", async () => {
				const wrapper = await mountSuspended(DiscordChannelHeader, {
					props: {
						name: "mod-commands",
						membersOpen: true,
					},
				});

				const membersButton = wrapper.find("button[aria-pressed]");
				expect(membersButton.exists()).toBe(true);
				await membersButton.trigger("click");

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
					"button[aria-label='Open channel info for #mod-commands']",
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
						topic: "WolfStar moderation commands — try a slash command below.",
					},
				});

				expect(wrapper.text()).toContain("Welcome to #mod-commands!");
				expect(wrapper.text()).toContain(
					"This is the start of the #mod-commands channel. WolfStar moderation commands — try a slash command below.",
				);
				// The showcase cannot edit the channel: the action is decoration, out of the tab order.
				const hidden = wrapper
					.findAll("span[aria-hidden='true']")
					.map((span) => span.text());
				expect(hidden).toContain("Edit Channel");
				expect(wrapper.find("button").exists()).toBe(false);
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

				const scroller = wrapper.find("[role='group']");
				expect(scroller.attributes("aria-label")).toBe("mod-commands channel messages");
				expect(scroller.text()).toContain("Welcome to #mod-commands!");
				const log = scroller.find("[role='log']");
				expect(log.attributes("aria-live")).toBe("polite");
				expect(log.findAll("article")).toHaveLength(1);
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
					attachTo: document.body,
				});

				// The welcome and the log share one column that sticks to the bottom
				// of the scrollport, so a short channel reads up from the composer.
				const log = wrapper.find("[role='log']").element;
				const column = log.parentElement;
				expect(column?.textContent).toContain("Welcome to #mod-commands!");
				// Tailwind may emit `flex-end` or the logical `flow-end`.
				expect(column && getComputedStyle(column).justifyContent).toMatch(
					/^(flex|flow)-end$/,
				);
				wrapper.unmount();
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
				expect(wrapper.findAll("[role='listitem']")).toHaveLength(2);
				expect(wrapper.find("section[data-offline]").text()).toContain("Stella");
				expect(wrapper.find("[role='img'][aria-label='Verified application']").text()).toBe(
					"APP",
				);
				expect(wrapper.find("[role='listitem'] [data-status]").exists()).toBe(true);
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

				expect(wrapper.findAll("h3").map((heading) => heading.text())).toEqual([
					"Moderation — 1",
					"Online — 1",
					"Offline — 1",
				]);
				expect(wrapper.find("[data-slot='member-name']").attributes("style")).toContain(
					"oklch(57.74% 0.2091 273.85)",
				);
				expect(wrapper.find("section[data-offline] [data-status]").exists()).toBe(false);
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
				expect(wrapper.find("[data-status]").attributes("data-status")).toBe("dnd");
				expect(wrapper.find("[data-status]").text()).toBe("Do Not Disturb");
				// The profile decoration is an underlay behind the row.
				expect(
					wrapper
						.find("[role='listitem'] [aria-hidden='true'] [style]")
						.attributes("style"),
				).toContain("linear-gradient");
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

				const members = wrapper.findAll("[role='listitem']");
				expect(members).toHaveLength(2);
				expect(members[0]?.find("[data-status]").exists()).toBe(false);
				expect(members[1]?.find("[data-status]").attributes("data-status")).toBe("online");
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
				expect(article.attributes("data-ephemeral")).toBe("true");

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
				expect(reply.text()).toMatch(/^Stella\s*used\s*help$/);
				expect(reply.attributes("aria-label")).toBe("Stella used the help slash command");
				expect(reply.find("svg[aria-hidden='true']").exists()).toBe(true);
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
				const reply = wrapper.find("[role='complementary']");
				expect(reply.text()).toMatch(/used\s*conf menu$/);
				expect(reply.attributes("aria-label")).toBe(
					"Stella used the conf menu slash command",
				);
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
				const reply = wrapper.find("[role='complementary']");
				expect(reply.text()).toMatch(/used\s*conf menu save$/);
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
			});

			it("renders profile name in header", async () => {
				const wrapper = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar" },
					slots: { default: "Content" },
				});
				const article = wrapper.find("article");
				expect(article.attributes("aria-label")).toBe("Message from WolfStar");
				expect(article.text()).toMatch(/^WolfStar/);
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

			it("renders embed with custom accent border color", async () => {
				const wrapper = await mountSuspended(DiscordEmbed, {
					props: { title: "Colored", color: "#FF0000" },
					slots: { default: "<p>Content</p>" },
				});
				const embed = wrapper.find("[role='complementary']");
				expect(embed.exists()).toBe(true);
				const style = embed.attributes("style") ?? "";
				// Browser may normalize #FF0000 to rgb(255, 0, 0)
				expect(style).toMatch(/--newt-embed-color:\s*(#FF0000|rgb\(255,\s*0,\s*0\))/i);
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
				expect(wrapper.find("[data-variant='user']").text()).toBe("@baddie");
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
					attachTo: document.body,
				});
				const button = wrapper.find("button[data-variant='user']");
				expect(button.exists()).toBe(true);
				expect(getComputedStyle(button.element).display).toBe("inline-flex");
				wrapper.unmount();
			});

			it("renders the avatar when avatar prop is provided", async () => {
				const wrapper = await mountSuspended(DiscordMention, {
					props: { kind: "mention", avatar: "/avatars/baddie.png" },
					slots: { default: "baddie" },
				});
				const button = wrapper.find("button[data-variant='user']");
				const avatar = button.find("img");
				expect(avatar.exists()).toBe(true);
				expect(avatar.attributes("src")).toBe("/avatars/baddie.png");
				expect(avatar.attributes("aria-hidden")).toBe("true");
				expect(button.text()).toContain("@");
				expect(button.text()).toContain("baddie");
			});

			it("omits avatar markup when avatar prop is absent", async () => {
				const wrapper = await mountSuspended(DiscordMention, {
					props: { kind: "mention" },
					slots: { default: "everyone" },
				});
				expect(wrapper.find("button[data-variant='user']").exists()).toBe(true);
				expect(wrapper.find("img").exists()).toBe(false);
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
				expect(button.attributes("data-variant")).toBe("role");
				expect(button.attributes("style")).toContain("--newt-mention-color: #5865F2");
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
				// The app rail sits beside the list, not inside it.
				const rail = wrapper.find("nav[aria-label='Applications']");
				expect(rail.findAll("button")).toHaveLength(8);
				expect(rail.findAll("button")[0]?.attributes("aria-pressed")).toBe("true");
				// One continuous command list: the Frequently Used header and its rows.
				const [list, matched] = wrapper.findAll("[role='listbox']");
				expect(list?.attributes("aria-label")).toBe("Slash command suggestions");
				expect(list?.text()).toContain("Frequently Used");
				expect(list?.findAll("[role='option']")).toHaveLength(1);
				expect(list?.element.contains(rail.element)).toBe(false);
				// The matched command sits in its own footer list under the command list.
				expect(matched?.attributes("aria-label")).toBe("Matched slash command");
				expect(matched?.find("[role='option']").attributes("aria-selected")).toBe("true");
				expect(list?.element.contains(matched?.element ?? null)).toBe(false);
			});
		});

		describe("DiscordChatMessageComposer", () => {
			it("renders the channel placeholder and toolbar", async () => {
				// The desktop bar: the phone bar swaps send for a microphone while empty.
				const wrapper = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands", layout: "default" },
				});
				const input = wrapper.find("input");

				expect(input.attributes("placeholder")).toBe("Message #mod-commands");
				expect(input.attributes()).not.toHaveProperty("readonly");
				expect(wrapper.find("[role='group']").attributes("aria-label")).toBe(
					"Message composer for mod-commands",
				);
				// Only the apps control is reachable; the other toolbar icons are decoration.
				expect(wrapper.find("[aria-label='Open attachment menu']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Open GIF picker']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Open sticker picker']").exists()).toBe(false);
				expect(wrapper.find("[aria-label='Choose an emoji']").exists()).toBe(false);
				expect(wrapper.findAll("[aria-label='Open apps and commands']")).toHaveLength(1);
				expect(wrapper.find("[aria-label='Notifiche']").exists()).toBe(false);
				// The field comes before the send control.
				const field = input.element;
				const send = wrapper.find("button[aria-label='Send message']").element;
				expect(
					field.compareDocumentPosition(send) & Node.DOCUMENT_POSITION_FOLLOWING,
				).toBeTruthy();
			});

			it("mutes the send control when the composer is empty", async () => {
				const empty = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands", layout: "default" },
				});

				expect(
					empty.find("button[aria-label='Send message']").attributes("disabled"),
				).toBeDefined();

				const filled = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands", modelValue: "/warn" },
				});

				expect(
					filled.find("button[aria-label='Send message']").attributes("disabled"),
				).toBeUndefined();
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
			const desc = wrapper.find("p.text-muted");
			expect(desc.exists()).toBe(true);
			expect(desc.text()).toBe("Configure your guild");
		});
	});

	describe("CommandsSection", () => {
		it("renders section header in full section mode", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsSection);

			expect(wrapper.text()).toContain("The demo below behaves like Discord.");
			expect(wrapper.find("#home-commands-heading").exists()).toBe(true);
		});
	});

	describe("Staryl's release line", () => {
		const inviteUrl = "https://discord.com/oauth2/authorize?client_id=test";

		it("names Staryl's own version and date beside its source", async () => {
			const hero = await mountSuspended(StarylHeroSection, {
				props: {
					inviteUrl,
					release: { version: "1.0.0", time: Date.parse("2026-10-28T09:25:24Z") },
				},
			});

			expect(hero.text().replace(/\s+/g, " ")).toContain(
				"Release v1.0.0 · Oct 28, 2026 · View source",
			);
		});

		// GitHub could not be reached at build time.
		it("keeps only the source link when the release is unknown", async () => {
			const hero = await mountSuspended(StarylHeroSection, {
				props: { inviteUrl, release: null },
			});

			expect(hero.text()).not.toContain("Release");
			expect(hero.find("a[href='https://github.com/wolfstar-project/staryl']").exists()).toBe(
				true,
			);
		});
	});

	describe("Homepage product narrative", () => {
		it("renders a specific hero proposition and product evidence on SSR", async () => {
			const hero = await mountSuspended(WolfstarHeroSection, {
				props: {
					buildTime: new Date("2026-08-06T12:00:00Z"),
					buildVersion: "7.0.0",
					inviteUrl: "https://discord.com/oauth2/authorize?client_id=test",
				},
			});
			const proof = await mountSuspended(WolfstarProductProofSection);

			expect(hero.text()).toContain("Moderation, with a paper trail.");
			expect(hero.text()).toContain("Invite WolfStar");
			// Bare fragments, not `/#features`: Nuxt UI's ULink pipes every internal
			// `to` through the i18n module's `$localePath`, which rewrites a
			// hash-only target into an absolute path and sends the click to another
			// page. `:locale="false"` on each in-page anchor is what prevents that.
			expect(hero.find("a[href='#features']").exists()).toBe(true);
			expect(proof.text()).toContain("One system from first warning to final review.");
			expect(proof.find("a[href='#moderation-tools']").exists()).toBe(true);
			expect(proof.find("a[href='#advanced-logging']").exists()).toBe(true);
			expect(proof.find("a[href='#dashboard']").exists()).toBe(true);
		});
	});

	describe("CommandsShowcase", () => {
		async function openSlashCommandPicker(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
			const input = wrapper.find(".discord-message-composer-input");
			await input.setValue("/");
			await wrapper.vm.$nextTick();
		}

		async function openAppLauncher(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
			await wrapper.find("[aria-label='Open apps and commands']").trigger("click");
			await wrapper.vm.$nextTick();
		}

		it("renders mobile command browser with an idle composer by default", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);

			expect(wrapper.find(".showcase-discord-shell").exists()).toBe(true);
			expect(wrapper.find(".showcase-discord-main").exists()).toBe(true);
			expect(wrapper.find(".discord-channel-welcome").exists()).toBe(true);
			expect(wrapper.text()).toContain(
				"This is the start of the #mod-commands channel. WolfStar moderation commands — try a slash command below.",
			);
			const channelHeader = wrapper.find(".discord-channel-header");
			expect(channelHeader.text()).toContain(
				"WolfStar moderation commands — try a slash command below.",
			);
			expect(channelHeader.text()).toContain("Search WolfStar HQ");
			expect(wrapper.find(".discord-chat-messages[role='log']").exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer").exists()).toBe(true);
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.text()).not.toContain("Command Browser");
			expect(
				wrapper.find("button[aria-label='Open channel info for #mod-commands']").exists(),
			).toBe(true);
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
			const membersToggle = wrapper.find(".discord-channel-header button[aria-pressed]");
			expect(membersToggle.attributes("aria-pressed")).toBe("true");
			expect(membersToggle.attributes("aria-label")).toBe("Show member list");
		});

		// WolfStar V7 answers a moderation action with a green embed, the target
		// as inline code rather than a mention.
		it("renders the moderation success embed on desktop", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);

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
			const embed = desktopResponse.find(".discord-embed");
			expect(embed.exists()).toBe(true);
			expect(embed.text()).toMatch(/Created case 3\s*\|\s*baddie\./);
			expect(embed.text()).toContain("With the reason of: spam");
			expect(embed.find(".showcase-inline-code").text()).toBe("baddie");
			expect(desktopResponse.find(".discord-mention").exists()).toBe(false);
			expect(desktopResponse.text()).toContain("Stella");
			expect(desktopResponse.text()).toContain("warn add");
			expect(desktopResponse.text()).not.toContain("❯ Type:");
			expect(desktopResponse.text()).not.toContain("❯ Reason:");
		});

		it("toggles the member list from the channel header users button", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);

			expect(wrapper.find(".discord-member-list").exists()).toBe(true);

			const membersToggle = wrapper.find(".discord-channel-header button[aria-pressed]");
			expect(membersToggle.exists()).toBe(true);
			await membersToggle.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-member-list").exists()).toBe(false);
			expect(membersToggle.attributes("aria-pressed")).toBe("false");
			expect(membersToggle.attributes("aria-label")).toBe("Show member list");

			await membersToggle.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-member-list").exists()).toBe(true);
			expect(membersToggle.attributes("aria-pressed")).toBe("true");
		});

		it("opens mobile channel info from the channel header and closes via back", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);

			expect(wrapper.find(".discord-channel-info").exists()).toBe(false);

			await wrapper
				.find("button[aria-label='Open channel info for #mod-commands']")
				.trigger("click");
			await wrapper.vm.$nextTick();

			const channelInfo = wrapper.find(".discord-channel-info");
			expect(channelInfo.exists()).toBe(true);
			expect(channelInfo.attributes("role")).toBe("dialog");
			expect(
				channelInfo.find(`[id='${channelInfo.attributes("aria-labelledby")}']`).text(),
			).toBe("Channel information for #mod-commands");
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
			// Reka selects a tab on a primary-button press.
			await mediaTab!.trigger("mousedown", { button: 0 });
			await wrapper.vm.$nextTick();

			expect(channelInfo.text()).toContain("We searched far and wide.");
			expect(channelInfo.find(".discord-channel-info-members").exists()).toBe(false);

			const threadsTab = channelInfo
				.findAll("[role='tab']")
				.find((tab) => tab.text() === "Threads");
			expect(threadsTab).toBeDefined();
			await threadsTab!.trigger("mousedown", { button: 0 });
			await wrapper.vm.$nextTick();

			expect(channelInfo.text()).toContain("There are no threads.");
			expect(channelInfo.text()).toContain("Create Thread");

			await channelInfo.find("[aria-label='Back to channel']").trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-channel-info").exists()).toBe(false);
		});

		it("renders frequently used and additional command suggestions", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			expect(wrapper.text()).toContain("Frequently Used");
			expect(wrapper.text()).not.toContain("Matched Command");
			const rail = wrapper.find("nav[aria-label='Applications']");
			expect(rail.findAll("button")).toHaveLength(8);
			// One continuous list: 5 Frequently Used WolfStar rows, then the bot-grouped catalog.
			const list = wrapper.find("[role='listbox'][aria-label='Slash command suggestions']");
			expect(list.element.contains(rail.element)).toBe(false);
			expect(list.findAll(".discord-slash-command-suggestion")).toHaveLength(13);
			expect(list.findAll("[role='option'][aria-disabled='true']")).toHaveLength(8);
			expect(list.findAll(".discord-slash-command-suggestion-group")).toHaveLength(6);
			expect(list.find(".discord-slash-command-suggestion-group").text()).toContain("Staryl");
			expect(list.find(".discord-slash-command-suggestions-header").text()).toBe(
				"Frequently Used",
			);
			expect(wrapper.find("[aria-label='Matched slash command']").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			const text = commandText(wrapper);
			expect(text).toContain("/warn");
			expect(text).toContain("/ban");
			expect(text).toContain("/kick");
			expect(text).toContain("/mute");
			expect(text).toContain("/settings server");
			expect(text).toContain("/subscriptions twitch show");
			expect(text).toContain("/subscriptions twitch add");
			expect(text).toContain("/addfriend");
			expect(wrapper.findAll("input[name='matched-command']").length).toBe(0);
		});

		it("keeps the executed response visible when the slash picker reopens", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const kickSuggestion = findSuggestion(wrapper, "/kick");
			expect(kickSuggestion).toBeDefined();
			await kickSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			// Discord: “User used /command” reply + bot response — no plain `/kick` bubble.
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the kick slash command/i,
			);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-embed").text(),
			).toMatch(/Created case 5\s*\|\s*baddie\./);

			// Re-open the picker — Discord keeps channel history behind autocomplete.
			await openSlashCommandPicker(wrapper);

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the kick slash command/i,
			);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-embed").text(),
			).toMatch(/Created case 5\s*\|\s*baddie\./);
			expect(wrapper.text()).toContain(
				"This is the start of the #mod-commands channel. WolfStar moderation commands — try a slash command below.",
			);
		});

		it("lists and executes WolfStar's real slash-only subcommands", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			await wrapper.find("[aria-label='WolfStar commands']").trigger("click");
			await wrapper.vm.$nextTick();

			const suggestions = wrapper.findAll(".discord-slash-command-suggestion");
			// Every leaf V7 registers, once: the scripted commands, then the rest of
			// the bot's catalogue. A command added to or dropped from the bot moves this.
			const paths = suggestions.map((suggestion) => suggestionPath(suggestion));
			expect(paths).toHaveLength(112);
			expect(new Set(paths).size).toBe(paths.length);
			expect(paths).not.toContain("settings server menu");
			expect(paths).not.toContain("settings server export");
			expect(paths).not.toContain("conf");
			for (const command of [
				"/warn add",
				"/ban add",
				"/mute add",
				"/timeout add",
				"/case view",
				"/case list",
				"/case edit",
				"/case archive",
				"/case delete",
				"/slowmode",
				"/settings server",
				"/settings user",
				"/archive create",
			]) {
				expect(commandText(wrapper)).toContain(command);
			}

			const archiveSuggestion = suggestions.find((suggestion) =>
				commandText(suggestion).includes("/case archive"),
			);
			expect(archiveSuggestion).toBeDefined();
			await archiveSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the case archive slash command/i,
			);
			expect(wrapper.find("article[data-ephemeral='true']").exists()).toBe(true);
			expect(wrapper.find(".showcase-desktop-text-response").text()).toBe(
				"Successfully archived case 3.",
			);
		});

		it("executes a command when clicking a suggestion", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			expect(wrapper.find(".discord-slash-command-suggestion-matched").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("/");
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);

			const kickSuggestion = findSuggestion(wrapper, "/kick");
			expect(kickSuggestion).toBeDefined();
			await kickSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			// Click executes: picker closes; “used /kick” reply + kick response — no plain bubble.
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the kick slash command/i,
			);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-embed").text(),
			).toMatch(/Created case 5\s*\|\s*baddie\./);
		});

		it("executes a subcommand and shows its component response", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const settingsSuggestion = findSuggestion(wrapper, "/settings server");
			expect(settingsSuggestion).toBeDefined();
			await settingsSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(
				wrapper
					.find(".showcase-desktop-command-response [style*='--newt-v2-accent']")
					.exists(),
			).toBe(true);
			// V7's settings menu: the module select, the root keys, the reset section.
			expect(wrapper.text()).toContain("Core Configurations");
			expect(wrapper.text()).toContain("Select a module");
			expect(wrapper.text()).toContain("Time Zone");
			expect(wrapper.text()).toContain("Reset Configurations");
			expect(wrapper.text()).toContain("This menu closes in 15 minutes if it is not used.");
		});

		it("toggles the App Launcher from the apps control", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);

			expect(wrapper.find(".discord-app-launcher").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");

			await openAppLauncher(wrapper);

			expect(wrapper.find(".discord-app-launcher").exists()).toBe(true);
			const launcher = wrapper.find('[role="dialog"]');
			const launcherName = launcher.find(`[id="${launcher.attributes("aria-labelledby")}"]`);
			expect(launcherName.text()).toBe("Apps");
			expect(wrapper.find("[data-sheet-snap]").exists()).toBe(true);
			expect(
				wrapper.find("[role='dialog'] input[type='search']").attributes("placeholder"),
			).toBe("Search Apps & Commands");
			expect(wrapper.text()).toContain("Recents");
			expect(wrapper.text()).toContain("Promoted");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");

			// While the launcher is open, the same control is named as its close action.
			expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(false);
			await wrapper.find("[aria-label='Close apps and commands']").trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-app-launcher").exists()).toBe(false);
			expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(true);
		});

		it("hides the message composer when the Apps sheet expands to full (positive)", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openAppLauncher(wrapper);

			expect(wrapper.find(".discord-message-composer").exists()).toBe(true);
			expect(wrapper.find('[data-sheet-snap="half"]').exists()).toBe(true);

			await wrapper.find("button[aria-label='Expand Apps sheet']").trigger("keydown", {
				key: "ArrowUp",
			});
			await wrapper.vm.$nextTick();

			expect(wrapper.find('[data-sheet-snap="full"]').exists()).toBe(true);
			expect(wrapper.find(".showcase-command-picker-apps-full").exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer").exists()).toBe(false);

			await wrapper.find("button[aria-label='Collapse Apps sheet']").trigger("keydown", {
				key: "ArrowDown",
			});
			await wrapper.vm.$nextTick();

			expect(wrapper.find('[data-sheet-snap="half"]').exists()).toBe(true);
			expect(wrapper.find(".discord-message-composer").exists()).toBe(true);
		});

		it("closes the App Launcher when slash command mode opens", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openAppLauncher(wrapper);
			expect(wrapper.find(".discord-app-launcher").exists()).toBe(true);

			await openSlashCommandPicker(wrapper);

			expect(wrapper.find(".discord-app-launcher").exists()).toBe(false);
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);
		});

		it("executes a slash command from App Launcher search without opening /commands", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openAppLauncher(wrapper);

			const search = wrapper.find("[role='dialog'] input[type='search']");
			await search.setValue("warn");
			await wrapper.vm.$nextTick();

			expect(wrapper.find("#discord-app-launcher-commands-heading").exists()).toBe(true);
			expect(commandText(wrapper)).toContain("/warn");
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);

			const warnRow = wrapper.find("[role='dialog'] button[aria-label^='/warn']");
			expect(warnRow.exists()).toBe(true);
			await warnRow.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-app-launcher").exists()).toBe(false);
			expect(wrapper.find(".showcase-desktop-command-response").exists()).toBe(true);
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the warn add slash command/i,
			);
			expect(wrapper.text()).toContain("Created case 3");
			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
		});

		it("closes the picker and restores idle send chrome when Escape clears slash mode", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const input = wrapper.find(".discord-message-composer-input");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);
			expect(
				wrapper.find("button[aria-label='Send message']").attributes("disabled"),
			).toBeUndefined();

			// Prefer focusing first so onComposerEscape can blur away focus-visible.
			// Happy-dom may leave activeElement on <body>; blur is still a no-op-safe path.
			(input.element as HTMLInputElement).focus();

			await input.trigger("keydown", { key: "Escape" });
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect((input.element as HTMLInputElement).value).toBe("");
			// Idle again: nothing to send. The desktop bar disables send, the phone bar shows a microphone.
			expect(wrapper.find("button[aria-label='Send message']:enabled").exists()).toBe(false);
			expect(document.activeElement).not.toBe(input.element);
			// Channel history (used-reply + response) stays — Esc only exits slash mode.
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".showcase-desktop-command-response").exists()).toBe(true);
		});

		it("closes the picker when the leading slash is deleted", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const input = wrapper.find(".discord-message-composer-input");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(true);

			await input.setValue("");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect((input.element as HTMLInputElement).value).toBe("");
			expect(wrapper.find("button[aria-label='Send message']:enabled").exists()).toBe(false);
		});

		it("keeps third-party app rows non-selectable", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const starylSuggestion = findSuggestion(wrapper, "/subscriptions twitch show");
			expect(starylSuggestion).toBeDefined();
			expect(starylSuggestion!.attributes("aria-disabled")).toBe("true");

			await starylSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			// Close the picker — default warn response should still be selected.
			await wrapper.find(".discord-message-composer-input").trigger("keydown", {
				key: "Escape",
			});
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-embed").text(),
			).toMatch(/Created case 3\s*\|\s*baddie\./);
		});

		it("shows matched-command chrome while typing and executes on Enter", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
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
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the kick slash command/i,
			);
			expect(
				wrapper.find(".showcase-desktop-command-response .discord-embed").text(),
			).toMatch(/Created case 5\s*\|\s*baddie\./);
		});

		it("executes the settings menu from the picker and reveals the channel response", async () => {
			const wrapper = await mountSuspended(WolfstarCommandsShowcase);
			await openSlashCommandPicker(wrapper);

			const settingsSuggestion = findSuggestion(wrapper, "/settings server");
			expect(settingsSuggestion).toBeDefined();
			await settingsSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(
				(wrapper.find(".discord-message-composer-input").element as HTMLInputElement).value,
			).toBe("");
			expect(wrapper.find(".discord-slash-command-suggestions").exists()).toBe(false);
			// No duplicate plain `/settings server` bubble — only “used” reply + bot menu.
			expect(wrapper.find(".showcase-typed-command-message").exists()).toBe(false);
			expect(wrapper.find(".discord-message-reply").attributes("aria-label")).toMatch(
				/used the settings server slash command/i,
			);
			expect(
				wrapper
					.find(".showcase-desktop-command-response [style*='--newt-v2-accent']")
					.exists(),
			).toBe(true);
		});
	});

	describe("StarylCommandsShowcase", () => {
		it("uses the commands Staryl registers and the replies it sends", async () => {
			const wrapper = await mountSuspended(StarylCommandsShowcase);

			// `/setup` comes first: its menu is Components V2.
			expect(wrapper.find(".staryl-setup-menu [style*='--newt-v2-accent']").text()).toContain(
				"Staryl setup",
			);
			expect(wrapper.find(".staryl-setup-menu").text()).toContain("Current notifications: 2");

			// Desktop-only mount arming (`/`) is skipped on narrow test viewports; open the
			// picker the same way the Wolfstar showcase specs do.
			await wrapper.find(".discord-message-composer-input").setValue("/");
			await wrapper.vm.$nextTick();

			for (const command of [
				"/setup",
				"/subscriptions twitch add",
				"/subscriptions twitch remove",
				"/subscriptions twitch reset",
				"/subscriptions twitch show",
				"/subscriptions twitch test",
			]) {
				expect(commandText(wrapper)).toContain(command);
			}
			expect(wrapper.text()).not.toContain("Placeholder");

			const suggestions = wrapper.findAll(".discord-slash-command-suggestion");
			// Every row is Staryl's, with its avatar: none falls back to WolfStar's.
			for (const suggestion of suggestions) {
				expect(suggestion.find("img").attributes("src")).toContain("staryl");
				expect(suggestion.attributes("aria-label")).toMatch(/^Staryl slash command: /);
				expect(suggestion.text()).toMatch(/Staryl$/);
			}

			const addSuggestion = suggestions.find((suggestion) =>
				commandText(suggestion).includes("/subscriptions twitch add"),
			);
			await addSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();
			expect(wrapper.find("article[data-ephemeral='true']").exists()).toBe(true);
			expect(wrapper.find(".staryl-command-response").text()).toContain(
				"Whenever stella goes live",
			);

			await wrapper.find(".discord-message-composer-input").setValue("/");
			await wrapper.vm.$nextTick();
			const showSuggestion = findSuggestion(wrapper, "/subscriptions twitch show");
			expect(showSuggestion).toBeDefined();
			await showSuggestion!.trigger("click");
			await wrapper.vm.$nextTick();

			expect(wrapper.find(".discord-embed").text()).toContain("Twitch Subscriptions");
			expect(wrapper.find(".discord-embed").text()).toContain(
				"stella — #staryl-notifications → Live",
			);
		});
	});

	describe("StarylNotificationShowcase", () => {
		it("shows each kind of notification Staryl sends", async () => {
			const wrapper = await mountSuspended(StarylNotificationShowcase);
			const pick = async (id: string) => {
				await wrapper.find(`#staryl-notification-${id}`).setValue(true);
				await wrapper.vm.$nextTick();
			};

			// Live: the components the bot builds, with a live Watch Stream button.
			const container = wrapper.find("[style*='--newt-v2-accent']");
			expect(container.text()).toContain("Stella is now live on Twitch!");
			expect(container.find("a").attributes("href")).toBe("https://twitch.tv/stella");
			expect(container.text()).toContain("Game");
			// The stream preview in the media gallery.
			expect(container.find("img[src$='stream-preview.svg']").attributes("alt")).toBeTruthy();
			expect(container.text()).toContain("Staryl Twitch Notifications • October 26, 2026");
			const watchButton = wrapper.find("[role='group'] .discord-button");
			expect(watchButton.text()).toContain("Watch Stream");
			expect(watchButton.classes()).not.toContain("pointer-events-none");
			expect(watchButton.find("svg").exists()).toBe(true);

			await pick("ping");
			expect(wrapper.find("[data-variant='user']").text()).toContain("Stream Pings");

			// Offline: plain text, as `buildOfflineMessage()` writes it.
			await pick("offline");
			expect(wrapper.find("[style*='--newt-v2-accent']").exists()).toBe(false);
			expect(wrapper.find(".staryl-showcase-feed").text()).toContain(
				"Stella's stream is over, thanks for watching! | October 26, 2026",
			);
			expect(commandText(wrapper)).toContain("/subscriptions twitch add type:Stream Offline");

			// A test on a streamer who is not live: the notice, the placeholder title, no preview.
			await pick("test");
			expect(wrapper.find(".staryl-showcase-feed").text()).toContain("Test notification");
			expect(wrapper.find("[style*='--newt-v2-accent'] a").text()).toBe("Test notification");
			expect(wrapper.find("img[src$='stream-preview.svg']").exists()).toBe(false);
		});
	});

	describe("StarylSetupSection", () => {
		it("lists the pages of the /setup menu", async () => {
			const wrapper = await mountSuspended(StarylSetupSection, {
				props: { inviteUrl: "https://discord.com/oauth2/authorize?client_id=1" },
			});

			const titles = wrapper.findAll(".staryl-setup-row h3").map((title) => title.text());
			expect(titles).toStrictEqual([
				"Overview",
				"Add a notification",
				"Manage notifications",
				"Test notifications",
			]);
			expect(wrapper.find("code").text()).toBe("/setup");
		});
	});

	describe("ModerationShowcaseSection", () => {
		it("renders all three moderation feature areas on SSR", async () => {
			const wrapper = await mountSuspended(WolfstarModerationShowcaseSection);

			expect(wrapper.text()).toContain("Follow a rule from trigger to review.");
			expect(wrapper.text()).toContain("Configure the rule before it fires");
			expect(wrapper.text()).toContain("Keep live events and reviewable history");
			expect(wrapper.text()).toContain("Every action keeps its context.");
			expect(wrapper.find("#home-showcase-heading").exists()).toBe(true);
			expect(wrapper.findAll("#home-showcase-heading")).toHaveLength(1);
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
