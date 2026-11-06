import type { AppealForm, AppealQuestion } from "#shared/utils/appeal-forms";
import { getDefaultAppealForm } from "#shared/utils/appeal-forms";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import FormEditor from "~/components/guild/appeals/FormEditor.vue";
import { createMockOauthFlattenedGuild, createMockRole } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";
const STAFF = "300000000000000001";

const guild = createMockOauthFlattenedGuild({
	id: GUILD_ID,
	roles: [createMockRole({ id: STAFF, name: "Staff" })],
});

// The dialog is teleported to the body: a wrapper left mounted keeps it there.
const mounted: { unmount: () => void }[] = [];

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the editor's dialog");
	return element;
}

function button(text: string): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find(
		(element) => element.textContent?.trim() === text,
	);
	if (!found) throw new Error(`expected a "${text}" button`);
	return found;
}

function input(label: string): HTMLInputElement {
	const found = [...dialog().querySelectorAll<HTMLInputElement>("input")].find((element) => {
		const id = element.getAttribute("id");
		const forLabel = id ? dialog().querySelector(`label[for="${id}"]`) : null;
		return forLabel?.textContent?.trim().startsWith(label) ?? false;
	});
	if (!found) throw new Error(`expected an input labelled "${label}"`);
	return found;
}

function switchOf(label: string): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLLabelElement>("label")].find(
		(element) => element.textContent?.trim() === label,
	);
	const control = found?.htmlFor ? document.getElementById(found.htmlFor) : null;
	if (!(control instanceof HTMLButtonElement))
		throw new Error(`expected a switch labelled "${label}"`);
	return control;
}

async function type(element: HTMLInputElement, value: string) {
	element.value = value;
	element.dispatchEvent(new Event("input", { bubbles: true }));
	await nextTick();
}

async function mount(form: AppealForm | null = null) {
	const wrapper = await mountSuspended(FormEditor, {
		props: { open: true, form, guild },
		attachTo: document.body,
	});
	mounted.push(wrapper);
	await vi.waitFor(() => expect(dialog().querySelector("form")).not.toBeNull());
	return wrapper;
}

function lastSaved(wrapper: Awaited<ReturnType<typeof mount>>) {
	const saves = wrapper.emitted("save") ?? [];
	return saves.at(-1)?.[0] as Record<string, unknown> | undefined;
}

// Accessibility audits for GuildAppealsFormEditor live in test/nuxt/a11y.spec.ts.
describe("GuildAppealsFormEditor", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("opens a new form with one text question", async () => {
		await mount();

		expect(dialog().textContent).toContain("New form");
		expect(dialog().querySelectorAll("li.question-card")).toHaveLength(1);
		expect(dialog().textContent).toContain("Question 1");
		expect(dialog().textContent).toContain("Text");
	});

	// The dialog opens on its first field, not on the close button that comes first.
	it("opens on the name field", async () => {
		await mount();

		await vi.waitFor(() => expect(document.activeElement).toBe(input("Name")));
	});

	it("takes the kinds of case with switches, none picked meaning every kind", async () => {
		const wrapper = await mount();
		await type(input("Name"), "Ban appeal");
		await type(input("Label"), "Why?");

		expect(switchOf("Bans").getAttribute("aria-checked")).toBe("false");

		button("Create form").click();
		await vi.waitFor(() => expect(wrapper.emitted("save")).toBeDefined());
		expect(lastSaved(wrapper)!.types).toStrictEqual([]);

		switchOf("Bans").click();
		switchOf("Timeouts").click();
		await nextTick();
		expect(switchOf("Bans").getAttribute("aria-checked")).toBe("true");
		expect(switchOf("Mutes").getAttribute("aria-checked")).toBe("false");

		button("Create form").click();
		await vi.waitFor(() => expect(wrapper.emitted("save")).toHaveLength(2));
		expect(lastSaved(wrapper)!.types).toStrictEqual([0, 15]);

		switchOf("Bans").click();
		await nextTick();
		button("Create form").click();
		await vi.waitFor(() => expect(wrapper.emitted("save")).toHaveLength(3));
		expect(lastSaved(wrapper)!.types).toStrictEqual([15]);
	});

	it("refuses to create a form without a name, and says so", async () => {
		const wrapper = await mount();

		button("Create form").click();
		await nextTick();

		expect(wrapper.emitted("save")).toBeUndefined();
		expect(dialog().textContent).toContain("Give the form a name.");
	});

	it("saves the form with its questions, their IDs and trimmed labels", async () => {
		const wrapper = await mount();

		await type(input("Name"), "  Ban appeal ");
		await type(input("Label"), " Why? ");

		button("Add question").click();
		await vi.waitFor(() => {
			expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
		});
		const choice = [...document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')].find(
			(item) => item.textContent?.includes("Choice"),
		);
		choice!.click();
		await vi.waitFor(() => {
			expect(dialog().querySelectorAll("li.question-card")).toHaveLength(2);
		});

		const options = [
			...dialog().querySelectorAll<HTMLInputElement>('input[aria-label^="Option "]'),
		];
		expect(options).toHaveLength(2);
		const labels = [...dialog().querySelectorAll<HTMLInputElement>("input")].filter(
			(element) => {
				const id = element.getAttribute("id");
				return (
					id &&
					dialog()
						.querySelector(`label[for="${id}"]`)
						?.textContent?.trim()
						.startsWith("Label")
				);
			},
		);
		await type(labels[1]!, "Which rule?");
		await type(options[0]!, " Spam ");
		await type(options[1]!, "Insults");

		button("Create form").click();
		await vi.waitFor(() => expect(wrapper.emitted("save")).toBeDefined());

		const body = lastSaved(wrapper)!;
		expect(body.name).toBe("Ban appeal");
		const questions = body.questions as AppealQuestion[];
		expect(questions).toHaveLength(2);
		expect(questions[0]).toMatchObject({ kind: "text", label: "Why?", long: true });
		expect(questions[0]!.id).toMatch(/^[\w-]{1,36}$/u);
		expect(questions[1]).toMatchObject({
			kind: "choice",
			label: "Which rule?",
			options: [
				{ label: "Spam", value: expect.stringMatching(/^[\w-]{1,36}$/u) },
				{ label: "Insults", value: expect.stringMatching(/^[\w-]{1,36}$/u) },
			],
		});
	});

	it("refuses a form whose only question asks nothing", async () => {
		const wrapper = await mount({
			...getDefaultAppealForm(),
			id: "1",
			guildId: GUILD_ID,
			name: "Notice",
			position: 0,
			questions: [{ id: "note", kind: "display", content: "Read the rules first." }],
		});

		expect(dialog().textContent).toContain("Edit Notice");
		button("Save form").click();
		await nextTick();

		expect(wrapper.emitted("save")).toBeUndefined();
		expect(dialog().textContent).toContain("a text block alone asks nothing");
	});
});
