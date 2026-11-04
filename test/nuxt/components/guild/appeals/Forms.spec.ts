import type { AppealForm } from "#shared/utils/appeal-forms";
import { getDefaultAppealForm } from "#shared/utils/appeal-forms";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Forms from "~/components/guild/appeals/Forms.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";

const GUILD_ID = "123456789012345678";

function makeForm(id: string, name: string, overrides: Partial<AppealForm> = {}): AppealForm {
	return {
		...getDefaultAppealForm(),
		guildId: GUILD_ID,
		id,
		name,
		position: Number(id),
		questions: [
			{ id: "why", kind: "text", label: "Why?", long: true, maxLength: 1000, required: true },
		],
		...overrides,
	};
}

const mockForms = ref<AppealForm[]>([]);
const mockStatus = ref<"idle" | "pending" | "success" | "error">("success");
const mockCreateForm = vi.fn();
const mockUpdateForm = vi.fn();
const mockDeleteForm = vi.fn();
const mockReorderForms = vi.fn();
const mockRefresh = vi.fn();
const mockToastAdd = vi.fn();

mockNuxtImport("useAppealForms", () => () => ({
	createForm: mockCreateForm,
	deleteForm: mockDeleteForm,
	forms: mockForms,
	refresh: mockRefresh,
	reorderForms: mockReorderForms,
	status: mockStatus,
	updateForm: mockUpdateForm,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID })),
}));

mockNuxtImport("useToast", () => () => ({ add: mockToastAdd }));

// Accessibility audits for GuildAppealsForms live in test/nuxt/a11y.spec.ts.
describe("GuildAppealsForms", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockForms.value = [
			makeForm("1", "Ban appeal", { icon: "🔨", types: [0], description: "For bans." }),
			makeForm("2", "Mute appeal", { enabled: false, lockReason: "Closed" }),
		];
		mockStatus.value = "success";
		mockUpdateForm.mockResolvedValue({ ok: true, value: mockForms.value[0] });
		mockDeleteForm.mockResolvedValue({ ok: true, value: undefined });
		mockReorderForms.mockResolvedValue({ ok: true, value: mockForms.value });
	});

	it("lists every form in order, with what it takes", async () => {
		const wrapper = await mountSuspended(Forms);

		const cards = wrapper.findAll("ol > li.console-card");
		expect(cards).toHaveLength(2);
		expect(cards[0]!.text()).toContain("Ban appeal");
		expect(cards[0]!.text()).toContain("🔨");
		expect(cards[0]!.text()).toContain("For bans.");
		expect(cards[0]!.text()).toContain("Bans");
		expect(cards[0]!.text()).not.toContain("Every kind");
		expect(cards[0]!.text()).toContain("1 questions");
		expect(cards[1]!.text()).toContain("Every kind");
		expect(cards[1]!.text()).toContain("Locked");
		expect(wrapper.text()).toContain("2 of 10 forms");
	});

	it("explains the built-in form when there is none yet", async () => {
		mockForms.value = [];
		const wrapper = await mountSuspended(Forms);

		expect(wrapper.text()).toContain("No forms yet");
		expect(wrapper.text()).toContain("why the case should be undone");
	});

	it("offers a retry when the forms cannot be loaded", async () => {
		mockStatus.value = "error";
		mockForms.value = [];
		const wrapper = await mountSuspended(Forms);

		expect(wrapper.find('[role="alert"]').exists()).toBe(true);
		const retry = wrapper.findAll("button").find((button) => button.text() === "Try again");
		await retry!.trigger("click");
		expect(mockRefresh).toHaveBeenCalledOnce();
	});

	it("saves a toggle at once, for that form only", async () => {
		const wrapper = await mountSuspended(Forms);

		await wrapper.find('[aria-label="Enable form Ban appeal"]').trigger("click");
		await nextTick();

		expect(mockUpdateForm).toHaveBeenCalledExactlyOnceWith("1", { enabled: false });
	});

	// The whole order is sent, so two moves made at once do not undo each other.
	it("moves a form down by sending the whole new order", async () => {
		const wrapper = await mountSuspended(Forms);

		expect(
			wrapper.find('[aria-label="Move form Ban appeal up"]').attributes("disabled"),
		).toBeDefined();
		await wrapper.find('[aria-label="Move form Ban appeal down"]').trigger("click");
		await nextTick();

		expect(mockReorderForms).toHaveBeenCalledExactlyOnceWith(["2", "1"]);
	});

	it("asks before deleting a form, then deletes it", async () => {
		const wrapper = await mountSuspended(Forms, { attachTo: document.body });

		await wrapper.find('[aria-label="Delete form Mute appeal"]').trigger("click");
		await vi.waitFor(() => {
			expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain(
				"Delete this form?",
			);
		});
		expect(mockDeleteForm).not.toHaveBeenCalled();

		const confirm = [
			...document.body.querySelectorAll<HTMLButtonElement>('[role="dialog"] button'),
		].find((button) => button.textContent?.trim() === "Delete");
		confirm!.click();
		await vi.waitFor(() => expect(mockDeleteForm).toHaveBeenCalledExactlyOnceWith("2"));
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({ color: "success", title: 'Form "Mute appeal" deleted' }),
		);

		wrapper.unmount();
	});

	it("tells the admin when a toggle is refused", async () => {
		mockUpdateForm.mockResolvedValue({ ok: false, code: "unknown" });
		const wrapper = await mountSuspended(Forms);

		await wrapper.find('[aria-label="Enable form Ban appeal"]').trigger("click");
		await nextTick();
		await nextTick();

		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				color: "error",
				description: "This form no longer exists. Reload the page.",
			}),
		);
	});

	it("stops offering new forms at the limit", async () => {
		mockForms.value = Array.from({ length: 10 }, (_, index) =>
			makeForm(String(index + 1), `Form ${index + 1}`),
		);
		const wrapper = await mountSuspended(Forms);

		const create = wrapper.findAll("button").find((button) => button.text() === "Create form");
		expect(create!.attributes("disabled")).toBeDefined();
		expect(wrapper.text()).toContain("10 of 10 forms");
	});
});
