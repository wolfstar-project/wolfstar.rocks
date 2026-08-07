import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChatInputCommand from "~/components/discord/chat-input-command/index.vue";

describe("DiscordChatInputCommand", () => {
	it("renders the composed slash command path and options (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: {
				name: "conf",
				subcommandGroup: "menu",
				subcommand: "save",
				options: [
					{ name: "key", value: "prefix" },
					{ name: "value", description: "new value", focused: true },
				],
			},
		});

		// ASSERT
		const group = wrapper.find("[role='group']");
		expect(group.exists()).toBe(true);
		expect(group.attributes("aria-label")).toContain("Slash command /conf menu save");
		expect(wrapper.find(".discord-slash-command-composed-name").text()).toBe("/conf");
		expect(wrapper.text()).toContain("menu");
		expect(wrapper.text()).toContain("save");
		expect(wrapper.find(".discord-slash-command-option-focused").exists()).toBe(true);
		expect(wrapper.find(".discord-slash-command-option-value").text()).toBe("prefix");
		expect(wrapper.find(".discord-slash-command-option-placeholder").text()).toBe("new value");
	});

	it("uses the option name as placeholder when value and description are missing (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: {
				name: "warn",
				options: [{ name: "user" }],
			},
		});

		// ASSERT
		expect(wrapper.find(".discord-slash-command-option-value").exists()).toBe(false);
		expect(wrapper.find(".discord-slash-command-option-placeholder").text()).toBe("user");
		expect(wrapper.find(".discord-slash-command-option-focused").exists()).toBe(false);
	});

	it("renders without options chrome when options are empty (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: { name: "help" },
		});

		// ASSERT
		expect(wrapper.find(".discord-slash-command-option").exists()).toBe(false);
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe("Slash command /help");
	});
});
