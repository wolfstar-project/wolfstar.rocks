import type { StringSelectMenuOption } from "~/types/discord";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { DOMWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
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

// mountSuspended wrappers are not unmounted for us, and the open panel is portalled
// to `body`: unmount every wrapper so no panel or listener leaks into the next test.
const mountedWrappers: { unmount: () => void }[] = [];

afterEach(() => {
	while (mountedWrappers.length) mountedWrappers.pop()?.unmount();
});

type MenuProps = Partial<{
	options: StringSelectMenuOption[];
	disabled: boolean;
	placeholder: string;
	ariaLabel: string;
}>;

async function mountMenu(props: MenuProps = {}) {
	const wrapper = await mountSuspended(StringSelectMenu, {
		props: { options, ...props },
		attachTo: document.body,
	});
	mountedWrappers.push(wrapper);
	return wrapper;
}

/** The menu below 24rem of room, as under a message close to the composer. */
async function mountMenuWithRoomAbove() {
	const wrapper = await mountSuspended(
		{
			components: { StringSelectMenu },
			setup: () => ({ options }),
			template: `<div style="padding-top: 24rem"><StringSelectMenu :options="options" /></div>`,
		},
		{ attachTo: document.body },
	);
	mountedWrappers.push(wrapper);
	return wrapper;
}

function findPanel() {
	return document.querySelector<HTMLElement>("[data-slot='select-menu-content']");
}

/** The panel is portalled to `body`, so query the document rather than the wrapper tree. */
function findListbox() {
	return document.querySelector<HTMLElement>("[role='listbox']");
}

function findOptions() {
	return Array.from(
		document.querySelectorAll<HTMLElement>("[role='option']"),
		(element) => new DOMWrapper(element),
	);
}

/** Wait for the portal, the popper and the focus move that follow an open or a pick. */
async function settle() {
	await nextTick();
	await new Promise((resolve) => requestAnimationFrame(resolve));
	await nextTick();
}

async function openWithKeyboard(trigger: DOMWrapper<Element>, key = "Enter") {
	(trigger.element as HTMLElement).focus();
	await trigger.trigger("keydown", { key });
	await settle();
}

describe("DiscordStringSelectMenu", () => {
	it("renders the placeholder and stays collapsed initially", async () => {
		const wrapper = await mountMenu({ placeholder: "Choose an option..." });
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.text()).toContain("Choose an option...");
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(findListbox()).toBeNull();
	});

	it("falls back to the translated placeholder and accessible name", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.text()).toContain("Make a selection");
		expect(trigger.attributes("aria-label")).toBe("Select an option");
	});

	it("opens from the keyboard and exposes a labelled listbox", async () => {
		const wrapper = await mountMenu({ ariaLabel: "Configuration category" });
		const trigger = wrapper.find("button[role='combobox']");

		await openWithKeyboard(trigger);

		expect(trigger.attributes("aria-expanded")).toBe("true");
		expect(findListbox()?.getAttribute("aria-label")).toBe("Configuration category");
		expect(findOptions()).toHaveLength(options.length);
	});

	it("opens on a plain left pointer press", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");

		trigger.element.dispatchEvent(
			new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }),
		);
		await settle();

		expect(trigger.attributes("aria-expanded")).toBe("true");
		expect(findListbox()).not.toBeNull();
	});

	it("draws each emoji as a glyph, not as its Iconify name", async () => {
		const wrapper = await mountMenu();
		await openWithKeyboard(wrapper.find("button[role='combobox']"));

		const option = findOptions()[0]!;
		expect(option.text()).toContain("Root / Permissions");
		expect(option.text()).toContain("Currently at: Root / Permissions");
		expect(option.text()).not.toContain("ph:folder-fill");
		expect(option.find("[aria-hidden='true'] > *").exists()).toBe(true);
	});

	it("draws a Unicode emoji in the row and on the trigger once chosen", async () => {
		const wrapper = await mountMenu({
			options: [{ value: "news", label: "Announcements", emoji: "📣" }],
		});
		const trigger = wrapper.find("button[role='combobox']");
		await openWithKeyboard(trigger);

		expect(findOptions()[0]!.text()).toContain("📣");

		await findOptions()[0]!.trigger("keydown", { key: "Enter" });
		await settle();

		expect(trigger.text()).toContain("📣");
		expect(trigger.text()).toContain("Announcements");
	});

	it("is 40px high, as a select under a message is", async () => {
		const wrapper = await mountMenu();

		expect(wrapper.find("button[role='combobox']").element.getBoundingClientRect().height).toBe(
			40,
		);
	});

	it("opens above the trigger when there is room above", async () => {
		const wrapper = await mountMenuWithRoomAbove();
		const trigger = wrapper.find("button[role='combobox']");
		await openWithKeyboard(trigger);

		const panel = findPanel();
		expect(panel?.getAttribute("data-side")).toBe("top");
		expect(panel!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
			trigger.element.getBoundingClientRect().top,
		);
	});

	it("marks a disabled option and keeps it out of selection", async () => {
		const wrapper = await mountMenu();
		await openWithKeyboard(wrapper.find("button[role='combobox']"));

		const disabled = findOptions()[1]!;
		expect(disabled.attributes("aria-disabled")).toBe("true");

		await disabled.trigger("keydown", { key: "Enter" });
		await settle();

		expect(wrapper.emitted("select")).toBeUndefined();
	});

	it("selects an option with Enter, emits select and the model, and closes", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await openWithKeyboard(trigger);

		await findOptions()[2]!.trigger("keydown", { key: "Enter" });
		await settle();

		expect(wrapper.emitted("select")).toEqual([["prefix"]]);
		expect(wrapper.emitted("update:modelValue")).toEqual([["prefix"]]);
		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(trigger.text()).toContain("Root / Prefix");
	});

	it("marks the bound value as selected when reopened", async () => {
		const wrapper = await mountMenu();
		await wrapper.setProps({ modelValue: "permissions" });
		await openWithKeyboard(wrapper.find("button[role='combobox']"));

		expect(findOptions()[0]!.attributes("aria-selected")).toBe("true");
		expect(findOptions()[2]!.attributes("aria-selected")).toBe("false");
	});

	it("closes on Escape and returns focus to the trigger", async () => {
		const wrapper = await mountMenu();
		const trigger = wrapper.find("button[role='combobox']");
		await openWithKeyboard(trigger);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
		await settle();

		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(trigger.element);
	});

	it("cannot be opened when disabled", async () => {
		const wrapper = await mountMenu({ disabled: true });
		const trigger = wrapper.find("button[role='combobox']");

		expect(trigger.attributes("disabled")).toBeDefined();

		await openWithKeyboard(trigger, "ArrowDown");

		expect(trigger.attributes("aria-expanded")).toBe("false");
		expect(findListbox()).toBeNull();
	});
});
