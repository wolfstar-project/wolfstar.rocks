import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Appeals from "~/components/guild/settings/Appeals.vue";
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
	const wrapper = await mountSuspended(Appeals);
	await nextTick();
	await nextTick();
	return wrapper;
}

function button(wrapper: Awaited<ReturnType<typeof mountReady>>, text: string) {
	return wrapper.findAll("button").find((candidate) => candidate.text() === text);
}

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

	it("is off until switched on, then shows what can be appealed", async () => {
		const wrapper = await mountReady();

		expect(wrapper.text()).toContain("Appeals are off");
		expect(wrapper.text()).not.toContain("What can be appealed");

		await wrapper.find('[aria-label="Let the members appeal"]').trigger("click");
		await nextTick();

		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({ appealsEnabled: true });
		expect(wrapper.text()).toContain("What can be appealed");
		expect(wrapper.text()).toContain("Form questions");
	});

	describe("form questions", () => {
		beforeEach(() => {
			mockGuildSettings.value = createMockGuildData(GUILD_ID, {
				appealsEnabled: true,
				appealsQuestions: ["Why were you punished?"],
			});
		});

		it("adds a question, and not a blank one or a copy", async () => {
			const wrapper = await mountReady();
			const input = wrapper.find('[aria-label="New question"]');

			await input.setValue("   ");
			expect(button(wrapper, "Add question")?.attributes("disabled")).toBeDefined();
			await input.setValue(" Why were you punished? ");
			expect(button(wrapper, "Add question")?.attributes("disabled")).toBeDefined();

			await input.setValue("  What will you do differently?  ");
			await button(wrapper, "Add question")!.trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				appealsQuestions: ["Why were you punished?", "What will you do differently?"],
			});
			expect((input.element as HTMLInputElement).value).toBe("");
		});

		it("removes a question", async () => {
			const wrapper = await mountReady();

			await wrapper
				.find('[aria-label="Remove the question Why were you punished?"]')
				.trigger("click");
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({ appealsQuestions: [] });
			expect(wrapper.text()).toContain(
				"No questions: the form asks why the case should be undone.",
			);
		});

		it("stops at the five questions the bot asks, and says which are not asked", async () => {
			mockGuildSettings.value = createMockGuildData(GUILD_ID, {
				appealsEnabled: true,
				appealsQuestions: ["1", "2", "3", "4", "5", "6"],
			});
			const wrapper = await mountReady();

			expect(wrapper.find('[aria-label="New question"]').exists()).toBe(false);
			expect(wrapper.text()).toContain("Five questions is the most a form asks.");
			expect(wrapper.text()).toContain("WolfStar asks the first five");
			expect(wrapper.text()).toContain("5 / 5");
		});
	});
});
