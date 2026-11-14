import type { AppealQuestion } from "#shared/utils/appeal-forms";
import type { AppealPage } from "#shared/utils/my-appeals";
import {
	AppCustomThemeEditor,
	AppCustomThemePanel,
	AppFooter,
	AppHeader,
	AppHeaderAuth,
	AppHeaderAuthSkeleton,
	AppLogoMark,
	AppPreferences,
	ConsentManager,
	ConsentSettingsDialog,

	// #region Wolfstar components
	WolfstarCommandsSection,
	WolfstarCommandsShowcase,
	WolfstarCtaSection,
	WolfstarDashboardSection,
	WolfstarHeroSection,
	WolfstarModerationShowcase,
	WolfstarModerationShowcaseSection,
	WolfstarProductProofSection,
	// #endregion

	// #region Discord components
	DiscordChannelHeader,
	DiscordChannelInfo,
	DiscordChannelWelcome,
	DiscordChat,
	DiscordChatMessageComposer,
	DiscordEmbed,
	DiscordInvite,
	DiscordMention,
	DiscordMemberList,
	DiscordMessage,
	DiscordMessages,
	DiscordReaction,
	DiscordReactions,
	DiscordRole,
	DiscordChatInputCommand,
	DiscordChatInputCommandSuggestion,
	DiscordChatInputCommandMatched,
	DiscordChatInputCommandSuggestions,
	DiscordAppLauncher,
	DiscordStringSelectMenu,

	// #endregion

	DashboardContextCard,
	DashboardDirectMessageThread,
	DashboardDirectMessages,
	DashboardMyAppealDialog,
	DashboardMyAppeals,
	DashboardPageHeader,
	DashboardSidebar,
	DashboardSkeleton,
	ErrorPage,
	OauthStatusPanel,
	GuildAppealsEmojiPicker,
	GuildAppealsFormEditor,
	GuildAppealsQueue,
	GuildAppealsForms,
	GuildAuditChanges,
	GuildAutomodDurationInput,
	GuildAutomodWordsEditor,
	GuildJoinguardAllowList,
	GuildJoinguardCheckpoint,
	GuildJoinguardNotices,
	GuildJoinguardQueue,
	GuildJoinguardRuleCard,
	GuildJoinguardRuleEditor,
	GuildJoinguardRules,
	GuildCommandsRuleEditor,
	GuildCommandsRuleList,
	GuildLogsCaseDetail,
	GuildMemberPicker,
	GuildReviewQueue,
	GuildServerRail,
	GuildSettingsAccess,
	GuildSettingsAppeals,
	GuildSettingsAutoDelete,
	GuildSettingsAutoMessage,
	GuildSettingsAutomod,
	GuildSettingsAutoPurge,
	GuildSettingsDisabledCommands,
	GuildSettingsHoneypot,
	GuildSettingsJoinGuard,
	GuildSettingsLogsBulkChannel,
	GuildSettingsLogsSelectionBar,
	GuildSettingsModeration,
	GuildModerationWarnThresholds,
	GuildSettingsSection,
	GuildSetupWizard,
	GuildSettingsToggleRow,
	IconsApp,
	IconsWolfstar,
	SectionHeader,
	SelectMember,
	Separator,
	VerifyTrustMeter,

	// #region Staryl components
	StarylCommandsSection,
	StarylCommandsShowcase,
	StarylCtaSection,
	StarylHeroSection,
	StarylNotificationShowcase,
	StarylSetupSection,
	StarylProductProofSection,
	// #endregion
	UChart,
} from "#components";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it, vi } from "vitest";
import VerifyPage from "~/pages/verify/[guild].vue";
import { moderationActivityChart } from "~/utils/moderation-activity";
import {
	MOCK_ANNOUNCEMENTS,
	MOCK_APP_INVITE,
	MOCK_COMPONENTS_V2,
} from "~~/test/mocks/announcements";
import { MOCK_AUDIT_ENTRY, MOCK_MODERATION_ENTRY } from "~~/test/mocks/auditLogs";
import { createMockOauthFlattenedGuild, createMockRole } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";
import { runAxe } from "./utils/axe";

const inviteUrl =
	"https://discord.com/oauth2/authorize?client_id=test&permissions=0&scope=bot%20applications.commands";

// Stub used when auditing AppHeader so the header doesn't depend on the lazy auth
// dropdown's async session fetch. The stub keeps an accessible name so it doesn't
// introduce its own violations; AppHeaderAuth is audited separately with the real
// component below.
const SignInStub = {
	template: `<button type="button" aria-label="Sign in with Discord">Sign in</button>`,
};

function mountAppHeader() {
	return mountSuspended(AppHeader, {
		global: { stubs: { AppHeaderAuth: SignInStub, LazyAppHeaderAuth: SignInStub } },
	});
}

