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
		// Real spaces and colons, so a copy or a search reads the command as typed.
		expect(group.element.textContent).toBe("/conf menu save key:prefix value:new value");
	});

	it("names the chip in the reader's language (positive)", async () => {
		// ARRANGE
		useNuxtApp().$mergeTranslations({
			discord: { command: { label: "Comando slash {command}" } },
		});

		// ACT
		const wrapper = await mountSuspended(DiscordChatInputCommand, {
			props: {
				name: "ban",
				subcommand: "add",
				options: [{ name: "user", value: "@baddie" }],
			},
		});

		// ASSERT
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe(
			"Comando slash /ban add user: @baddie",
		);
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
