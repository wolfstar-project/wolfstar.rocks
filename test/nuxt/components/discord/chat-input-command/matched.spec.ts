import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChatInputCommandMatched from "~/components/discord/chat-input-command/matched.vue";

describe("DiscordChatInputCommandMatched", () => {
	it("renders the matched invocation and emits select on Space and click (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatInputCommandMatched, {
			props: {
				name: "conf",
				subcommand: "menu",
				active: true,
				options: [{ name: "key", value: "prefix" }],
			},
		});
		const option = wrapper.find("[role='option']");

		// ACT
		await option.trigger("keydown", { key: " " });
		await option.trigger("click");

		// ASSERT
		expect(option.attributes("aria-selected")).toBe("true");
		expect(option.attributes("aria-label")).toBe("Slash command: /conf menu key: prefix");
		expect(option.find("[role='group']").attributes("aria-label")).toBe(
			"Slash command /conf menu key: prefix",
		);
		expect(wrapper.emitted("select")).toHaveLength(2);
	});

	it("marks inactive matched rows as not selected (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatInputCommandMatched, {
			props: { name: "help", active: false },
		});

		// ASSERT
		const option = wrapper.find("[role='option']");
		expect(option.attributes("aria-selected")).toBe("false");
		expect(option.attributes("data-state")).toBe("inactive");
		expect(wrapper.emitted("select")).toBeUndefined();
	});
});
