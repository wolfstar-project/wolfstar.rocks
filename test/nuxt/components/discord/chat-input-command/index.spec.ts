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
		expect(group.attributes("aria-label")).toBe(
			"Slash command /conf menu save key: prefix value: new value",
		);
		expect(group.text()).toMatch(/^\/conf\s*menu\s*save/);
		expect(group.text()).toContain("prefix");
		expect(group.text()).toContain("new value");
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
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe(
			"Slash command /warn user: user",
		);
		expect(wrapper.text().match(/user/g)).toHaveLength(2);
	});

	it("drops a subcommand group that has no subcommand (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: { name: "help", subcommandGroup: "orphan" },
		});

		// ASSERT
		expect(wrapper.text()).not.toContain("orphan");
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe("Slash command /help");
	});

	it("renders without options when options are empty (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: { name: "help" },
		});

		// ASSERT
		expect(wrapper.text()).toBe("/help");
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe("Slash command /help");
	});
});
