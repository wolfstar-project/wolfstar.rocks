import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import EmojiPicker from "~/components/guild/appeals/EmojiPicker.vue";

const SERVER_EMOJI = { id: "123456789012345678", name: "wolf", animated: false };

const mounted: { unmount: () => void }[] = [];

function panel(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[aria-label="Emoji picker"]');
	if (!element) throw new Error("expected the emoji picker");
	return element;
}

function cell(label: string): HTMLButtonElement | null {
	return panel().querySelector<HTMLButtonElement>(`[data-cell][aria-label="${label}"]`);
}

async function mount(
	props: { modelValue?: string; servers?: (typeof SERVER_EMOJI)[]; serverName?: string } = {},
) {
	const updates: string[] = [];
	const wrapper = await mountSuspended(EmojiPicker, {
		props: {
			"modelValue": props.modelValue ?? "",
			"servers": props.servers ?? [],
			"serverName": props.serverName,
			"onUpdate:modelValue": (value: string) => updates.push(value),
		},
		attachTo: document.body,
	});
	mounted.push(wrapper);
	return { updates, wrapper };
}

async function open(wrapper: Awaited<ReturnType<typeof mount>>["wrapper"]) {
	await wrapper.get('button[aria-haspopup="dialog"]').trigger("click");
	await vi.waitFor(() => expect(cell("grinning face")).not.toBeNull(), { timeout: 20_000 });
}

async function search(text: string) {
	const input = panel().querySelector<HTMLInputElement>("input")!;
	input.value = text;
	input.dispatchEvent(new Event("input", { bubbles: true }));
	await nextTick();
}

