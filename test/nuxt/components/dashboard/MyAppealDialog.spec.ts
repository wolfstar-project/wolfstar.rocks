import type { AppealQuestion } from "#shared/utils/appeal-forms";
import type { AppealPage, AppealPageForm, MyAppealEntry } from "#shared/utils/my-appeals";
import { DashboardMyAppealDialog } from "#components";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "234567890123456789";

const ENTRY: MyAppealEntry = {
	key: `${GUILD}:212`,
	guild: { id: GUILD, name: "Pixel Parlor", icon: null },
	case: {
		id: 212,
		type: "Ban",
		reason: "Advertising",
		createdAt: "2026-11-01T12:00:00.000Z",
		duration: null,
		state: "active",
	},
	status: "open",
	appeal: null,
	againAt: null,
	closed: null,
};

const CASE = { id: 212, type: "Ban", reason: "Advertising", createdAt: 0, duration: null };
const WHY: AppealQuestion = {
	id: "why",
	kind: "text",
	label: "Why should the ban be lifted?",
	help: "In your own words.",
	long: true,
	maxLength: 1000,
	required: true,
};
const RULES: AppealQuestion = {
	id: "rules",
	kind: "choice",
	label: "Did you read the rules again?",
	min: 1,
	max: 1,
	options: [
		{ label: "Yes", value: "yes" },
		{ label: "Not yet", value: "no" },
	],
	required: true,
};
const SHOTS: AppealQuestion = {
	id: "shots",
	kind: "attachment",
	label: "Screenshots",
	imagesOnly: true,
	min: 0,
	max: 3,
};

function form(overrides: Partial<AppealPageForm> = {}): AppealPageForm {
	return {
		id: "ban",
		name: "Ban appeal",
		description: "Tell the staff what happened.",
		icon: null,
		questions: [WHY, RULES, SHOTS],
		lockReason: null,
		lock: null,
		until: null,
		cases: [CASE],
		...overrides,
	};
}

function page(overrides: Partial<AppealPage> = {}): AppealPage {
	return {
		guild: { id: GUILD, name: "Pixel Parlor", icon: null },
		enabled: true,
		block: null,
		forms: [
			form(),
			form({
				id: "promo",
				name: "Ad or self-promo",
				lock: "cooldown",
				lockReason: "Opens again on Monday.",
				cases: [],
			}),
		],
		appeals: [],
		...overrides,
	};
}

const mockToastAdd = vi.fn();
mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

const loadPage = vi.fn();
const submit = vi.fn();
const mounted: { unmount: () => void }[] = [];

async function mount() {
	const wrapper = await mountSuspended(DashboardMyAppealDialog, {
		attachTo: document.body,
		props: { open: true, entry: ENTRY, loadPage, submit },
	});
	mounted.push(wrapper);
	return wrapper;
}

function dialog(): HTMLElement {
	const element = document.querySelector<HTMLElement>('[role="dialog"]');
	if (!element) throw new Error("expected the dialog");
	return element;
}

function sendButton(): HTMLButtonElement {
	const found = [...dialog().querySelectorAll<HTMLButtonElement>("button")].find(
		(button) => button.textContent?.trim() === "Send appeal",
	);
	if (!found) throw new Error("expected the send button");
	return found;
}

async function ready() {
	await vi.waitFor(() => expect(dialog().textContent).toContain("Why should the ban be lifted?"));
}

describe("DashboardMyAppealDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadPage.mockResolvedValue({ ok: true, value: page() });
		submit.mockResolvedValue({ ok: true, value: undefined });
	});

	afterEach(() => {
		for (const wrapper of mounted.splice(0)) wrapper.unmount();
	});

	it("names the server and the case, and reads the page of the server", async () => {
		await mount();
		await ready();

		expect(loadPage).toHaveBeenCalledWith(GUILD);
		expect(dialog().textContent).toContain("Appeal to Pixel Parlor");
		expect(dialog().textContent).toContain("Case #212 · Ban · Advertising");
	});

	it("offers the forms, a locked one dimmed and not selectable, with why", async () => {
		await mount();
		await ready();
		const radios = [
			...dialog().querySelectorAll<HTMLInputElement>('fieldset input[type="radio"]'),
		].slice(0, 2);

		expect(radios[0]!.checked).toBe(true);
		expect(radios[1]!.disabled).toBe(true);
		expect(dialog().textContent).toContain("Locked · Opens again on Monday.");
	});

	it("keeps the files off, and cannot send a form that asks for them", async () => {
		loadPage.mockResolvedValue({
			ok: true,
			value: page({ forms: [form({ questions: [WHY, { ...SHOTS, min: 1 }] })] }),
		});
		await mount();
		await ready();

		expect(dialog().textContent).toContain("Sending files from the website is not ready yet");
		expect(sendButton().disabled).toBe(true);
	});

	it("asks for the required answers before sending", async () => {
		await mount();
		await ready();
		sendButton().click();

		await vi.waitFor(() =>
			expect(dialog().textContent).toContain("Answer the questions marked with *."),
		);
		expect(submit).not.toHaveBeenCalled();
	});

	it("sends the answers, trimmed, then says so and closes", async () => {
		const wrapper = await mount();
		await ready();
		const textarea = dialog().querySelector<HTMLTextAreaElement>("textarea")!;
		textarea.value = "  It was my brother.  ";
		textarea.dispatchEvent(new Event("input"));
		dialog().querySelector<HTMLInputElement>('input[value="yes"]')!.click();
		await nextTick();
		sendButton().click();

		await vi.waitFor(() => expect(submit).toHaveBeenCalled());
		expect(submit).toHaveBeenCalledWith(GUILD, "ban", 212, {
			rules: ["yes"],
			why: "It was my brother.",
		});
		await vi.waitFor(() => expect(mockToastAdd).toHaveBeenCalled());
		expect(mockToastAdd.mock.calls[0]![0]).toMatchObject({
			color: "success",
			title: "Appeal sent to Pixel Parlor",
		});
		expect(wrapper.emitted("update:open")?.at(-1)).toStrictEqual([false]);
	});

	it("says why the bot refused the appeal", async () => {
		submit.mockResolvedValue({ ok: false, code: "appealed" });
		await mount();
		await ready();
		const textarea = dialog().querySelector<HTMLTextAreaElement>("textarea")!;
		textarea.value = "Sorry.";
		textarea.dispatchEvent(new Event("input"));
		dialog().querySelector<HTMLInputElement>('input[value="no"]')!.click();
		await nextTick();
		sendButton().click();

		await vi.waitFor(() =>
			expect(dialog().textContent).toContain("This case already has an appeal."),
		);
	});

	it("says when appeals cannot be sent from the website", async () => {
		loadPage.mockResolvedValue({ ok: false, code: "unavailable" });
		await mount();

		await vi.waitFor(() =>
			expect(dialog().textContent).toContain(
				"Appeals cannot be sent from the website right now.",
			),
		);
	});

	it("says why a server takes no appeal", async () => {
		loadPage.mockResolvedValue({
			ok: true,
			value: page({ block: { reason: "Ban evasion." } }),
		});
		await mount();

		await vi.waitFor(() =>
			expect(dialog().textContent).toContain(
				"Pixel Parlor does not take your appeals: Ban evasion.",
			),
		);
		expect(
			[...dialog().querySelectorAll("button")].some(
				(button) => button.textContent?.trim() === "Send appeal",
			),
		).toBe(false);
	});
});
