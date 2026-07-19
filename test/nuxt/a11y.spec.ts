import {
	AppFooter,
	AppHeader,
	AppHeaderAuth,
	AppLogoMark,
	ChangelogContributorMention,
	ChangelogContributors,
	UApp,
	CommandsSection,
	CommandsShowcase,
	CtaSection,
	DashboardSection,
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
	DiscordV2StringSelectMenu,
	ModerationShowcase,
	ModerationShowcaseSection,
	FeaturesSection,
	GuildSettingsSection,
	HeroSection,
	IconsApp,
	IconsWolfstar,
	SectionHeader,
	Separator,
	StatsSection,
	TestimonialsSection,
} from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { bentoFeatures, dashboardMembers, stats, testimonials } from "~/utils/constants";
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

		describe("DiscordSlashCommand", () => {
			it("should have no accessibility violations with composed variant", async () => {
				const component = await mountSuspended(DiscordSlashCommand, {
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

		describe("DiscordSlashCommandSuggestion", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
					components: { DiscordSlashCommandSuggestion },
					template: `
						<div role="listbox" aria-label="Slash command suggestions">
							<DiscordSlashCommandSuggestion
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

		describe("DiscordSlashCommandSuggestionMatched", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
					components: { DiscordSlashCommandSuggestionMatched },
					template: `
						<div role="listbox" aria-label="Matched slash commands">
							<DiscordSlashCommandSuggestionMatched
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

		describe("DiscordSlashCommandSuggestions", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended({
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
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordSlashCommandInput", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordSlashCommandInput, {
					props: { value: "/warn" },
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

		describe("DiscordV2StringSelectMenu", () => {
			const selectOptions = [
				{ value: "prefix", label: "prefix", emoji: "⚙️", description: "Command prefix" },
				{
					value: "language",
					label: "language",
					emoji: "⚙️",
					description: "Response language",
				},
			];

			it("should have no accessibility violations when closed", async () => {
				const component = await mountSuspended(DiscordV2StringSelectMenu, {
					props: { options: selectOptions, ariaLabel: "Configuration category" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations when open", async () => {
				const component = await mountSuspended(DiscordV2StringSelectMenu, {
					props: { options: selectOptions, ariaLabel: "Configuration category" },
				});
				await component.find("button[role='combobox']").trigger("click");
				const results = await runAxe(component);
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

	describe("ChangelogContributorMention", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended({
				components: { ChangelogContributorMention, UApp },
				template: `
					<UApp>
						<ChangelogContributorMention
							name="RedStar"
							username="RedStar071"
							:commits="1847"
							:has-contributed="true"
							avatar-src="https://github.com/RedStar071.png"
						/>
					</UApp>
				`,
			});
			const results = await runAxe(component);
			expect(results.violations).toEqual([]);
		});
	});

	describe("ChangelogContributors", () => {
		it("should have no accessibility violations", async () => {
			const component = await mountSuspended({
				components: { ChangelogContributors, UApp },
				setup() {
					return {
						contributors: [
							{
								name: "RedStar",
								username: "RedStar071",
								commits: 1847,
								hasContributed: true,
								avatarSrc: "https://github.com/RedStar071.png",
							},
						],
					};
				},
				template: `
					<UApp>
						<ChangelogContributors id-prefix="v1.0.0" :contributors="contributors" />
					</UApp>
				`,
			});
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
				wrapper.find("[aria-label='Powered by Netlify - opens in new tab']").exists(),
			).toBe(true);
			expect(
				wrapper.find("[aria-label='Visit WolfStar on GitHub - opens in new tab']").exists(),
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
			const svg = wrapper.find("svg");
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

		describe("HeroSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(HeroSection, {
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

		describe("StatsSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(StatsSection, {
					props: { stats },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("FeaturesSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(FeaturesSection, {
					props: { features: bentoFeatures },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DashboardSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DashboardSection, {
					props: { members: dashboardMembers },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("TestimonialsSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(TestimonialsSection, {
					props: { testimonials },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CtaSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(CtaSection, {
					props: { inviteUrl },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CommandsShowcase", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(CommandsShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("CommandsSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(CommandsSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("ModerationShowcase", () => {
			it("should have no accessibility violations with all features visible", async () => {
				const component = await mountSuspended(ModerationShowcase);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("ModerationShowcaseSection", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(ModerationShowcaseSection);
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});
	});
});