describe("component accessibility audits", () => {
	describe("Cookie consent", () => {
		it("should have no accessibility violations for the consent notice", async () => {
			const { isConsentGiven } = useCookieControl();
			isConsentGiven.value = undefined;
			const component = await mountSuspended(ConsentManager);
			await vi.waitFor(() => expect(component.find("section").exists()).toBe(true));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
			component.unmount();
		});

		it("should have no accessibility violations for the cookie settings dialog", async () => {
			const { isModalActive } = useCookieControl();
			isModalActive.value = true;
			const component = await mountSuspended(ConsentSettingsDialog, {
				attachTo: document.body,
			});
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"] [role="switch"]')).not.toBeNull(),
			);
			const panel = document.querySelector('[role="dialog"]');
			const results = await runAxe(component, { include: panel ? [panel] : [] });
			expect(results.violations).toEqual([]);
			isModalActive.value = false;
			component.unmount();
		});
	});

	describe("UChart of the overview", () => {
		it("is one named image, with the counts of every day in its label", async () => {
			const days = ["Mon", "Tue", "Wed"].map((label, index) => ({
				count: index * 2,
				key: `2026-10-${8 + index}`,
				label,
			}));
			const component = await mountSuspended(UChart, {
				props: {
					"aria-label": "Mon 0, Tue 2, Wed 4",
					"definition": moderationActivityChart(days, String),
					"height": 180,
					"tooltip": false,
					"type": "bar",
				},
			});
			await nextTick();

			expect(component.find("[aria-label='Mon 0, Tue 2, Wed 4']").exists()).toBe(true);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("Discord components", () => {
		describe("DiscordMessages", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordMessages, {
					slots: { default: "<p>Hello world</p>" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChannelHeader", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordChannelHeader, {
					props: {
						name: "mod-commands",
						type: "text",
						topic: "WolfStar moderation commands — try a slash command below.",
						searchPlaceholder: "Search",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChannelInfo", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordChannelInfo, {
					props: {
						name: "mod-commands",
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
						],
						offline: [{ id: "stella", name: "Stella" }],
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChannelWelcome", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordChannelWelcome, {
					props: {
						channelName: "mod-commands",
						date: "July 16, 2026",
						dateTime: "2026-07-16",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChat", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordChat, {
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
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordMemberList", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordMemberList, {
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
						],
						offline: [{ id: "stella", name: "Stella" }],
						showRoles: true,
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordMessage", () => {
			it("should have no accessibility violations with basic message", async () => {
				const component = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar" },
					slots: { default: "Hello, this is a test message." },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with ephemeral message", async () => {
				const component = await mountSuspended(DiscordMessage, {
					props: { name: "wolfstar", ephemeral: true },
					slots: { default: "Only you can see this." },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with command context", async () => {
				const component = await mountSuspended(DiscordMessage, {
					props: {
						name: "wolfstar",
						reply: { kind: "command", user: "stella", commandName: "help" },
					},
					slots: { default: "Here is your help response." },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with message reply context", async () => {
				const component = await mountSuspended(DiscordMessage, {
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
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordEmbed", () => {
			it("should have no accessibility violations with title only", async () => {
				const component = await mountSuspended(DiscordEmbed, {
					props: { title: "Embed Title" },
					slots: { default: "<p>Embed content here</p>" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with author and footer", async () => {
				const component = await mountSuspended(DiscordEmbed, {
					props: {
						title: "Moderation Log",
						color: "#FF0000",
						author: { name: "WolfStar" },
						footer: { text: "WolfStar Moderation" },
						timestamp: new Date("2024-06-01T12:00:00Z"),
					},
					slots: { default: "<p>User was warned.</p>" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordMention", () => {
			it("should have no accessibility violations with mention kind", async () => {
				const component = await mountSuspended(DiscordMention, {
					props: { kind: "mention" },
					slots: { default: "everyone" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with app kind", async () => {
				const component = await mountSuspended(DiscordMention, {
					props: { kind: "app" },
					slots: { default: "WolfStar" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with an avatar", async () => {
				const component = await mountSuspended(DiscordMention, {
					props: { kind: "mention", avatar: "/avatars/baddie.png" },
					slots: { default: "baddie" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordRole", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordRole, {
					props: { color: "#5865F2" },
					slots: { default: "Moderator" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChatInputCommand", () => {
			it("should have no accessibility violations with composed variant", async () => {
				const component = await mountSuspended(DiscordChatInputCommand, {
					props: {
						name: "warn",
						options: [
							{ name: "member", value: "@baddie", focused: true },
							{ name: "reason", description: "Reason for the warning" },
						],
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChatInputCommandSuggestion", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
					components: { DiscordChatInputCommandSuggestion },
					template: `
						<div role="listbox" aria-label="Slash command suggestions">
							<DiscordChatInputCommandSuggestion
								name="warn"
								description="Warn a member"
								:active="true"
							/>
						</div>
					`,
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChatInputCommandMatched", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
					components: { DiscordChatInputCommandMatched },
					template: `
						<div role="listbox" aria-label="Matched slash commands">
							<DiscordChatInputCommandMatched
								name="ban"
								:options="[
									{ name: 'user', value: 'baddie' },
									{ name: 'reason', value: 'repeated infractions', focused: true },
								]"
								:active="true"
							/>
						</div>
					`,
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChatInputCommandSuggestions", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
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
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordChatMessageComposer", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordChatMessageComposer, {
					props: { channelName: "mod-commands" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordAppLauncher", () => {
			it("should have no accessibility violations on the main view", async () => {
				const component = await mountSuspended(DiscordAppLauncher, {
					props: { open: true },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordReaction", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordReaction, {
					props: { count: 5 },
					slots: { default: "👍" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with self reaction", async () => {
				const component = await mountSuspended(DiscordReaction, {
					props: { count: 3, self: true },
					slots: { default: "❤️" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordReactions", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordReactions, {
					slots: { default: "<span>Reaction slot</span>" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordStringSelectMenu", () => {
			const selectOptions = [
				{
					value: "prefix",
					label: "Root / Prefix",
					emoji: "ph:gear-six-fill",
					description: "Currently at: Root / Prefix",
				},
				{
					value: "language",
					label: "Root / Language",
					emoji: "ph:gear-six-fill",
					description: "Currently at: Root / Language",
				},
			];

			it("should have no accessibility violations when closed", async () => {
				const component = await mountSuspended(DiscordStringSelectMenu, {
					props: { options: selectOptions, ariaLabel: "Configuration category" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations when open", async () => {
				const component = await mountSuspended(DiscordStringSelectMenu, {
					props: { options: selectOptions, ariaLabel: "Configuration category" },
					attachTo: document.body,
				});
				await component.find("button[role='combobox']").trigger("click");
				await nextTick();
				const panel = document.querySelector(".discord-string-select-menu-panel");
				expect(panel).not.toBeNull();
				const results = await runAxe(component, {
					include: panel ? [panel] : [],
				});
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordInvite", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordInvite, {
					props: { link: "/join", online: 150, members: 3000 },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations with zero counts", async () => {
				const component = await mountSuspended(DiscordInvite, {
					props: { link: "/join" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});
	});

	describe("Separator", () => {
		it("should have no accessibility violations with horizontal orientation", async () => {
			const component = await mountSuspended(Separator, {
				props: { orientation: "horizontal" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations with vertical orientation", async () => {
			const component = await mountSuspended(Separator, {
				props: { orientation: "vertical" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsSection", () => {
		it("should have no accessibility violations with title", async () => {
			const component = await mountSuspended(GuildSettingsSection, {
				props: { title: "General Settings" },
				slots: { default: "<p>Settings content</p>" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations without title", async () => {
			const component = await mountSuspended(GuildSettingsSection, {
				slots: { default: "<p>Content without heading</p>" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations with custom heading level", async () => {
			const component = await mountSuspended(GuildSettingsSection, {
				props: { title: "Sub Section", headingLevel: "h3" },
				slots: { default: "<p>Sub section content</p>" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildAutomodDurationInput", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildAutomodDurationInput, {
				props: { label: "Duration", modelValue: 600_000 },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildAutomodWordsEditor", () => {
		it("should have no accessibility violations with words", async () => {
			const component = await mountSuspended(GuildAutomodWordsEditor, {
				props: { modelValue: ["bad", "*bad*", "parola*"] },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations when empty", async () => {
			const component = await mountSuspended(GuildAutomodWordsEditor, {
				props: { modelValue: [] },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsToggleRow", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildSettingsToggleRow, {
				props: {
					description: "Opens a moderation case when a member is banned by hand.",
					modelValue: true,
					name: "moderationTrackBans",
					title: "Track Manual Bans",
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsLogsBulkChannel", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildSettingsLogsBulkChannel, {
				props: {
					help: "Sets the channel of every log in this group.",
					keys: ["logsRoleCreate", "logsRoleUpdate"],
					label: "All Roles logs",
					values: { logsRoleCreate: "234567890123456789", logsRoleUpdate: null },
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsLogsSelectionBar", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildSettingsLogsSelectionBar, {
				props: {
					keys: ["logsMessageDelete", "logsRoleCreate"],
					values: { logsMessageDelete: null, logsRoleCreate: null },
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildServerRail", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildServerRail, {
				props: {
					currentGuildId: "222222222222222222",
					guilds: [
						createMockOauthFlattenedGuild({ id: "111111111111111111", name: "Alpha" }),
						createMockOauthFlattenedGuild({ id: "222222222222222222", name: "Beta" }),
					],
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardSidebar", () => {
		it("should have no accessibility violations", async () => {
			useActiveGuild().selectGuild("123456789012345678");
			useGuildData().setGuildData(
				createMockOauthFlattenedGuild({ id: "123456789012345678", name: "WolfStar HQ" }),
			);
			const component = await mountSuspended(DashboardSidebar);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardDirectMessages", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(DashboardDirectMessages);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardDirectMessageThread", () => {
		it("should have no accessibility violations with posts and an app's card", async () => {
			registerEndpoint("/api/announcements/wolfstar", {
				method: "GET",
				handler: () => [
					MOCK_ANNOUNCEMENTS[0],
					{
						...MOCK_ANNOUNCEMENTS[1],
						apps: [MOCK_APP_INVITE],
						components: MOCK_COMPONENTS_V2,
					},
				],
			});
			clearNuxtState(["dm:posts", "dm:status"]);
			useDirectMessages().openThread("wolfstar");
			const component = await mountSuspended(DashboardDirectMessageThread);
			// The two posts and the card inside the second.
			await vi.waitFor(() => expect(component.findAll("article")).toHaveLength(3));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardSkeleton", () => {
		it.each(["overview", "modules", "table", "form"] as const)(
			"should have no accessibility violations as a %s",
			async (kind) => {
				const component = await mountSuspended(DashboardSkeleton, { props: { kind } });
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			},
		);
	});

	describe("GuildSetupWizard", () => {
		it("should have no accessibility violations on each step", async () => {
			localStorage.clear();
			useActiveGuild().selectGuild("123456789012345678");
			useGuildData().setGuildData(
				createMockOauthFlattenedGuild({
					id: "123456789012345678",
					name: "Pixel Parlor",
					setupPending: true,
				}),
			);
			useGuildSettings().setGuildSettings(createMockGuildData("123456789012345678"));
			const component = await mountSuspended(GuildSetupWizard, { attachTo: document.body });
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"]')).not.toBeNull(),
			);
			const setup = useGuildSetup();

			for (const step of [1, 2, 3, 5]) {
				setup.goTo(step);
				await nextTick();
				const panel = document.querySelector('[role="dialog"]');
				const results = await runAxe(component, { include: panel ? [panel] : [] });
				expect(results.violations).toEqual([]);
			}
		});
	});

	describe("GuildMemberPicker", () => {
		const GUILD_ID = "123456789012345678";

		it("should have no accessibility violations with a member who left", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
				method: "GET",
				handler: () => [],
			});
			const component = await mountSuspended(GuildMemberPicker, {
				props: { ids: ["200000000000000099"], guildId: GUILD_ID, label: "Members" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("SelectMember", () => {
		const GUILD_ID = "123456789012345678";

		it("should have no accessibility violations with a role and a member who left", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
				method: "GET",
				handler: () => [],
			});
			const component = await mountSuspended(SelectMember, {
				props: {
					guild: createMockOauthFlattenedGuild({
						id: GUILD_ID,
						roles: [createMockRole({ id: "300000000000000001", name: "Moderator" })],
					}),
					guildId: GUILD_ID,
					label: "Allowed",
					memberIds: ["200000000000000099"],
					multiple: true,
					roleIds: ["300000000000000001"],
					roles: true,
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsAccess", () => {
		const GUILD_ID = "123456789012345678";

		it("should have no accessibility violations with legacy nodes", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
				method: "GET",
				handler: () => [],
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(
				createMockGuildData(GUILD_ID, {
					permissionsRoles: [
						{ id: "300000000000000001", allow: ["settings"], deny: [] },
						{ id: "300000000000000002", allow: ["Moderation.*"], deny: [] },
					],
					permissionsUsers: [
						{ id: "200000000000000001", allow: [], deny: [], dashboard: "allow" },
					],
				}),
			);
			const component = await mountSuspended(GuildSettingsAccess);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsDisabledCommands", () => {
		const GUILD_ID = "123456789012345678";

		it("should have no accessibility violations with the row of every command", async () => {
			clearNuxtData();
			registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions`, {
				method: "GET",
				handler: () => ({
					applicationId: "500000000000000001",
					commands: [
						{
							id: "600000000000000001",
							name: "ban",
							command: "ban",
							category: "Moderation",
							description: "Ban a member",
						},
					],
					permissions: {
						"600000000000000001": [
							{ id: "300000000000000001", type: 1, permission: true },
						],
					},
					snapshot: "x",
					authorization: { scopeGranted: true, manageGuild: true, manageRoles: true },
				}),
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(
				createMockGuildData(GUILD_ID, {
					commandsRestrictions: [
						{ command: "ban", allowedRoles: ["300000000000000001"] },
						{ format: 2 },
					],
				}),
			);
			const component = await mountSuspended(GuildSettingsDisabledCommands, {
				props: {
					commands: [
						{
							category: "Moderation",
							description: "Ban a member",
							extendedHelp: {},
							guarded: false,
							name: "ban",
							permissionLevel: 5,
							preconditions: { entries: [], mode: 0, runCondition: 0 },
						},
					],
				},
			});
			await vi.waitFor(() => expect(component.text()).toContain("Also in Discord"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
			component.unmount();
		});
	});

	describe("GuildCommandsRuleList", () => {
		it("should have no accessibility violations", async () => {
			useGuildData().setGuildData(
				createMockOauthFlattenedGuild({ id: "123456789012345678" }),
			);
			const component = await mountSuspended(GuildCommandsRuleList, {
				props: {
					rules: [
						{
							command: "Moderation.*",
							allowedChannels: ["333333333333333333"],
							ignoredChannels: [],
							allowedRoles: ["300000000000000001"],
							ignoredRoles: ["123456789012345678"],
							allowedUsers: [],
							ignoredUsers: [],
						},
					],
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildCommandsRuleEditor", () => {
		const GUILD_ID = "123456789012345678";
		const APP_ID = "500000000000000001";

		function withDiscord(scopeGranted: boolean, registered: boolean) {
			clearNuxtData();
			registerEndpoint(`/api/guilds/${GUILD_ID}/command-permissions`, {
				method: "GET",
				handler: () => ({
					applicationId: APP_ID,
					commands: [
						{
							id: registered ? "600000000000000001" : null,
							name: "archive",
							command: "archive",
							category: "Moderation",
							description: "Archive",
						},
					],
					// Not the rule as stored: the editor says so.
					permissions: {
						"600000000000000001": [
							{ id: "300000000000000002", type: 1, permission: true },
						],
						[APP_ID]: [{ id: "333333333333333333", type: 3, permission: false }],
					},
					snapshot: "x",
					authorization: { scopeGranted, manageGuild: true, manageRoles: true },
				}),
			});
		}

		function withRule(target: string) {
			registerEndpoint(`/api/guilds/${GUILD_ID}/command-rules/${target}`, {
				method: "GET",
				handler: () => ({
					command: target,
					enabled: true,
					onlyAllowed: true,
					rule: {
						command: target,
						allowedChannels: ["333333333333333333"],
						ignoredChannels: [],
						allowedRoles: ["300000000000000002"],
						ignoredRoles: ["300000000000000001"],
						allowedUsers: ["200000000000000001"],
						ignoredUsers: [],
					},
					revision: 1,
				}),
			});
			registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
				method: "GET",
				handler: () => [],
			});
		}

		async function auditOpenEditor(
			props: Pick<
				InstanceType<typeof GuildCommandsRuleEditor>["$props"],
				"command" | "inherited"
			>,
			waitFor: string,
		) {
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			const component = await mountSuspended(GuildCommandsRuleEditor, {
				props: { open: true, ...props },
				attachTo: document.body,
			});
			// Another spec may have left its own dialog open: take this editor's
			const editorDialog = () =>
				[...document.querySelectorAll('[role="dialog"]')].find((dialog) =>
					dialog.textContent?.includes(waitFor),
				);
			await vi.waitFor(() => expect(editorDialog()).toBeDefined());
			const panel = editorDialog();
			const results = await runAxe(component, { include: panel ? [panel] : [] });
			component.unmount();
			return results.violations;
		}

		const archive = {
			name: "archive",
			label: "archive",
			category: "Moderation",
			description: "Save and read the recent messages of members.",
			subCategory: null,
		};

		it.each([
			["also in Discord, differently", true, true, "are not these rules"],
			["registered nowhere in Discord", true, false, "Not registered with Discord here"],
		])(
			"should have no accessibility violations %s",
			async (_state, scopeGranted, registered, waitFor) => {
				withDiscord(scopeGranted, registered);
				withRule("archive");
				const violations = await auditOpenEditor(
					{
						command: archive,
						inherited: [
							{
								command: "Moderation.*",
								allowedChannels: [],
								ignoredChannels: ["333333333333333333"],
								allowedRoles: [],
								ignoredRoles: [GUILD_ID],
								allowedUsers: [],
								ignoredUsers: [],
							},
						],
					},
					waitFor,
				);
				expect(violations).toEqual([]);
			},
		);

		it("should have no accessibility violations for every command, waiting for the scope", async () => {
			withDiscord(false, true);
			withRule("*");
			expect(
				await auditOpenEditor({ command: "*" }, "Discord uses these for every command"),
			).toEqual([]);
		});
	});

	describe("GuildSettingsAutomod", () => {
		it("should have no accessibility violations", async () => {
			const GUILD_ID = "123456789012345678";
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID));
			const component = await mountSuspended(GuildSettingsAutomod, {
				global: { stubs: { GuildAutomodRules: true } },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsHoneypot", () => {
		const GUILD_ID = "123456789012345678";

		it.each([
			["set up", { honeypotChannel: "234567890123456789" }],
			["not set up", {}],
		])("should have no accessibility violations while %s", async (_state, settings) => {
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID, settings));
			const component = await mountSuspended(GuildSettingsHoneypot);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsModeration", () => {
		it("should have no accessibility violations with a command response set", async () => {
			const GUILD_ID = "123456789012345678";
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(
				createMockGuildData(GUILD_ID, { messagesResponseBan: "{user} was banned." }),
			);
			const component = await mountSuspended(GuildSettingsModeration, {
				global: { stubs: { GuildModerationWarnThresholds: true, GuildReviewQueue: true } },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildModerationWarnThresholds", () => {
		it("should have no accessibility violations with thresholds set", async () => {
			const GUILD_ID = "123456789012345678";
			registerEndpoint(`/api/guilds/${GUILD_ID}/warn-thresholds`, {
				method: "GET",
				handler: () => [
					{ action: "Mute", count: 3, duration: 1800, period: 0 },
					{ action: "Ban", count: 5, duration: null, period: 604_800 },
				],
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(createMockGuildData(GUILD_ID));
			const component = await mountSuspended(GuildModerationWarnThresholds);
			await vi.waitFor(() => expect(component.findAll("tbody tr")).toHaveLength(2));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildSettingsAppeals", () => {
		it("should have no accessibility violations with the appeals on", async () => {
			const GUILD_ID = "123456789012345678";
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			useGuildSettings().setGuildSettings(
				createMockGuildData(GUILD_ID, { appealsEnabled: true, appealsThread: "private" }),
			);
			const component = await mountSuspended(GuildSettingsAppeals, {
				global: { stubs: { GuildAppealsForms: true, GuildAppealsQueue: true } },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("Join Guard", () => {
		const GUILD_ID = "123456789012345670";
		const ROLE_ID = "300000000000000001";
		const now = Date.now();
		const rule = {
			accountAgeMax: 7 * 86_400,
			alertChannelId: null,
			createdAt: now,
			defaultAvatar: true,
			directMessage: true,
			enabled: true,
			generatedName: false,
			hardAction: null,
			id: "r1",
			name: "Fresh accounts",
			nameContains: null,
			roleId: ROLE_ID,
			sendToCheckpoint: true,
			unverifiedBot: false,
		} as const;
		const entry = {
			accountCreatedAt: now - 5 * 86_400_000,
			caseId: null,
			createdAt: now - 3_600_000,
			defaultAvatar: true,
			expiresAt: null,
			generatedName: true,
			id: "c1",
			linkedAccounts: 0,
			member: { avatarUrl: null, displayName: "Sunny", id: "111", username: "sunny.art" },
			moderator: null,
			resolution: null,
			resolvedAt: null,
			ruleId: "r1",
			ruleName: "Fresh accounts",
			status: "Waiting",
			trust: 1,
		} as const;
		const queuePage = {
			counts: { all: 2, Banned: 0, Kicked: 0, Verified: 1, Waiting: 1 },
			entries: [
				entry,
				{
					...entry,
					id: "c2",
					resolution: "Checkpoint",
					status: "Verified",
					trust: 2,
				},
			],
			nextCursor: "c2",
			waiting: 1,
		};

		function openGuild(settings: Record<string, unknown> = {}) {
			registerEndpoint(`/api/guilds/${GUILD_ID}/joinguard/rules`, {
				method: "GET",
				handler: () => ({
					rules: [
						rule,
						{
							...rule,
							enabled: false,
							id: "r2",
							name: "Bots",
							hardAction: "Kick",
							roleId: null,
							sendToCheckpoint: false,
						},
					],
				}),
			});
			registerEndpoint(`/api/guilds/${GUILD_ID}/joinguard/checkpoints`, {
				method: "GET",
				handler: () => queuePage,
			});
			registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, {
				method: "GET",
				handler: () => [],
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(
				createMockOauthFlattenedGuild({
					id: GUILD_ID,
					roles: [createMockRole({ id: ROLE_ID, name: "Quarantine" })],
				}),
			);
			useGuildSettings().setGuildSettings(
				createMockGuildData(GUILD_ID, {
					joinGuardCheckpoint: true,
					joinGuardEnabled: true,
					joinGuardAllowedUsers: ["200000000000000099"],
					...settings,
				}),
			);
		}

		it("GuildSettingsJoinGuard has no accessibility violations while on", async () => {
			openGuild();
			const component = await mountSuspended(GuildSettingsJoinGuard);
			await vi.waitFor(() => expect(component.text()).toContain("Fresh accounts"));
			await vi.waitFor(() => expect(component.text()).toContain("@sunny.art"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildSettingsJoinGuard has no accessibility violations while off", async () => {
			openGuild({ joinGuardEnabled: false });
			const component = await mountSuspended(GuildSettingsJoinGuard);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardRules has no accessibility violations", async () => {
			openGuild();
			const component = await mountSuspended(GuildJoinguardRules);
			await vi.waitFor(() => expect(component.text()).toContain("Bots"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardRuleCard has no accessibility violations", async () => {
			openGuild();
			const component = await mountSuspended(GuildJoinguardRuleCard, { props: { rule } });
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardRuleEditor has no accessibility violations while open", async () => {
			openGuild();
			const component = await mountSuspended(GuildJoinguardRuleEditor, {
				attachTo: document.body,
				props: {
					checkpointOn: false,
					errorCode: "limit",
					guild: createMockOauthFlattenedGuild({ id: GUILD_ID }),
					open: true,
					rule,
				},
			});
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"] form')).not.toBeNull(),
			);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
			component.unmount();
		});

		it("GuildJoinguardCheckpoint has no accessibility violations", async () => {
			openGuild({ joinGuardCheckpointTimeout: 86_400 });
			const component = await mountSuspended(GuildJoinguardCheckpoint);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardAllowList has no accessibility violations", async () => {
			openGuild({ joinGuardAllowedRoles: [ROLE_ID] });
			const component = await mountSuspended(GuildJoinguardAllowList);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardNotices has no accessibility violations", async () => {
			openGuild({ joinGuardDirectMessageContent: "{server} checks new accounts." });
			const component = await mountSuspended(GuildJoinguardNotices);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("GuildJoinguardQueue has no accessibility violations with a request in flight", async () => {
			openGuild();
			const queue = useJoinGuardQueue({ filter: "all", guildId: GUILD_ID });
			await vi.waitFor(() => expect(queue.entries.value).toHaveLength(2));
			queue.rowRequests.value = { c1: { kind: "Verify", state: "sending" } };
			const component = await mountSuspended(GuildJoinguardQueue, {
				props: { filter: "all", queue },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("VerifyTrustMeter has no accessibility violations", async () => {
			const component = await mountSuspended(VerifyTrustMeter, {
				props: { level: 1, minimum: 2 },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("the verification page has no accessibility violations for a visitor", async () => {
			registerEndpoint(`/api/verify/${GUILD_ID}`, {
				method: "GET",
				handler: () => {
					throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
				},
			});
			const component = await mountSuspended(VerifyPage, { route: `/verify/${GUILD_ID}` });
			await vi.waitFor(() => expect(component.text()).toContain("Sign in with Discord"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildAppealsForms", () => {
		it("should have no accessibility violations with two forms", async () => {
			const GUILD_ID = "123456789012345679";
			const question = {
				id: "why",
				kind: "text",
				label: "Why?",
				long: true,
				maxLength: 1000,
				required: true,
			};
			registerEndpoint(`/api/guilds/${GUILD_ID}/appeals/forms`, {
				method: "GET",
				handler: () => [
					{
						id: "1",
						guildId: GUILD_ID,
						name: "Ban appeal",
						description: "For bans only.",
						icon: "🔨",
						enabled: true,
						lockReason: null,
						types: [0],
						requiredRoles: [],
						restrictedRoles: [],
						questions: [question],
						position: 0,
					},
					{
						id: "2",
						guildId: GUILD_ID,
						name: "Mute appeal",
						description: null,
						icon: null,
						enabled: false,
						lockReason: "Closed for the week.",
						types: [],
						requiredRoles: [],
						restrictedRoles: [],
						questions: [question],
						position: 1,
					},
				],
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			const component = await mountSuspended(GuildAppealsForms);
			await vi.waitFor(() => expect(component.text()).toContain("Mute appeal"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildAppealsQueue", () => {
		it("should have no accessibility violations with a pending and a decided appeal", async () => {
			const GUILD_ID = "123456789012345680";
			const user = { id: "111111111111111111", displayName: "alt_account", avatar: null };
			registerEndpoint(`/api/guilds/${GUILD_ID}/appeals`, {
				method: "GET",
				handler: () => ({
					entries: [
						{
							id: "1",
							caseId: 42,
							caseType: "Ban",
							formName: "Ban appeal",
							user,
							status: "pending",
							answers: [
								{
									questionId: "a",
									label: "What happened?",
									value: "That was my brother.",
								},
								{
									questionId: "b",
									label: "What will change?",
									value: "I changed my password.",
								},
							],
							reason: null,
							reviewer: null,
							createdAt: "2026-11-04T10:02:00.000Z",
							decidedAt: null,
						},
						{
							id: "2",
							caseId: 46,
							caseType: "Timeout",
							formName: null,
							user: { ...user, id: "222222222222222222", displayName: "loud_user" },
							status: "denied",
							answers: [
								{
									questionId: "a",
									label: "Why?",
									value: "I was hyped for the event.",
								},
							],
							reason: "Too soon.",
							reviewer: { ...user, id: "333333333333333333", displayName: "mod_one" },
							createdAt: "2026-11-03T16:20:00.000Z",
							decidedAt: "2026-11-03T18:00:00.000Z",
						},
					],
					total: 2,
					counts: { accepted: 0, denied: 1, pending: 1 },
					canReview: true,
				}),
			});
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			const component = await mountSuspended(GuildAppealsQueue);
			await vi.waitFor(() => expect(component.text()).toContain("@alt_account"));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardMyAppeals", () => {
		const GUILD_ID = "123456789012345681";
		const guild = { id: GUILD_ID, name: "Pixel Parlor", icon: null };
		const banCase = {
			id: 212,
			type: "Ban" as const,
			reason: "Advertising",
			createdAt: "2026-11-01T12:00:00.000Z",
			duration: null,
			state: "active" as const,
		};

		it("should have no accessibility violations with an open and a pending case", async () => {
			registerEndpoint("/api/users/appeals", {
				method: "GET",
				handler: () => ({
					entries: [
						{
							key: "a",
							guild,
							case: banCase,
							status: "open",
							appeal: null,
							againAt: null,
							closed: null,
						},
						{
							key: "b",
							guild: { ...guild, id: "123456789012345682", name: "Game Night" },
							case: { ...banCase, id: 88, type: "Timeout", duration: 86_400_000 },
							status: "pending",
							appeal: {
								formName: "Mute or timeout",
								answers: [
									{
										questionId: "why",
										label: "Why?",
										value: "Sorry for the spam.",
									},
								],
								createdAt: "2026-11-02T12:00:00.000Z",
								decidedAt: null,
								reason: null,
							},
							againAt: null,
							closed: null,
						},
					],
					openCount: 1,
				}),
			});
			const component = await mountSuspended(DashboardMyAppeals);
			await vi.waitFor(() => expect(component.findAll("article")).toHaveLength(2));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
			component.unmount();
		});

		it("should have no accessibility violations with the appeal dialog open", async () => {
			const formCase = {
				id: 212,
				type: "Ban",
				reason: "Advertising",
				createdAt: 0,
				duration: null,
			};
			const questions: AppealQuestion[] = [
				{ id: "info", kind: "display", content: "Be honest." },
				{
					id: "why",
					kind: "text",
					label: "Why?",
					help: "In your own words.",
					long: true,
					maxLength: 1000,
					required: true,
				},
				{
					id: "rules",
					kind: "choice",
					label: "Did you read the rules?",
					min: 1,
					max: 1,
					options: [
						{ label: "Yes", value: "yes" },
						{ label: "Not yet", value: "no" },
					],
					required: true,
				},
				{
					id: "where",
					kind: "choice",
					label: "Where did it happen?",
					min: 1,
					max: 2,
					options: [
						{ label: "Chat", value: "chat" },
						{ label: "Voice", value: "voice" },
					],
					required: false,
				},
				{
					id: "shots",
					kind: "attachment",
					label: "Screenshots",
					imagesOnly: true,
					min: 0,
					max: 3,
				},
			];
			const form = {
				id: "ban",
				name: "Ban appeal",
				description: "Tell the staff what happened.",
				icon: "🔨",
				questions,
				lockReason: null,
				lock: null,
				until: null,
				cases: [formCase],
			};
			const page: AppealPage = {
				guild,
				enabled: true,
				block: null,
				forms: [
					form,
					{
						...form,
						id: "promo",
						name: "Ad or self-promo",
						lock: "cooldown",
						lockReason: "Opens again on Monday.",
						cases: [],
					},
				],
				appeals: [],
			};
			const component = await mountSuspended(DashboardMyAppealDialog, {
				props: {
					open: true,
					entry: {
						key: "a",
						guild,
						case: banCase,
						status: "open",
						appeal: null,
						againAt: null,
						closed: null,
					},
					loadPage: () => Promise.resolve({ ok: true, value: page }),
					submit: () => Promise.resolve({ ok: true, value: undefined }),
				},
				attachTo: document.body,
			});
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"] form')).not.toBeNull(),
			);
			const panel = document.querySelector('[role="dialog"]');
			const results = await runAxe(component, { include: panel ? [panel] : [] });
			expect(results.violations).toEqual([]);
			component.unmount();
		});
	});

	describe("GuildAppealsEmojiPicker", () => {
		it("should have no accessibility violations with the picker open", async () => {
			const component = await mountSuspended(GuildAppealsEmojiPicker, {
				props: {
					modelValue: "😀",
					servers: [{ id: "123456789012345678", name: "wolf", animated: false }],
				},
				attachTo: document.body,
			});
			await component.get('button[aria-haspopup="dialog"]').trigger("click");
			await vi.waitFor(
				() =>
					expect(
						document.querySelector('[data-cell][aria-label="grinning face"]'),
					).not.toBeNull(),
				{ timeout: 20_000 },
			);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
			component.unmount();
		});
	});

	describe("GuildAppealsFormEditor", () => {
		it("should have no accessibility violations with the editor open", async () => {
			const GUILD_ID = "123456789012345678";
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
			const component = await mountSuspended(GuildAppealsFormEditor, {
				props: {
					open: true,
					guild: createMockOauthFlattenedGuild({ id: GUILD_ID }),
					form: {
						id: "1",
						guildId: GUILD_ID,
						name: "Ban appeal",
						description: "For bans only.",
						icon: "🔨",
						enabled: false,
						lockReason: "Closed for the week.",
						types: [0],
						requiredRoles: [],
						restrictedRoles: [],
						questions: [
							{
								id: "why",
								kind: "text",
								label: "Why?",
								placeholder: "Be honest",
								long: true,
								maxLength: 1000,
								required: true,
							},
							{
								id: "which",
								kind: "choice",
								label: "Which rule?",
								options: [
									{ label: "Spam", value: "a" },
									{ label: "Insults", value: "b" },
								],
								min: 1,
								max: 1,
								required: true,
							},
						],
						position: 0,
					},
				},
				attachTo: document.body,
			});
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"] form')).not.toBeNull(),
			);
			const panel = document.querySelector('[role="dialog"]');
			const results = await runAxe(component, { include: panel ? [panel] : [] });
			expect(results.violations).toEqual([]);
			component.unmount();
		});
	});

	describe("automatic channel sections", () => {
		const GUILD_ID = "123456789012345678";
		const CHANNEL = "234567890123456789";

		function prepare() {
			useActiveGuild().selectGuild(GUILD_ID);
			useGuildData().setGuildData(createMockOauthFlattenedGuild({ id: GUILD_ID }));
		}

		it("should have no accessibility violations on Auto-Delete", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/autodelete`, {
				method: "GET",
				handler: () => [
					{ allow: ["links"], bots: true, channelId: CHANNEL, delay: 60, id: "1" },
				],
			});
			prepare();
			const component = await mountSuspended(GuildSettingsAutoDelete);
			await vi.waitFor(() => expect(component.find("tbody tr").exists()).toBe(true));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations on Auto-Purge", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/autopurge`, {
				method: "GET",
				handler: () => [
					{
						channelId: CHANNEL,
						filter: "contains",
						id: "1",
						interval: 86_400,
						nextRunAt: "2026-10-23T04:00:00.000Z",
						value: "discord.gg/",
					},
				],
			});
			prepare();
			const component = await mountSuspended(GuildSettingsAutoPurge);
			await vi.waitFor(() => expect(component.find("tbody tr").exists()).toBe(true));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});

		it("should have no accessibility violations on Auto-Message", async () => {
			registerEndpoint(`/api/guilds/${GUILD_ID}/automessage`, {
				method: "GET",
				handler: () => [
					{
						channelId: CHANNEL,
						content: "Read the rules before posting.",
						id: "1",
						interval: 86_400,
						mentions: false,
						nextRunAt: "2026-10-23T09:00:00.000Z",
					},
				],
			});
			prepare();
			const component = await mountSuspended(GuildSettingsAutoMessage);
			await vi.waitFor(() => expect(component.find("li").exists()).toBe(true));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildReviewQueue", () => {
		it("should have no accessibility violations", async () => {
			registerEndpoint("/api/guilds/123456789012345678/reports", {
				method: "GET",
				handler: () => ({
					entries: [
						{
							closedAt: null,
							createdAt: "2026-10-14T12:32:00.000Z",
							id: "412",
							reason: "Spamming the same link in #general",
							status: "Open",
							targetId: "223456789012345678",
							targetTag: "loud-user",
						},
					],
					total: 1,
				}),
			});
			useActiveGuild().selectGuild("123456789012345678");
			useGuildData().setGuildData(
				createMockOauthFlattenedGuild({ id: "123456789012345678", name: "WolfStar HQ" }),
			);
			const component = await mountSuspended(GuildReviewQueue);
			await vi.waitFor(() => expect(component.find("tbody tr").exists()).toBe(true));
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildAuditChanges", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildAuditChanges, {
				props: {
					entry: {
						...MOCK_AUDIT_ENTRY,
						changes: {
							changed: {
								language: { from: "en-US", to: "it-IT" },
								modulesAutomod: { from: false, to: true },
							},
						},
					},
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("GuildLogsCaseDetail", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(GuildLogsCaseDetail, {
				props: {
					entry: {
						...MOCK_MODERATION_ENTRY,
						typeName: "Mute",
						duration: 3600,
						metadata: {
							archived: false,
							completed: true,
							temporary: true,
							undo: false,
						},
						status: "completed",
						extra: { kind: "roles", roleIds: ["333333333333333333"] },
						message: {
							channelId: "444444444444444444",
							messageId: "555555555555555555",
						},
					},
				},
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("DashboardContextCard", () => {
		it("should have no accessibility violations on a module section and elsewhere", async () => {
			useActiveGuild().selectGuild("123456789012345678");
			useActiveGuild().setSection("automod");
			// The switch shows once the saved settings are in.
			useGuildSettings().setGuildSettings(createMockGuildData("123456789012345678"));
			const withSwitch = await mountSuspended(DashboardContextCard, {
				route: "/?screen=page",
			});
			expect(withSwitch.find('[role="switch"]').exists()).toBe(true);
			expect((await runAxe(withSwitch)).violations).toEqual([]);

			useActiveGuild().setSection("commands");
			const withList = await mountSuspended(DashboardContextCard, {
				route: "/?screen=page",
			});
			expect((await runAxe(withList)).violations).toEqual([]);
		});
	});

	describe("DashboardPageHeader", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(DashboardPageHeader, {
				props: { description: "Turn modules on or off.", title: "Modules" },
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("IconsApp", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(IconsApp);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("IconsWolfstar", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended(IconsWolfstar);
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("AppFooter", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppFooter);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("exposes the footer landmark with an accessible name", async () => {
			const wrapper = await mountSuspended(AppFooter);
			expect(wrapper.find("[aria-label='Site footer']").exists()).toBe(true);
		});

		it("marks the decorative logo as an image and hides the inner svg from AT", async () => {
			const wrapper = await mountSuspended(AppFooter);
			const logo = wrapper.find("[role='img'][aria-label='WolfStar logo']");
			expect(logo.exists()).toBe(true);
			expect(logo.find("svg").attributes("aria-hidden")).toBe("true");
		});

		it("gives the external links accessible names that announce a new tab", async () => {
			const wrapper = await mountSuspended(AppFooter);
			expect(
				wrapper.find("[aria-label='Powered by Cloudflare - opens in new tab']").exists(),
			).toBe(true);
			expect(
				wrapper.find("[aria-label='Visit WolfStar on GitHub - opens in new tab']").exists(),
			).toBe(true);
			expect(
				wrapper
					.find("[aria-label='Join the WolfStar Discord - opens in new tab']")
					.exists(),
			).toBe(true);
			expect(
				wrapper.find("[aria-label='Follow WolfStar on X - opens in new tab']").exists(),
			).toBe(true);
		});
	});

	describe("AppHeader", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountAppHeader();
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("renders the banner landmark", async () => {
			const wrapper = await mountAppHeader();
			expect(wrapper.find("header").exists()).toBe(true);
		});

		it("names the primary navigation for assistive tech", async () => {
			const wrapper = await mountAppHeader();
			expect(wrapper.find("[aria-label='Main navigation']").exists()).toBe(true);
		});

		it("renders the WolfStar logo mark with the resized svg hidden from AT", async () => {
			const wrapper = await mountAppHeader();
			const brandLink = wrapper.find("a[aria-label='WolfStar home']");
			expect(brandLink.exists()).toBe(true);

			const svg = brandLink.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("aria-hidden")).toBe("true");
			expect(svg.classes()).toContain("h-20");
			expect(svg.classes()).toContain("w-45");
		});
	});

	describe("AppHeaderAuth", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("renders sign-in buttons that link to /login with an accessible name", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const signInLinks = wrapper.findAll("a[href='/login']");
			expect(signInLinks.length).toBeGreaterThan(0);
			for (const link of signInLinks) {
				expect(link.attributes("aria-label")).toBe("Sign in with Discord");
			}
		});

		it("renders a settings button with an accessible name for guests", async () => {
			const wrapper = await mountSuspended(AppHeaderAuth);
			const settingsButtons = wrapper.findAll('button[aria-label="Settings"]');
			expect(settingsButtons.length).toBeGreaterThan(0);
		});
	});

	describe("AppHeaderAuthSkeleton", () => {
		it.each([false, true])("has no axe-core violations (mobile: %s)", async (mobile) => {
			const wrapper = await mountSuspended(AppHeaderAuthSkeleton, { props: { mobile } });
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});
	});

	describe("AppPreferences", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppPreferences);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("has no axe-core violations in the compact set", async () => {
			const wrapper = await mountSuspended(AppPreferences, { props: { quick: true } });
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});
	});

	describe("AppCustomThemeEditor", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppCustomThemeEditor);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});
	});

	describe("AppCustomThemePanel", () => {
		it("has no axe-core violations", async () => {
			useCustomThemePanel().open();
			const wrapper = await mountSuspended(AppCustomThemePanel, { attachTo: document.body });
			await vi.waitFor(() =>
				expect(document.querySelector('[role="dialog"]')).not.toBeNull(),
			);
			const panel = document.querySelector('[role="dialog"]');
			const results = await runAxe(wrapper, { include: panel ? [panel] : [] });
			expect(results.violations).toEqual([]);
			useCustomThemePanel().discard();
			wrapper.unmount();
		});
	});

	describe("AppLogoMark", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppLogoMark);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("marks the decorative logo as aria-hidden so it is ignored by assistive tech", async () => {
			const wrapper = await mountSuspended(AppLogoMark);
			const svg = wrapper.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("aria-hidden")).toBe("true");
			expect(svg.attributes("role")).toBeUndefined();
		});
	});

	describe("Home page components", () => {
		describe("SectionHeader", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(SectionHeader, {
					props: {
						eyebrow: "Features",
						title: "And more than moderation.",
						description: "Every tool your moderation team needs.",
						headingId: "home-features-heading",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("WolfstarHeroSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarHeroSection, {
					props: {
						buildTime: new Date("2024-06-01T12:00:00Z"),
						buildVersion: "7.0.0",
						inviteUrl,
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("WolfstarProductProofSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarProductProofSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DashboardSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarDashboardSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CtaSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarCtaSection, {
					props: { inviteUrl },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CommandsShowcase", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarCommandsShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CommandsSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarCommandsSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylHeroSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylHeroSection, {
					props: {
						inviteUrl:
							"https://discord.com/oauth2/authorize?client_id=1489991104672567386",
						release: { version: "1.0.0", time: Date.parse("2026-10-28T09:25:24Z") },
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylProductProofSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylProductProofSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylCommandsShowcase", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylCommandsShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylCommandsSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylCommandsSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylSetupSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylSetupSection, {
					props: { inviteUrl: "https://discord.com/oauth2/authorize?client_id=1" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylNotificationShowcase", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylNotificationShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("StarylCtaSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StarylCtaSection, {
					props: {
						inviteUrl:
							"https://discord.com/oauth2/authorize?client_id=1489991104672567386",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("ModerationShowcase", () => {
			it("should have no accessibility violations with all features visible", async () => {
				const component = await mountSuspended(WolfstarModerationShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("ModerationShowcaseSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(WolfstarModerationShowcaseSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});
	});

	describe("OAuth components", () => {
		describe("OauthStatusPanel", () => {
			it("should have no accessibility violations in the loading state", async () => {
				const component = await mountSuspended(OauthStatusPanel, {
					props: {
						tone: "info",
						title: "Signing You In",
						loading: true,
						icon: "ph:discord-logo-fill",
					},
					slots: {
						description: "Connecting to Discord...",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations in the success state", async () => {
				const component = await mountSuspended(OauthStatusPanel, {
					props: {
						tone: "success",
						title: "Welcome redstar!",
						icon: "heroicons:check-circle",
					},
					slots: {
						description: "Redirecting you to the dashboard...",
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("ErrorPage", () => {
			it("should have no accessibility violations for a 404 error", async () => {
				const component = await mountSuspended(ErrorPage, {
					props: {
						error: createError({
							status: 404,
							statusText: "Page not found",
							message: "Page not found: /missing-page",
						}),
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations for a 500 error", async () => {
				const component = await mountSuspended(ErrorPage, {
					props: {
						error: createError({
							status: 500,
							statusText: "Internal Server Error",
							message: "fetch failed",
						}),
					},
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});
	});
});
