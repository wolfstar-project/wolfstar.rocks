import type { DOMWrapper } from "@vue/test-utils";
import type { StringSelectMenuOption } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import StringSelectMenu from "~/components/discord/v2/string-select-menu.vue";

const options: StringSelectMenuOption[] = [
	{ value: "permissions", label: "permissions", emoji: "📁" },
	{ value: "channels", label: "channels", emoji: "📁", disabled: true },
	{ value: "prefix", label: "prefix", emoji: "⚙️", description: "Command prefix" },
];

interface MountMenuProps {
	"disabled"?: boolean;
	"placeholder"?: string;
	"onSelect"?: (value: string) => void;
	"onUpdate:modelValue"?: (value: string | undefined) => void;
}

function mountMenu(props: MountMenuProps = {}) {
	return mountSuspended(StringSelectMenu, {
		props: { options, ...props },
		attachTo: document.body,
	});
}

/**
 * The menu's shortcuts are registered through `defineShortcuts`, which listens on the
 * window and is gated on the trigger being focused (or the menu already being open), so
 * keyboard tests have to focus the trigger the way a real Tab would.
 */
async function pressKey(trigger: DOMWrapper<Element>, key: string) {
	if (trigger.element instanceof HTMLElement) trigger.element.focus();
	await trigger.trigger("keydown", { key });
}

describe("DiscordV2StringSelectMenu", () => {
	it("renders the placeholder and stays collapsed initially", async () => {
		const wrapper = await mountMenu({ placeholder: "Choose an option..." });
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.text()).toContain("Choose an option...");
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(wrapper.find("[role='listbox']").isVisible()).toBe(false);
	});

	it("opens on click and exposes the listbox to assistive tech", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await trigger.trigger("click");

		expect(trigger.attributes("aria-expanded")).toBe("true");
		expect(wrapper.find("[role='listbox']").isVisible()).toBe(true);
		expect(wrapper.findAll("[role='option']")).toHaveLength(options.length);
		// The first selectable option is highlighted on open.
		expect(trigger.attributes("aria-activedescendant")).toBe(
			wrapper.findAll("[role='option']")[0]?.attributes("id"),
		);
	});

	it("opens with ArrowDown and skips disabled options while navigating", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, "ArrowDown");
		const optionIds = wrapper.findAll("[role='option']").map((o) => o.attributes("id"));
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[0]);

		// "channels" (index 1) is disabled, so ArrowDown lands on "prefix" (index 2).
		await pressKey(trigger, "ArrowDown");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[2]);

		// Wraps back around to the first selectable option.
		await pressKey(trigger, "ArrowDown");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[0]);

		// ArrowUp wraps backwards, again skipping the disabled option.
		await pressKey(trigger, "ArrowUp");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[2]);
	});

	it("jumps to the first and last selectable option with Home and End", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		const optionIds = wrapper.findAll("[role='option']").map((o) => o.attributes("id"));

		await pressKey(trigger, "End");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[2]);

		await pressKey(trigger, "Home");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[0]);
	});

	it("selects the active option with Enter, emits select and closes", async () => {
		const onSelect = vi.fn();
		const onUpdateModelValue = vi.fn();
		const wrapper = await mountMenu({
			onSelect,
			"onUpdate:modelValue": onUpdateModelValue,
		});
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, "ArrowDown");
		await pressKey(trigger, "ArrowDown");
		await pressKey(trigger, "Enter");

		expect(onSelect).toHaveBeenCalledWith("prefix");
		expect(onUpdateModelValue).toHaveBeenCalledWith("prefix");
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(trigger.text()).toContain("prefix");
	});

	it("opens and selects with Space", async () => {
		const onSelect = vi.fn();
		const wrapper = await mountMenu({ onSelect });
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, " ");
		expect(trigger.attributes("aria-expanded")).toBe("true");

		await pressKey(trigger, " ");
		expect(onSelect).toHaveBeenCalledWith("permissions");
		expect(trigger.attributes("aria-expanded")).toBe("false");
	});

	it("closes when focus leaves the menu, so Tab is not trapped", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		const outside = document.createElement("button");
		document.body.append(outside);

		await trigger.trigger("click");
		expect(trigger.attributes("aria-expanded")).toBe("true");

		await trigger.trigger("focusout", { relatedTarget: outside });

		expect(trigger.attributes("aria-expanded")).toBe("false");
		outside.remove();
	});

	it("selects an option on click and marks it as selected", async () => {
		const onSelect = vi.fn();
		const wrapper = await mountMenu({ onSelect });
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");

		await wrapper.findAll("[role='option']")[0]!.trigger("click");

		expect(onSelect).toHaveBeenCalledWith("permissions");
		await trigger.trigger("click");
		expect(wrapper.findAll("[role='option']")[0]!.attributes("aria-selected")).toBe("true");
	});

	it("ignores clicks on disabled options", async () => {
		const onSelect = vi.fn();
		const wrapper = await mountMenu({ onSelect });
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");

		const disabledOption = wrapper.findAll("[role='option']")[1]!;
		expect(disabledOption.attributes("aria-disabled")).toBe("true");

		await disabledOption.trigger("click");

		expect(onSelect).not.toHaveBeenCalled();
		expect(trigger.attributes("aria-expanded")).toBe("true");
	});

	it("closes on Escape and returns focus to the trigger", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await trigger.trigger("click");
		await pressKey(trigger, "Escape");

		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(trigger.element);
	});

	it("cannot be opened when disabled", async () => {
		const wrapper = await mountMenu({ disabled: true });
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.attributes("disabled")).toBeDefined();

		await trigger.trigger("click");
		await pressKey(trigger, "ArrowDown");

		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(wrapper.find("[role='listbox']").isVisible()).toBe(false);
	});

	it("renders Iconify twemoji names as SVG icons instead of literal text", async () => {
		const wrapper = await mountSuspended(StringSelectMenu, {
			props: {
				options: [{ value: "prefix", label: "prefix", emoji: "twemoji:gear" }],
			},
			attachTo: document.body,
		});
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");

		const option = wrapper.find("[role='option']");
		const emojiEl = option.find(".discord-v2-string-select-menu-option-emoji");
		expect(emojiEl.exists()).toBe(true);
		expect(option.text()).not.toContain("twemoji:gear");
		expect(emojiEl.text()).toBe("");
	});
});