// Accessibility audits for the picker live in test/nuxt/a11y.spec.ts.
describe("GuildAppealsEmojiPicker", () => {
	beforeEach(() => {
		localStorage.removeItem("wolfstar-emoji-recent");
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("opens on its search field and loads the emoji", async () => {
		const { wrapper } = await mount();
		await open(wrapper);

		expect(document.activeElement).toBe(panel().querySelector("input"));
		expect(panel().textContent).toContain("Smileys & Emotion");
	});

	it("picks an emoji and closes", async () => {
		const { updates, wrapper } = await mount();
		await open(wrapper);

		cell("grinning face")!.click();
		await vi.waitFor(() => expect(updates).toStrictEqual(["😀"]));
		await vi.waitFor(() =>
			expect(document.querySelector('[aria-label="Emoji picker"]')).toBeNull(),
		);
	});

	it("searches by name and by tag", async () => {
		const { wrapper } = await mount();
		await open(wrapper);

		await search("thumbs up");
		expect(cell("thumbs up")).not.toBeNull();
		expect(cell("grinning face")).toBeNull();

		await search("zzzz");
		expect(panel().textContent).toContain("No emoji found");
	});

	it("gives an emoji in the skin tone that was picked", async () => {
		const { updates, wrapper } = await mount();
		await open(wrapper);

		panel().querySelector<HTMLButtonElement>('[aria-label="Skin tone"]')!.click();
		await nextTick();
		panel().querySelector<HTMLButtonElement>('[role="radio"][aria-label="Medium"]')!.click();
		await nextTick();
		await search("thumbs up");

		cell("thumbs up")!.click();
		await vi.waitFor(() => expect(updates).toStrictEqual(["👍🏽"]));
	});

	it("offers the emoji of the server first, and stores them as Discord writes them", async () => {
		const { updates, wrapper } = await mount({ servers: [SERVER_EMOJI] });
		await open(wrapper);

		const first = panel().querySelector<HTMLButtonElement>("[data-cell]");
		expect(first?.getAttribute("aria-label")).toBe(":wolf:");
		expect(first?.querySelector("img")?.getAttribute("src")).toContain(SERVER_EMOJI.id);

		first!.click();
		await vi.waitFor(() => expect(updates).toStrictEqual(["<:wolf:123456789012345678>"]));
	});

	it("draws the emoji as Twemoji, not as the characters of the system's font", async () => {
		const { wrapper } = await mount();
		await open(wrapper);

		// The test setup keeps the address on `data-src`, see test/nuxt/setup.ts.
		const image = cell("grinning face")!.querySelector("img");
		expect(image?.dataset.src).toBe(
			"https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/1f600.svg",
		);
		expect(cell("grinning face")!.textContent?.trim()).toBe("");
	});

	it("titles the emoji of the server with its name, and says where an emoji is from", async () => {
		const { wrapper } = await mount({ servers: [SERVER_EMOJI], serverName: "WolfStar HQ" });
		await open(wrapper);

		expect(panel().querySelector('[data-category="server"]')?.textContent).toContain(
			"WolfStar HQ",
		);

		cell(":wolf:")!.dispatchEvent(new MouseEvent("mouseenter"));
		await nextTick();
		const footer = panel().querySelector(".emoji-footer")!;
		expect(footer.textContent).toContain(":wolf:");
		expect(footer.textContent).toContain("From WolfStar HQ");

		cell("grinning face")!.dispatchEvent(new MouseEvent("mouseenter"));
		await nextTick();
		expect(footer.textContent).toContain(":grinning_face:");
		expect(footer.textContent).toContain("Smileys & Emotion");
	});

	it("folds a section away and opens it again", async () => {
		const { wrapper } = await mount({ servers: [SERVER_EMOJI], serverName: "WolfStar HQ" });
		await open(wrapper);

		const toggle = panel().querySelector<HTMLButtonElement>(
			'[data-category="server"] .emoji-title-button',
		)!;
		expect(toggle.getAttribute("aria-expanded")).toBe("true");

		toggle.click();
		await nextTick();
		expect(toggle.getAttribute("aria-expanded")).toBe("false");
		expect(cell(":wolf:")).toBeNull();

		toggle.click();
		await nextTick();
		expect(cell(":wolf:")).not.toBeNull();
	});

	it("lists what was picked last, first, the next time it opens", async () => {
		const { updates, wrapper } = await mount({ servers: [SERVER_EMOJI] });
		await open(wrapper);
		expect(panel().querySelector('[data-category="recent"]')).toBeNull();

		cell("thumbs up")!.click();
		await vi.waitFor(() => expect(updates).toStrictEqual(["👍"]));

		await wrapper.get('button[aria-haspopup="dialog"]').trigger("click");
		await vi.waitFor(() => expect(cell("thumbs up")).not.toBeNull());
		const recent = panel().querySelector('[data-category="recent"]')!;
		expect(recent.textContent).toContain("Frequently used");
		expect(recent.querySelector("[data-cell]")?.getAttribute("aria-label")).toBe("thumbs up");
	});

	it("shows an emoji it cannot load as the character", async () => {
		const { wrapper } = await mount();
		await open(wrapper);

		const image = cell("grinning face")!.querySelector("img")!;
		image.dispatchEvent(new Event("error"));
		await nextTick();

		expect(cell("grinning face")!.querySelector("img")).toBeNull();
		expect(cell("grinning face")!.textContent).toContain("😀");
		// The character fills the box of the image, whatever font size the button has.
		const character = cell("grinning face")!.querySelector<HTMLElement>(".twemoji-char")!;
		expect(Number.parseFloat(getComputedStyle(character).fontSize)).toBeGreaterThan(20);
	});

	it("marks the first section in the rail until the grid is scrolled", async () => {
		localStorage.setItem("wolfstar-emoji-recent", JSON.stringify(["👍"]));
		const { wrapper } = await mount({ servers: [SERVER_EMOJI] });
		await open(wrapper);

		const marked = panel().querySelector('.emoji-rail [aria-current="true"]');
		expect(marked?.getAttribute("aria-label")).toBe("Frequently used");
	});

	it("opens when the browser holds something else under the key of the last used", async () => {
		localStorage.setItem("wolfstar-emoji-recent", JSON.stringify("not a list"));
		const { wrapper } = await mount();
		await open(wrapper);

		expect(panel().querySelector('[data-category="recent"]')).toBeNull();
	});

	it("marks the icon the form has, and takes it away", async () => {
		const { updates, wrapper } = await mount({ modelValue: "😀" });
		await open(wrapper);

		expect(cell("grinning face")!.getAttribute("aria-pressed")).toBe("true");
		expect(cell("thumbs up")!.getAttribute("aria-pressed")).toBe("false");

		await wrapper.get('button[aria-label="Remove the icon"]').trigger("click");
		expect(updates).toStrictEqual([""]);
	});

	it("moves among the emoji with the arrow keys", async () => {
		const { wrapper } = await mount();
		await open(wrapper);

		const input = panel().querySelector<HTMLInputElement>("input")!;
		input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
		await nextTick();
		const first = panel().querySelector<HTMLElement>("[data-cell]")!;
		expect(document.activeElement).toBe(first);

		first.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
		await nextTick();
		expect(document.activeElement).toBe(
			panel().querySelectorAll<HTMLElement>("[data-cell]")[1],
		);
	});
});
