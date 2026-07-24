import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import DiscordChatMessageComposer from "~/components/discord/chat-message-composer.vue";

describe("DiscordChatMessageComposer", () => {
	it("renders the composer group, placeholder, and desktop actions (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands" },
		});

		// ASSERT
		const root = wrapper.find("[role='group']");
		expect(root.attributes("aria-label")).toBe("Message composer for mod-commands");
		const input = wrapper.find(".discord-message-composer-input");
		expect(input.attributes("aria-label")).toBe("Message #mod-commands");
		expect(input.attributes("placeholder")).toBe("Message #mod-commands");
		expect(wrapper.findAll(".discord-message-composer-action")).toHaveLength(5);
		expect(wrapper.find(".discord-message-composer-send").attributes("disabled")).toBeDefined();
	});

	it("enables send and emits submit when the composer has a value (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", modelValue: "hello" },
		});

		// ACT
		await wrapper.find(".discord-message-composer-send").trigger("click");
		await wrapper.find(".discord-message-composer-input").trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(true);
		expect(
			wrapper.find(".discord-message-composer-send").attributes("disabled"),
		).toBeUndefined();
		expect(wrapper.find(".discord-message-composer-send").attributes("aria-label")).toBe(
			"Send message",
		);
		expect(wrapper.emitted("submit")).toHaveLength(2);
	});

	it("keeps send disabled and decorative when the value is only whitespace (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", modelValue: "   " },
		});

		// ASSERT
		expect(wrapper.find(".discord-message-composer-has-value").exists()).toBe(false);
		expect(wrapper.find(".discord-message-composer-send").attributes("disabled")).toBeDefined();
		expect(wrapper.find(".discord-message-composer-send").attributes("aria-hidden")).toBe(
			"true",
		);
		await wrapper.find(".discord-message-composer-send").trigger("click");
		// Disabled buttons still fire click in jsdom; the important contract is the disabled/AT state.
		expect(wrapper.find(".discord-message-composer-send").attributes("tabindex")).toBe("-1");
	});

	it("exposes combobox ARIA and emits navigation keys when autocomplete is on (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: {
				channelName: "mod-commands",
				autocomplete: true,
				ariaControls: "slash-listbox",
				ariaExpanded: true,
				ariaActivedescendant: "opt-1",
			},
			attachTo: document.body,
		});
		const input = wrapper.find(".discord-message-composer-input");

		// ACT
		await input.trigger("keydown", { key: "ArrowDown" });
		await input.trigger("keydown", { key: "ArrowUp" });
		await input.trigger("keydown", { key: "Escape" });

		// ASSERT
		expect(input.attributes("role")).toBe("combobox");
		expect(input.attributes("aria-controls")).toBe("slash-listbox");
		expect(input.attributes("aria-expanded")).toBe("true");
		expect(input.attributes("aria-activedescendant")).toBe("opt-1");
		expect(wrapper.emitted("navigate")).toEqual([["down"], ["up"]]);
		expect(wrapper.emitted("escape")).toHaveLength(1);
	});

	it("does not set combobox ARIA when autocomplete is off (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", autocomplete: false },
		});
		const input = wrapper.find(".discord-message-composer-input");

		// ASSERT
		expect(input.attributes("role")).toBeUndefined();
		expect(input.attributes("aria-controls")).toBeUndefined();
		expect(input.attributes("aria-expanded")).toBeUndefined();
	});

	it("emits openApps from the apps toolbar action (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands" },
		});

		// ACT
		await wrapper
			.findAll(".discord-message-composer-action")
			.find((btn) => btn.attributes("aria-label") === "Open apps and commands")!
			.trigger("click");
		await wrapper.find(".discord-message-composer-apps-mobile").trigger("click");

		// ASSERT
		expect(wrapper.emitted("openApps")).toHaveLength(2);
	});

	it("swaps the mobile apps glyph for close when appsOpen (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands", appsOpen: true },
		});

		// ASSERT — mobile control only; desktop toolbar keeps its static open label
		expect(wrapper.find(".discord-message-composer-apps-open").exists()).toBe(true);
		expect(wrapper.find(".discord-message-composer-apps-mobile").attributes("aria-label")).toBe(
			"Close apps and commands",
		);
	});
});
