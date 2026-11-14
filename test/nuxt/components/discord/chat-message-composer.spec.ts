import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import DiscordChatMessageComposer from "~/components/discord/chat-message-composer.vue";

function findSend(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	const send = wrapper.find("button[aria-label='Send message']");
	expect(send.exists()).toBe(true);
	return send;
}

describe("DiscordChatMessageComposer", () => {
	it("renders the composer group, the translated placeholder, and the apps control (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands" },
		});

		// ASSERT
		const root = wrapper.find("[role='group']");
		expect(root.attributes("aria-label")).toBe("Message composer for mod-commands");
		const input = wrapper.find("input");
		expect(input.attributes("aria-label")).toBe("Message #mod-commands");
		expect(input.attributes("placeholder")).toBe("Message #mod-commands");
		expect(wrapper.findAll(".discord-message-composer-action")).toHaveLength(5);
		expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(true);
		expect(findSend(wrapper).attributes("disabled")).toBeDefined();
	});

	it("enables send and emits submit when the composer has a value (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", modelValue: "hello" },
		});

		// ACT
		await findSend(wrapper).trigger("click");
		await wrapper.find("input").trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(findSend(wrapper).attributes("disabled")).toBeUndefined();
		expect(wrapper.emitted("submit")).toEqual([[], []]);
	});

	it("keeps send disabled and does not submit when the value is only whitespace (negative)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", modelValue: "   " },
		});

		// ACT
		await wrapper.find("input").trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(findSend(wrapper).attributes("disabled")).toBeDefined();
		expect(wrapper.emitted("submit")).toBeUndefined();
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
		const input = wrapper.find("input");

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
		wrapper.unmount();
	});

	it("does not set combobox ARIA when autocomplete is off (negative)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", autocomplete: false },
		});
		const input = wrapper.find("input");

		// ASSERT
		expect(input.attributes("role")).toBeUndefined();
		expect(input.attributes("aria-controls")).toBeUndefined();
		expect(input.attributes("aria-expanded")).toBeUndefined();
	});

	it("emits openApps from the apps control and keeps the decorative actions out of reach (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands" },
		});

		// ACT
		await wrapper.find("[aria-label='Open apps and commands']").trigger("click");

		// ASSERT
		expect(wrapper.emitted("openApps")).toHaveLength(1);
		const decorative = wrapper
			.findAll(".discord-message-composer-action")
			.filter((button) => button.attributes("aria-hidden") === "true");
		expect(decorative).toHaveLength(4);
		for (const button of decorative) expect(button.attributes("tabindex")).toBe("-1");
	});

	it("labels the apps control as close when appsOpen (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands", appsOpen: true },
		});

		// ASSERT
		expect(wrapper.find("[aria-label='Close apps and commands']").exists()).toBe(true);
		expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(false);
	});

	it("renders the value slot in place of the built-in input (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands", autocomplete: true },
			slots: { value: () => h("input", { "class": "custom-input", "aria-label": "Custom" }) },
			attachTo: document.body,
		});

		// ASSERT
		const visibleInputs = wrapper
			.findAll("input")
			.filter((input) => (input.element as HTMLElement).checkVisibility());
		expect(visibleInputs).toHaveLength(1);
		expect(visibleInputs[0]?.classes()).toContain("custom-input");
		// The hidden built-in input does not claim the combobox role.
		expect(wrapper.findAll("[role='combobox']")).toHaveLength(0);
		wrapper.unmount();
	});
});
