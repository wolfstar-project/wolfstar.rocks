import type { VueWrapper } from "@vue/test-utils";
import type { AxeResults, RunOptions } from "axe-core";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it } from "vitest";
import "axe-core";

// axe-core is a UMD module that exposes itself as window.axe in the browser
declare const axe: {
	run: (context: Element, options?: RunOptions) => Promise<AxeResults>;
};

// Track mounted containers for cleanup
const mountedContainers: HTMLElement[] = [];

const axeRunOptions: RunOptions = {
	// Only compute violations to reduce work per run
	resultTypes: ["violations"],
	// Disable rules that don't apply to isolated component testing
	rules: {
		// These rules check page-level concerns that don't apply to isolated components
		"landmark-one-main": { enabled: false },
		"region": { enabled: false },
		"page-has-heading-one": { enabled: false },
		// Duplicate landmarks are expected when testing multiple header/footer components
		"landmark-no-duplicate-banner": { enabled: false },
		"landmark-no-duplicate-contentinfo": { enabled: false },
		"landmark-no-duplicate-main": { enabled: false },
		// Color contrast checks are unreliable in isolated component tests because
		// DaisyUI/Tailwind theme variables resolve differently without the full page
		// context (data-theme attribute on <html>). Contrast should be validated via
		// full-page Lighthouse or manual audits instead.
		"color-contrast": { enabled: false },
	},
};

/**
 * Run axe accessibility audit on a mounted component.
 * Mounts the component in an isolated container to avoid cross-test pollution.
 */
async function runAxe(wrapper: VueWrapper): Promise<AxeResults> {
	const container = document.createElement("div");
	container.id = `test-container-${Date.now()}`;
	document.body.appendChild(container);
	mountedContainers.push(container);

	const el = wrapper.element.cloneNode(true) as HTMLElement;
	container.appendChild(el);

	return axe.run(container, axeRunOptions);
}

// Clean up mounted containers after each test
afterEach(() => {
	for (const container of mountedContainers) {
		container.remove();
	}
	mountedContainers.length = 0;
});

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
						command: { user: "stella", name: "help" },
					},
					slots: { default: "Here is your help response." },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});
		});

		describe("DiscordButton", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordButton, {
					props: { ariaLabel: "Click me" },
					slots: { default: "Click" },
				});
				const results = await runAxe(component);
				expect(results.violations).toEqual([]);
			});

			it("should have no accessibility violations without explicit aria-label", async () => {
				const component = await mountSuspended(DiscordButton, {
					slots: { default: "Submit" },
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

		describe("DiscordInlineCode", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordInlineCode, {
					slots: { default: "!help" },
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

		describe("DiscordTime", () => {
			it("should have no accessibility violations", async () => {
				const component = await mountSuspended(DiscordTime, {
					props: { date: Date.now(), format: "long" },
				});
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
});
