import type { OnboardingStage, OnboardingStageInput } from "#shared/utils/onboarding";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import StageEditor from "~/components/guild/onboarding/StageEditor.vue";
import { createMockOauthFlattenedGuild, createMockRole } from "~~/test/mocks/discord";
import { createMockOnboardingStage } from "~~/test/mocks/onboarding";

const guild = createMockOauthFlattenedGuild({
	id: "123456789012345678",
	roles: [createMockRole({ id: "456789012345678901", name: "Member" })],
});

// The dialog is teleported to the body: a wrapper left mounted keeps it there.
const mounted: { unmount: () => void }[] = [];

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the editor's dialog");
	return element;
}

function button(text: string): HTMLButtonElement {
	const found = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(element) => element.textContent?.trim() === text,
	);
	if (!found) throw new Error(`expected a "${text}" button`);
	return found;
}

/** The card of a choice, found by the start of its label. */
async function pick(label: string) {
	const found = [...dialog().querySelectorAll<HTMLElement>('[role="radio"]')].find((element) =>
		element.closest("label")?.textContent?.trim().startsWith(label),
	);
	if (!found) throw new Error(`expected a "${label}" choice`);
	found.click();
	await nextTick();
	await nextTick();
}

async function type(selector: string, value: string) {
	const field = dialog().querySelector<HTMLInputElement>(selector);
	if (!field) throw new Error(`expected the field ${selector}`);
	field.value = value;
	field.dispatchEvent(new Event("input", { bubbles: true }));
	await nextTick();
}

const NAME = 'input[placeholder="Are you human?"]';
const QUESTION = 'input[placeholder="Did you read the rules?"]';

async function mountEditor(
	props: {
		stage?: OnboardingStage | null;
		errorMessage?: string | null;
		locked?: boolean;
		captchaAvailable?: boolean;
	} = {},
) {
	const wrapper = await mountSuspended(StageEditor, {
		attachTo: document.body,
		props: { guild, open: true, stage: null, ...props },
	});
	mounted.push(wrapper);
	await vi.waitFor(() => expect(dialog().querySelector("form")).not.toBeNull());
	return wrapper;
}

function lastSaved(wrapper: Awaited<ReturnType<typeof mountEditor>>) {
	return (wrapper.emitted("save") ?? []).at(-1)?.[0] as OnboardingStageInput | undefined;
}

function alertText(): string | undefined {
	return dialog().querySelector('[role="alert"]')?.textContent ?? undefined;
}

// Accessibility audits for the Onboarding components live in test/nuxt/a11y.spec.ts.
describe("GuildOnboardingStageEditor", () => {
	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("refuses a stage without a name, then saves it once named", async () => {
		const wrapper = await mountEditor();

		button("Create stage").click();
		await vi.waitFor(() =>
			expect(alertText()).toContain("Give the stage a name, 32 characters at most."),
		);
		expect(wrapper.emitted("save")).toBeUndefined();

		await type(NAME, "  Quick check ");
		button("Create stage").click();
		await vi.waitFor(() => expect(lastSaved(wrapper)).toBeDefined());
		expect(lastSaved(wrapper)).toStrictEqual({
			answers: [],
			challenge: "Button",
			enabled: true,
			failureAction: "None",
			failureTimeout: null,
			maxAttempts: 3,
			name: "Quick check",
			question: null,
			roleId: null,
			timeLimit: 600,
			trigger: "Join",
		});
	});

	it("asks for the question and an answer once the challenge is a question", async () => {
		const wrapper = await mountEditor();
		await type(NAME, "Server rules");
		expect(dialog().querySelector(QUESTION)).toBeNull();

		await pick("Question");
		button("Create stage").click();
		await vi.waitFor(() =>
			expect(alertText()).toContain("Write the question, 200 characters at most."),
		);

		await type(QUESTION, "Did you read the rules?");
		await vi.waitFor(() =>
			expect(alertText()).toContain(
				"Add 1 to 5 accepted answers, 100 characters each at most.",
			),
		);

		await type('input[aria-label="Accepted answer 1"]', "yes");
		button("Create stage").click();
		await vi.waitFor(() => expect(lastSaved(wrapper)).toBeDefined());
		expect(lastSaved(wrapper)).toMatchObject({
			answers: ["yes"],
			challenge: "Question",
			question: "Did you read the rules?",
		});
	});

	it("adds answer fields up to five", async () => {
		await mountEditor();
		await pick("Question");

		for (let count = 0; count < 4; count++) {
			button("Add answer").click();
			await nextTick();
		}

		expect(dialog().querySelectorAll('input[aria-label^="Accepted answer"]')).toHaveLength(5);
		expect(
			[...dialog().querySelectorAll("button")].some(
				(element) => element.textContent?.trim() === "Add answer",
			),
		).toBe(false);
	});

	it("opens on the stage it edits, and sends the timeout's length with a timeout", async () => {
		const wrapper = await mountEditor({
			stage: createMockOnboardingStage({
				failureAction: "Timeout",
				failureTimeout: 1200,
				name: "Are you human?",
				trigger: "NativeOnboarding",
			}),
		});

		expect(dialog().textContent).toContain("Edit stage Are you human?");
		expect(dialog().textContent).toContain("Timeout length");

		button("Save stage").click();
		await vi.waitFor(() => expect(lastSaved(wrapper)).toBeDefined());
		expect(lastSaved(wrapper)).toMatchObject({
			challenge: "Emoji",
			failureAction: "Timeout",
			failureTimeout: 1200,
			trigger: "NativeOnboarding",
		});
	});

	it("offers the captcha when the site checks one", async () => {
		await mountEditor({ captchaAvailable: true });

		const captcha = Array.from(dialog().querySelectorAll('[role="radio"]')).find((element) =>
			element.closest("label")?.textContent?.trim().startsWith("Captcha"),
		);
		expect(captcha).toBeDefined();
		expect(captcha?.matches("[disabled], [data-disabled]")).toBe(false);
	});

	it("offers no captcha for a new stage when the site cannot check one", async () => {
		await mountEditor();

		const choices = Array.from(dialog().querySelectorAll('[role="radio"]'), (element) =>
			element.closest("label")?.textContent?.trim(),
		);
		expect(choices.some((label) => label?.startsWith("Captcha"))).toBe(false);
	});

	it("saves a stage the bot's panel gave the captcha, keeping it", async () => {
		const wrapper = await mountEditor({
			stage: createMockOnboardingStage({ challenge: "Captcha", name: "Captcha check" }),
		});

		button("Save stage").click();

		await vi.waitFor(() => expect(lastSaved(wrapper)).toBeDefined());
		expect(lastSaved(wrapper)).toMatchObject({ challenge: "Captcha", name: "Captcha check" });
	});

	it("shows why the server refused the last save", async () => {
		await mountEditor({
			errorMessage: "Another stage has that name, whatever its case. Pick another name.",
		});

		expect(alertText()).toContain("Another stage has that name");
	});

	it("asks to delete the stage it edits", async () => {
		const wrapper = await mountEditor({ stage: createMockOnboardingStage() });

		button("Delete stage").click();

		expect(wrapper.emitted("delete")).toHaveLength(1);
	});

	it("saves nothing while the page must reload first", async () => {
		await mountEditor({ locked: true, stage: createMockOnboardingStage() });

		expect(button("Save stage").disabled).toBe(true);
		expect(button("Delete stage").disabled).toBe(true);
	});
});
