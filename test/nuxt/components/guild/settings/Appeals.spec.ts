import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Appeals from "~/components/guild/settings/Appeals.vue";
import NumberField from "~/components/guild/settings/NumberField.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData(GUILD_ID));
const mockSetGuildSettingsChanges = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: ref(mockGuildSettings.value),
	setGuildSettings: vi.fn(),
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
	removeChange: vi.fn(),
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID })),
}));

mockNuxtImport("useToast", () => () => ({ add: vi.fn() }));

async function mountReady() {
	const wrapper = await mountSuspended(Appeals, {
		global: { stubs: { GuildAppealsForms: true } },
	});
	await nextTick();
	await nextTick();
	return wrapper;
}

// Accessibility audits for GuildSettingsAppeals live in test/nuxt/a11y.spec.ts.
describe("appeals guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGuildSettings.value = createMockGuildData(GUILD_ID);

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	// The bot links the members it punishes to a page that has no form yet.
	it("says the appeal form is in development", async () => {
		const wrapper = await mountReady();

		expect(wrapper.text()).toContain("The appeal form is in development");
	});

	it("is off until switched on, then shows the settings and the forms", async () => {
		const wrapper = await mountReady();

		expect(wrapper.text()).toContain("Appeals are off");
		expect(wrapper.text()).not.toContain("What can be appealed");
		expect(wrapper.findComponent({ name: "GuildAppealsForms" }).exists()).toBe(false);

		await wrapper.find('[aria-label="Let the members appeal"]').trigger("click");
		await nextTick();

		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({ appealsEnabled: true });
		expect(wrapper.text()).toContain("What can be appealed");
		expect(wrapper.text()).toContain("Review");
		expect(wrapper.text()).toContain("Limits");
		expect(wrapper.findComponent({ name: "GuildAppealsForms" }).exists()).toBe(true);
	});

	describe("while on", () => {
		beforeEach(() => {
			mockGuildSettings.value = createMockGuildData(GUILD_ID, { appealsEnabled: true });
		});

		it("stages the kind of thread picked for the staff", async () => {
			const wrapper = await mountReady();

			await wrapper.find('[role="radio"][value="private"]').trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				appealsThread: "private",
			});
		});

		it("shows the cooldown in days and holds one past the range to its end", async () => {
			mockGuildSettings.value = createMockGuildData(GUILD_ID, {
				appealsEnabled: true,
				appealsCooldownDays: 14,
			});
			const wrapper = await mountReady();

			const field = wrapper
				.findAllComponents(NumberField)
				.find((candidate) => candidate.text().includes("Appeal Cooldown"));
			expect(field!.text()).toContain("days");
			expect(field!.find("input").element.value).toBe("14");

			field!.findComponent({ name: "UInputNumber" }).vm.$emit("update:modelValue", 400);
			await nextTick();
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				appealsCooldownDays: 365,
			});
		});

		it("stages the block on denial", async () => {
			const wrapper = await mountReady();

			await wrapper.find('[aria-label="Toggle Block on Denial"]').trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				appealsBlockOnDenial: true,
			});
		});
	});
});
