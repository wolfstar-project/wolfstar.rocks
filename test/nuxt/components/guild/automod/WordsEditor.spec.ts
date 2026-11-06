import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import WordsEditor from "~/components/guild/automod/WordsEditor.vue";

async function mountEditor(words: string[]) {
	const updates: string[][] = [];
	const wrapper = await mountSuspended(WordsEditor, {
		props: {
			"modelValue": words,
			"onUpdate:modelValue": (value: string[]) => {
				updates.push(value);
				void wrapper.setProps({ modelValue: value });
			},
		},
	});
	return { wrapper, updates };
}

function wordInput(wrapper: Awaited<ReturnType<typeof mountEditor>>["wrapper"]) {
	return wrapper.find('input[placeholder="for example: idiot"]');
}

async function submitWord(wrapper: Awaited<ReturnType<typeof mountEditor>>["wrapper"]) {
	const add = wrapper
		.findAll("button")
		.find((button) => ["Add word", "Save word"].includes(button.text()));
	await add!.trigger("click");
}

// Accessibility audits for GuildAutomodWordsEditor live in test/nuxt/a11y.spec.ts.
describe("GuildAutomodWordsEditor", () => {
	it("adds a word as the server saves it", async () => {
		const { wrapper, updates } = await mountEditor([]);

		await wordInput(wrapper).setValue("Bad");
		await submitWord(wrapper);

		expect(updates.at(-1)).toStrictEqual(["bad"]);
		expect(wrapper.text()).toContain("Words (1/200)");
	});

	it("saves the mode picked in plain words as its wildcards", async () => {
		const { wrapper, updates } = await mountEditor([]);

		await wordInput(wrapper).setValue("parola");
		await wrapper.findAll('[role="radio"]')[1]!.trigger("click");
		await submitWord(wrapper);

		expect(updates.at(-1)).toStrictEqual(["parola*"]);
	});

	it("refuses a word of one letter and says why", async () => {
		const { wrapper, updates } = await mountEditor([]);

		await wordInput(wrapper).setValue("a");
		await submitWord(wrapper);

		expect(updates).toHaveLength(0);
		expect(wrapper.text()).toContain("Use at least 2 characters.");
	});

	it("keeps a * typed at an edge to the mode choice", async () => {
		const { wrapper, updates } = await mountEditor([]);

		await wordInput(wrapper).setValue("bad*");
		await submitWord(wrapper);

		expect(updates).toHaveLength(0);
		expect(wrapper.text()).toContain("Leave out the * here");
	});

	it("removes a word", async () => {
		const { wrapper, updates } = await mountEditor(["bad", "evil"]);

		await wrapper.find('button[aria-label="Remove “bad”"]').trigger("click");

		expect(updates.at(-1)).toStrictEqual(["evil"]);
	});

	it("edits a word in place", async () => {
		const { wrapper, updates } = await mountEditor(["bad", "evil"]);

		await wrapper.find('button[aria-label="Edit “bad”"]').trigger("click");
		expect((wordInput(wrapper).element as HTMLInputElement).value).toBe("bad");
		await wordInput(wrapper).setValue("worse");
		await submitWord(wrapper);

		expect(updates.at(-1)).toStrictEqual(["worse", "evil"]);
	});

	it("warns about a word another one already catches", async () => {
		const { wrapper } = await mountEditor(["bad", "*bad*"]);

		await vi.waitFor(() => expect(wrapper.text()).toContain("Already caught by “*bad*”"), {
			timeout: 5000,
		});
	});

	it("says when the search finds nothing", async () => {
		const { wrapper } = await mountEditor(["bad"]);

		await wrapper.find('input[type="search"]').setValue("zzz");

		expect(wrapper.text()).toContain("No word matches “zzz”.");
	});

	it("shows the empty list", async () => {
		const { wrapper } = await mountEditor([]);

		expect(wrapper.text()).toContain("No words yet.");
	});

	it("imports one word per line and lists what it skipped", async () => {
		const { wrapper, updates } = await mountEditor(["bad"]);

		const open = wrapper.findAll("button").find((button) => button.text() === "Import words");
		await open!.trigger("click");
		await wrapper.find("textarea.font-mono, .words-import textarea").setValue("evil\nbad\nx");
		const confirm = wrapper
			.findAll("button")
			.find((button) => button.text() === "Import these words");
		await confirm!.trigger("click");

		expect(updates.at(-1)).toStrictEqual(["bad", "evil"]);
		expect(wrapper.text()).toContain("Added 1. Skipped 2.");
	});

	it("marks what a test message would have caught", async () => {
		const { wrapper } = await mountEditor(["bad"]);

		await wrapper
			.find('textarea[placeholder="Type a message to see what the filter catches"]')
			.setValue("so b.a.d, not badge");

		await vi.waitFor(() => expect(wrapper.find("mark").exists()).toBe(true), { timeout: 5000 });
		expect(wrapper.findAll("mark").map((mark) => mark.text())).toStrictEqual(["b.a.d"]);
		expect(wrapper.text()).toContain("Caught: b.a.d");
	});
});
