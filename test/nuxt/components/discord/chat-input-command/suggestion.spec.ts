import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChatInputCommandSuggestion from "~/components/discord/chat-input-command/suggestion.vue";

describe("DiscordChatInputCommandSuggestion", () => {
	it("renders as a selectable option and emits select on click or Enter (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatInputCommandSuggestion, {
			props: {
				name: "warn",
				description: "Warn a member",
				app: "wolfstar",
				active: true,
			},
		});
		const option = wrapper.find("[role='option']");

		// ACT
		await option.trigger("click");
		await option.trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(option.attributes("aria-selected")).toBe("true");
		expect(option.attributes("aria-label")).toContain("warn");
		expect(wrapper.text()).toContain("/warn");
		expect(wrapper.text()).toContain("Warn a member");
		expect(wrapper.emitted("select")).toHaveLength(2);
	});

	it("ignores activation when the suggestion is disabled (negative)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatInputCommandSuggestion, {
			props: {
				name: "third-party",
				disabled: true,
				active: false,
			},
		});
		const option = wrapper.find("[role='option']");

		// ACT
		await option.trigger("click");
		await option.trigger("keydown", { key: " " });

		// ASSERT
		expect(option.attributes("aria-disabled")).toBe("true");
		expect(option.attributes("tabindex")).toBe("-1");
		expect(option.classes()).toContain("discord-slash-command-suggestion-disabled");
		expect(wrapper.emitted("select")).toBeUndefined();
	});
});
