import type { SlashCommandAppName } from "~/types/constants";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChatInputCommandMatched from "~/components/discord/chat-input-command/matched.vue";
import DiscordChatInputCommandSuggestion from "~/components/discord/chat-input-command/suggestion.vue";
import DiscordChatInputCommandSuggestions from "~/components/discord/chat-input-command/suggestions.vue";

const components = {
	DiscordChatInputCommandMatched,
	DiscordChatInputCommandSuggestion,
	DiscordChatInputCommandSuggestions,
};

describe("DiscordChatInputCommandSuggestions", () => {
	it("renders the frequently used list, the app rail, and the matched command (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended({
			components,
			template: `
				<DiscordChatInputCommandSuggestions prefix="/war">
					<template #frequently-used>
						<DiscordChatInputCommandSuggestion name="warn" description="Warn a member" />
					</template>
					<template #matched>
						<DiscordChatInputCommandMatched name="warn" active />
					</template>
				</DiscordChatInputCommandSuggestions>
			`,
		});

		// ASSERT
		const region = wrapper.find("[role='region']");
		expect(region.attributes("aria-label")).toBe("Slash command suggestions for /war");
		const listboxes = wrapper.findAll("[role='listbox']");
		expect(listboxes.map((listbox) => listbox.attributes("aria-label"))).toEqual([
			"Slash command suggestions",
			"Matched slash command",
		]);
		expect(listboxes[0]?.text()).toContain("Frequently Used");
		expect(listboxes[0]?.find("[role='option']").exists()).toBe(true);
		expect(listboxes[1]?.find("[role='option']").attributes("aria-selected")).toBe("true");
		// The matched command sits under the command list, not inside it.
		expect(listboxes[0]?.element.contains(listboxes[1]?.element ?? null)).toBe(false);
		const rail = wrapper.find("nav");
		expect(rail.attributes("aria-label")).toBe("Applications");
		const railItems = rail.findAll("button");
		expect(railItems.length).toBeGreaterThan(1);
		expect(railItems[0]?.attributes("aria-pressed")).toBe("true");
		expect(rail.find("[aria-label='WolfStar commands']").exists()).toBe(true);
	});

	it("names the rail's apps in the reader's language (positive)", async () => {
		// ARRANGE
		useNuxtApp().$mergeTranslations({
			discord: { suggestions: { app_commands: "Comandi di {app}" } },
		});

		// ACT
		const wrapper = await mountSuspended(DiscordChatInputCommandSuggestions, {
			props: { prefix: "/" },
			slots: { "frequently-used": "<p>recent</p>" },
		});

		// ASSERT
		expect(wrapper.find("nav [aria-label='Comandi di WolfStar']").exists()).toBe(true);
	});

	it("filters to an app when its rail item is pressed (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatInputCommandSuggestions, {
			props: { prefix: "/" },
			slots: { "frequently-used": "<p>recent</p>", "default": "<p>grouped</p>" },
		});
		const railItems = wrapper.find("nav").findAll("button");

		// ACT
		await railItems[1]!.trigger("click");

		// ASSERT
		const selected =
			wrapper.emitted<[SlashCommandAppName | null]>("update:selectedApp")?.[0]?.[0];
		expect(selected).toBeTruthy();
		await wrapper.setProps({ selectedApp: selected });
		expect(wrapper.text()).not.toContain("Frequently Used");
		expect(wrapper.text()).toContain("grouped");
		expect(wrapper.find("nav").findAll("button")[0]?.attributes("aria-pressed")).toBe("false");
	});

	it("renders only the matched command list without a frequently used slot (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommandSuggestions, {
			props: { prefix: "/warn" },
			slots: { matched: "<p>only matched</p>", default: "<p>hidden default</p>" },
		});

		// ASSERT
		expect(wrapper.find("nav").exists()).toBe(false);
		expect(wrapper.findAll("[role='listbox']")).toHaveLength(1);
		expect(wrapper.text()).toContain("only matched");
		expect(wrapper.text()).not.toContain("hidden default");
	});
});
