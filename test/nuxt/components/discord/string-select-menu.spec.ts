import type { DOMWrapper } from "@vue/test-utils";
import type { StringSelectMenuOption } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { DOMWrapper as VtDOMWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import StringSelectMenu from "~/components/discord/string-select-menu.vue";

const options: StringSelectMenuOption[] = [
	{
		value: "permissions",
		label: "Root / Permissions",
		emoji: "ph:folder-fill",
		description: "Currently at: Root / Permissions",
	},
	{
		value: "channels",
		label: "Root / Channels",
		emoji: "ph:folder-fill",
		description: "Currently at: Root / Channels",
		disabled: true,
	},
	{
		value: "prefix",
		label: "Root / Prefix",
		emoji: "ph:gear-six-fill",
		description: "Currently at: Root / Prefix",
	},
];

// mountSuspended wrappers aren't auto-unmounted, so their window-level side effects
// (defineShortcuts keydown, the capture-phase scroll listener, onClickOutside) and any
// open Teleport panel would otherwise leak into later tests and crash Vue on the next
// patch. Track every wrapper and unmount it before clearing any leftover DOM.
const mountedWrappers: { unmount: () => void }[] = [];

afterEach(() => {
	while (mountedWrappers.length) mountedWrappers.pop()?.unmount();
	// Teleported panels outlive the wrapper unless unmounted — clear any stragglers.
	document.querySelectorAll(".discord-string-select-menu-panel").forEach((el) => el.remove());
	document.querySelectorAll(".discord-string-select-menu").forEach((el) => el.remove());
});

async function mountMenu(props: Partial<{ disabled: boolean; placeholder: string }> = {}) {
	const wrapper = await mountSuspended(StringSelectMenu, {
		props: { options, ...props },
		attachTo: document.body,
	});
	mountedWrappers.push(wrapper);
	return wrapper;
}

/** Listbox is Teleported to `body`, so query the document rather than the wrapper tree. */
function findListbox() {
	const el = document.querySelector<HTMLElement>("[role='listbox']");
	expect(el).not.toBeNull();
	return new VtDOMWrapper(el!);
}

function findOptions() {
	return Array.from(
		document.querySelectorAll<HTMLElement>("[role='option']"),
		(el) => new VtDOMWrapper(el),
	);
}

function findPanel() {
	const el = document.querySelector<HTMLElement>(".discord-string-select-menu-panel");
	expect(el).not.toBeNull();
	return new VtDOMWrapper(el!);
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

describe("DiscordStringSelectMenu", () => {
	it("renders the placeholder and stays collapsed initially", async () => {
		const wrapper = await mountMenu({ placeholder: "Choose an option..." });
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.text()).toContain("Choose an option...");
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(document.querySelector("[role='listbox']")).toBeNull();
	});

	it("opens on click and exposes the listbox to assistive tech", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await trigger.trigger("click");
		await nextTick();

		expect(trigger.attributes("aria-expanded")).toBe("true");
		const listbox = findListbox();
		expect(listbox.isVisible()).toBe(true);
		expect(findOptions()).toHaveLength(options.length);
		// The first selectable option is highlighted on open.
		expect(trigger.attributes("aria-activedescendant")).toBe(
			findOptions()[0]?.attributes("id"),
		);
	});

	it("opens the listbox above the trigger by default (Discord near-composer behavior)", async () => {
		const wrapper = await mountMenu();
		// Seat the trigger low in the viewport like Discord's near-composer action row,
		// so there is room above it; flush against the top there is only room below.
		(wrapper.element as HTMLElement).style.marginTop = "400px";
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		await nextTick();

		const panel = findPanel();
		expect(panel.attributes("data-placement")).toBe("above");
		expect(panel.classes()).toContain("discord-string-select-menu-panel-above");
		expect((panel.element as HTMLElement).style.position).toBe("fixed");
		expect((panel.element as HTMLElement).style.bottom).not.toBe("auto");
	});

	it("opens with ArrowDown and skips disabled options while navigating", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, "ArrowDown");
		await nextTick();
		const optionIds = findOptions().map((o) => o.attributes("id"));
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
		await nextTick();
		const optionIds = findOptions().map((o) => o.attributes("id"));

		await pressKey(trigger, "End");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[2]);

		await pressKey(trigger, "Home");
		expect(trigger.attributes("aria-activedescendant")).toBe(optionIds[0]);
	});

	it("selects the active option with Enter, emits select and closes", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, "ArrowDown");
		await nextTick();
		await pressKey(trigger, "ArrowDown");
		await pressKey(trigger, "Enter");

		expect(wrapper.emitted("select")).toEqual([["prefix"]]);
		expect(wrapper.emitted("update:modelValue")).toEqual([["prefix"]]);
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(trigger.text()).toContain("Root / Prefix");
	});

	it("opens and selects with Space", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await pressKey(trigger, " ");
		await nextTick();
		expect(trigger.attributes("aria-expanded")).toBe("true");

		await pressKey(trigger, " ");
		expect(wrapper.emitted("select")).toEqual([["permissions"]]);
		expect(trigger.attributes("aria-expanded")).toBe("false");
	});

	it("renders Currently at rows with a path folder icon", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		await nextTick();

		const option = findOptions()[0]!;
		expect(option.text()).toContain("Root / Permissions");
		expect(option.text()).toContain("Currently at:");
		expect(option.find(".discord-string-select-menu-option-path-folder").exists()).toBe(true);
		expect(option.find(".discord-string-select-menu-option-check").exists()).toBe(false);
	});

	it("closes when focus leaves the menu, so Tab is not trapped", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		const outside = document.createElement("button");
		document.body.append(outside);

		await trigger.trigger("click");
		await nextTick();
		expect(trigger.attributes("aria-expanded")).toBe("true");

		await trigger.trigger("focusout", { relatedTarget: outside });

		expect(trigger.attributes("aria-expanded")).toBe("false");
		outside.remove();
	});

	it("selects an option on click and marks it as selected", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		await nextTick();

		await findOptions()[0]!.trigger("click");

		expect(wrapper.emitted("select")).toEqual([["permissions"]]);
		await trigger.trigger("click");
		await nextTick();
		expect(findOptions()[0]!.attributes("aria-selected")).toBe("true");
	});

	it("ignores clicks on disabled options", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		await nextTick();

		const disabledOption = findOptions()[1]!;
		expect(disabledOption.attributes("aria-disabled")).toBe("true");

		await disabledOption.trigger("click");

		expect(wrapper.emitted("select")).toBeUndefined();
		expect(trigger.attributes("aria-expanded")).toBe("true");
	});

	it("closes on Escape and returns focus to the trigger", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		await trigger.trigger("click");
		await nextTick();
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
		expect(document.querySelector("[role='listbox']")).toBeNull();
	});

	it("renders Iconify twemoji names as SVG icons instead of literal text", async () => {
		const wrapper = await mountSuspended(StringSelectMenu, {
			props: {
				options: [{ value: "prefix", label: "prefix", emoji: "twemoji:gear" }],
			},
			attachTo: document.body,
		});
		mountedWrappers.push(wrapper);
		const trigger = wrapper.find("button[role='combobox']");
		await trigger.trigger("click");
		await nextTick();

		const option = findOptions()[0]!;
		const emojiEl = option.find(".discord-string-select-menu-option-emoji");
		expect(emojiEl.exists()).toBe(true);
		expect(option.text()).not.toContain("twemoji:gear");
		expect(emojiEl.text()).toBe("");
	});
});
