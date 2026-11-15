import type { MessageComposerInputProps } from "~/components/ui/message-composer";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterAll, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { h, nextTick } from "vue";
import DiscordChatMessageComposer from "~/components/discord/chat-message-composer.vue";

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>;

function findSend(wrapper: Wrapper) {
	return wrapper.find("button[aria-label='Send message']");
}

/** Whether `first` comes before `second` in the document. */
function precedes(first: Element, second: Element) {
	return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

describe("DiscordChatMessageComposer", () => {
	it("renders the translated group, field and send names, and no add button (positive)", async () => {
		// ARRANGE / ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "mod-commands", layout: "default" },
		});

		// ASSERT
		const root = wrapper.find("[role='group']");
		expect(root.attributes("aria-label")).toBe("Message composer for mod-commands");
		const input = wrapper.find("input");
		expect(input.attributes("aria-label")).toBe("Message #mod-commands");
		expect(input.attributes("placeholder")).toBe("Message #mod-commands");
		expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(true);
		expect(findSend(wrapper).attributes("disabled")).toBeDefined();
		// The showcase attaches nothing, so no control offers to.
		expect(wrapper.find("[aria-label='Add attachment']").exists()).toBe(false);
	});

	it("names the bar, the field and send in the reader's language (positive)", async () => {
		// ARRANGE
		useNuxtApp().$mergeTranslations({
			discord: {
				composer: {
					label: "Casella di scrittura per {channel}",
					placeholder: "Messaggio in #{channel}",
					send: "Invia messaggio",
				},
			},
		});

		// ACT
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "generale", layout: "default" },
		});

		// ASSERT
		expect(wrapper.find("[role='group']").attributes("aria-label")).toBe(
			"Casella di scrittura per generale",
		);
		expect(wrapper.find("input").attributes("aria-label")).toBe("Messaggio in #generale");
		expect(wrapper.find("button[aria-label='Invia messaggio']").exists()).toBe(true);
	});

	it("enables send and emits submit when the composer has a value (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: { channelName: "general", modelValue: "hello", layout: "default" },
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
			props: { channelName: "general", modelValue: "   ", layout: "default" },
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
			props: { channelName: "mod-commands", layout: "default" },
		});

		// ACT
		await wrapper.find("[aria-label='Open apps and commands']").trigger("click");

		// ASSERT
		expect(wrapper.emitted("openApps")).toHaveLength(1);
		const buttons = wrapper.findAll("button");
		const decorative = buttons.filter((button) => button.attributes("aria-hidden") === "true");
		// The add mark, then gift, GIF, sticker and emoji.
		expect(decorative).toHaveLength(5);
		for (const button of decorative) expect(button.attributes("tabindex")).toBe("-1");
		// Only the apps control and the send button are reachable.
		expect(
			buttons.filter((button) => button.attributes("aria-hidden") !== "true"),
		).toHaveLength(2);
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

	it("renders the input slot in place of the built-in input, with the composer's keys and names (positive)", async () => {
		// ARRANGE
		const wrapper = await mountSuspended(DiscordChatMessageComposer, {
			props: {
				channelName: "mod-commands",
				modelValue: "/warn",
				autocomplete: true,
				ariaControls: "slash-listbox",
			},
			slots: {
				input: ({ inputProps }: MessageComposerInputProps) =>
					h("input", { ...inputProps, class: "custom-input" }),
			},
		});
		const inputs = wrapper.findAll("input");

		// ACT
		await inputs[0]!.trigger("keydown", { key: "Enter" });

		// ASSERT
		expect(inputs).toHaveLength(1);
		expect(inputs[0]?.classes()).toContain("custom-input");
		expect(inputs[0]?.attributes("role")).toBe("combobox");
		expect(inputs[0]?.attributes("aria-controls")).toBe("slash-listbox");
		expect(inputs[0]?.attributes("aria-label")).toBe("Message #mod-commands");
		expect(wrapper.emitted("submit")).toEqual([[]]);
	});

	describe("narrow layout", () => {
		it("puts the apps control before the field and a microphone in place of send while empty (positive)", async () => {
			// ARRANGE / ACT
			const wrapper = await mountSuspended(DiscordChatMessageComposer, {
				props: { channelName: "general", layout: "narrow" },
			});

			// ASSERT
			const apps = wrapper.find("[aria-label='Open apps and commands']");
			expect(precedes(apps.element, wrapper.find("input").element)).toBe(true);
			expect(findSend(wrapper).exists()).toBe(false);
			// The add mark, gift and microphone beside the field, the emoji inside it.
			const decorative = wrapper
				.findAll("button")
				.filter((button) => button.attributes("aria-hidden") === "true");
			expect(decorative).toHaveLength(4);
		});

		it("folds the apps control away and shows send once there is text (negative)", async () => {
			// ARRANGE
			const wrapper = await mountSuspended(DiscordChatMessageComposer, {
				props: { channelName: "general", layout: "narrow", modelValue: "hi" },
			});

			// ACT
			await findSend(wrapper).trigger("click");

			// ASSERT
			expect(wrapper.find("[aria-label='Open apps and commands']").exists()).toBe(false);
			expect(findSend(wrapper).attributes("disabled")).toBeUndefined();
			expect(wrapper.emitted("submit")).toEqual([[]]);
		});

		it("keeps the close control while the apps are open, even with text (positive)", async () => {
			// ARRANGE / ACT
			const wrapper = await mountSuspended(DiscordChatMessageComposer, {
				props: {
					channelName: "general",
					layout: "narrow",
					modelValue: "hi",
					appsOpen: true,
				},
			});

			// ASSERT
			const close = wrapper.find("[aria-label='Close apps and commands']");
			expect(close.exists()).toBe(true);
			expect(precedes(close.element, wrapper.find("input").element)).toBe(true);
		});
	});

	describe("without a layout", () => {
		afterAll(async () => {
			await page.viewport(414, 896);
		});

		it("switches to the narrow bar on a phone (positive)", async () => {
			// ARRANGE
			await page.viewport(390, 844);

			// ACT
			const wrapper = await mountSuspended(DiscordChatMessageComposer, {
				props: { channelName: "general" },
			});
			await nextTick();

			// ASSERT
			expect(findSend(wrapper).exists()).toBe(false);
			const apps = wrapper.find("[aria-label='Open apps and commands']");
			expect(precedes(apps.element, wrapper.find("input").element)).toBe(true);
		});

		it("keeps the default bar on a wide screen (negative)", async () => {
			// ARRANGE
			await page.viewport(1280, 900);

			// ACT
			const wrapper = await mountSuspended(DiscordChatMessageComposer, {
				props: { channelName: "general" },
			});
			await nextTick();

			// ASSERT
			expect(findSend(wrapper).attributes("disabled")).toBeDefined();
			const apps = wrapper.find("[aria-label='Open apps and commands']");
			expect(precedes(wrapper.find("input").element, apps.element)).toBe(true);
		});
	});
});
