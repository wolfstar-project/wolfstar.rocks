import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
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

async function mount(props: { modelValue?: string; servers?: (typeof SERVER_EMOJI)[] } = {}) {
	const updates: string[] = [];
	const wrapper = await mountSuspended(EmojiPicker, {
		props: {
			"modelValue": props.modelValue ?? "",
			"servers": props.servers ?? [],
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
