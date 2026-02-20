import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import * as v from "valibot";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

// Mock guild settings data
const mockOriginalSettings = createMockGuildData("123456789012345678", {
	prefix: "!",
	language: "en-US",
});

// Mock composable state
const mockGuildSettings = ref<GuildData>(mockOriginalSettings);
const mockOriginalGuildSettings = ref<GuildData>(mockOriginalSettings);
const mockGuildSettingsChanges = ref<GuildData | undefined>(undefined);
const mockResetCounter = ref(0);

const mockSetGuildSettings = vi.fn();
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();
const mockResetGuildSettingsChanges = vi.fn(() => {
	mockGuildSettingsChanges.value = undefined;
	mockResetCounter.value += 1;
});

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: mockSetGuildSettings,
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: mockGuildSettingsChanges,
	resetCounter: mockResetCounter,
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
	removeChange: mockRemoveChange,
	resetGuildSettingsChanges: mockResetGuildSettingsChanges,
}));

// Simple test schema
const testSchema = v.object({
	prefix: v.optional(v.string()),
	language: v.optional(v.string()),
});

type TestSchema = v.InferOutput<typeof testSchema>;

describe("guildSettingsForm - Reset Behavior", () => {
	beforeEach(() => {
		// Clear mocks between tests
		vi.clearAllMocks();

		// Reset state to original values
		mockGuildSettings.value = { ...mockOriginalSettings };
		mockOriginalGuildSettings.value = { ...mockOriginalSettings };
		mockGuildSettingsChanges.value = undefined;
		mockResetCounter.value = 0;

		// Clear state between tests
		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("should revert local state when resetCounter increments", async () => {
		const { default: GuildSettingsForm } =
			await import("../../../../../app/components/guild/settings/Form.vue");

		// Create a test wrapper component that uses GuildSettingsForm
		const TestWrapper = defineComponent({
			components: { GuildSettingsForm },
			setup() {
				const state = reactive<TestSchema>({
					prefix: mockGuildSettings.value.prefix,
					language: mockGuildSettings.value.language,
				});

				function mapToGuildData(formState: TestSchema): Partial<GuildData> {
					const changes: Partial<GuildData> = {};
					if (formState.prefix) {
						changes.prefix = formState.prefix;
					}
					if (formState.language) {
						changes.language = formState.language;
					}
					return changes;
				}

				return { state, mapToGuildData, testSchema };
			},
			template: `
				<GuildSettingsForm :schema="testSchema" :state="state" :map-to-guild-data="mapToGuildData">
					<div class="space-y-4">
						<UFormField label="Prefix" name="prefix">
							<UInput id="prefix-input" v-model="state.prefix" />
						</UFormField>
						<UFormField label="Language" name="language">
							<UInput id="language-input" v-model="state.language" />
						</UFormField>
					</div>
				</GuildSettingsForm>
			`,
		});

		const wrapper = await mountSuspended(TestWrapper);

		// Wait for form initialization
		await nextTick();
		await nextTick();

		// Initial state should match original settings
		const prefixInput = wrapper.find("#prefix-input");
		const languageInput = wrapper.find("#language-input");

		expect((prefixInput.element as HTMLInputElement).value).toBe("!");
		expect((languageInput.element as HTMLInputElement).value).toBe("en-US");

		// Simulate user editing the form
		await prefixInput.setValue("?");
		await languageInput.setValue("es-ES");
		await nextTick();

		// Verify state changed
		expect((prefixInput.element as HTMLInputElement).value).toBe("?");
		expect((languageInput.element as HTMLInputElement).value).toBe("es-ES");

		// Verify changes were staged (form watcher should have triggered)
		await nextTick();
		expect(mockSetGuildSettingsChanges).toHaveBeenCalled();

		// Trigger reset by incrementing resetCounter
		mockResetGuildSettingsChanges();
		await nextTick();
		await nextTick();

		// Verify state was reverted to original values
		expect((prefixInput.element as HTMLInputElement).value).toBe("!");
		expect((languageInput.element as HTMLInputElement).value).toBe("en-US");

		// Verify staged changes were cleared
		expect(mockGuildSettingsChanges.value).toBeUndefined();
	});

	it("should not revert state if originalState is not initialized", async () => {
		const { default: GuildSettingsForm } =
			await import("../../../../../app/components/guild/settings/Form.vue");

		// Set originalGuildSettings to undefined to prevent initialization
		mockOriginalGuildSettings.value = undefined as any;

		const TestWrapper = defineComponent({
			components: { GuildSettingsForm },
			setup() {
				const state = reactive<TestSchema>({
					prefix: "!",
					language: "en-US",
				});

				return { state, testSchema };
			},
			template: `
				<GuildSettingsForm :schema="testSchema" :state="state">
					<UFormField label="Prefix" name="prefix">
						<UInput id="prefix-input" v-model="state.prefix" />
					</UFormField>
				</GuildSettingsForm>
			`,
		});

		const wrapper = await mountSuspended(TestWrapper);
		await nextTick();

		const prefixInput = wrapper.find("#prefix-input");

		// Edit the form
		await prefixInput.setValue("?");
		expect((prefixInput.element as HTMLInputElement).value).toBe("?");

		// Trigger reset while not initialized
		mockResetGuildSettingsChanges();
		await nextTick();

		// State should NOT be reverted (stays edited)
		expect((prefixInput.element as HTMLInputElement).value).toBe("?");
	});

	it("should not retrigger change staging after reset", async () => {
		const { default: GuildSettingsForm } =
			await import("../../../../../app/components/guild/settings/Form.vue");

		const TestWrapper = defineComponent({
			components: { GuildSettingsForm },
			setup() {
				const state = reactive<TestSchema>({
					prefix: mockGuildSettings.value.prefix,
					language: mockGuildSettings.value.language,
				});

				function mapToGuildData(formState: TestSchema): Partial<GuildData> {
					return {
						prefix: formState.prefix,
						language: formState.language,
					};
				}

				return { state, mapToGuildData, testSchema };
			},
			template: `
				<GuildSettingsForm :schema="testSchema" :state="state" :map-to-guild-data="mapToGuildData">
					<UFormField label="Prefix" name="prefix">
						<UInput id="prefix-input" v-model="state.prefix" />
					</UFormField>
				</GuildSettingsForm>
			`,
		});

		const wrapper = await mountSuspended(TestWrapper);
		await nextTick();
		await nextTick();

		const prefixInput = wrapper.find("#prefix-input");

		// Clear mock call history after initialization
		mockSetGuildSettingsChanges.mockClear();

		// Edit the form
		await prefixInput.setValue("?");
		await nextTick();

		// Verify change was staged
		expect(mockSetGuildSettingsChanges).toHaveBeenCalled();

		// Clear call history
		mockSetGuildSettingsChanges.mockClear();

		// Trigger reset
		mockResetGuildSettingsChanges();
		await nextTick();
		await nextTick();

		// Verify setGuildSettingsChanges was NOT called during reset
		// (the watcher should be skipped due to isResetting guard)
		expect(mockSetGuildSettingsChanges).not.toHaveBeenCalled();
	});

	it("should work with mapToGuildData function", async () => {
		const { default: GuildSettingsForm } =
			await import("../../../../../app/components/guild/settings/Form.vue");

		const TestWrapper = defineComponent({
			components: { GuildSettingsForm },
			setup() {
				// Use a custom schema with nested structure
				const state = reactive({
					prefixWrapper: {
						value: mockGuildSettings.value.prefix,
					},
				});

				// Custom mapping function
				function mapToGuildData(formState: typeof state): Partial<GuildData> {
					return {
						prefix: formState.prefixWrapper.value,
					};
				}

				return { state, mapToGuildData, testSchema };
			},
			template: `
				<GuildSettingsForm :schema="testSchema" :state="state" :map-to-guild-data="mapToGuildData">
					<UFormField label="Prefix" name="prefix">
						<UInput id="prefix-input" v-model="state.prefixWrapper.value" />
					</UFormField>
				</GuildSettingsForm>
			`,
		});

		const wrapper = await mountSuspended(TestWrapper);
		await nextTick();
		await nextTick();

		const prefixInput = wrapper.find("#prefix-input");

		// Initial value
		expect((prefixInput.element as HTMLInputElement).value).toBe("!");

		// Edit
		await prefixInput.setValue("??");
		await nextTick();
		expect((prefixInput.element as HTMLInputElement).value).toBe("??");

		// Reset
		mockResetGuildSettingsChanges();
		await nextTick();
		await nextTick();

		// Should revert to original
		expect((prefixInput.element as HTMLInputElement).value).toBe("!");
	});
});
