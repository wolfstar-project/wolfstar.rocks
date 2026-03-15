import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import General from "~/components/guild/settings/General.vue";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
		prefix: "!",
		language: "en-US",
	});

const mockGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockOriginalGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockToastAdd = vi.fn();
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();
const mockSetGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: mockSetGuildSettings,
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: ref<GuildData | undefined>(undefined),
	setGuildSettingsChanges: mockSetGuildSettingsChanges,
	removeChange: mockRemoveChange,
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useToast", () => () => ({
	add: mockToastAdd,
}));

function getSetupState(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
	return (wrapper.vm.$ as any).setupState as {
		mapLanguageKeysToNames: (langKey: string) => [string] | [string, string];
		mapToGuildData: (formState: {
			prefix: string;
			language: { label: string; value: string };
		}) => Partial<GuildData>;
		state: {
			prefix: string;
			language: { label: string; value: string };
		};
	};
}

describe("general guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockGuildSettings.value = createInitialGuildSettings();
		mockOriginalGuildSettings.value = createInitialGuildSettings();

		if (import.meta.client) {
			clearNuxtState();
		}
	});

	it("renders prefix input and language select", async () => {
		const wrapper = await mountSuspended(General, {
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		const prefixInput = wrapper.find("input#prefix");

		expect(prefixInput.exists()).toBeTruthy();
		expect((prefixInput.element as HTMLInputElement).value).toBe("!");
		expect(wrapper.text()).toContain("Language");
		expect(wrapper.html()).toContain("language");
	});

	it("initializes state from guildSettings", async () => {
		const wrapper = await mountSuspended(General, {
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		const prefixInput = wrapper.find("input#prefix");
		const setupState = getSetupState(wrapper);

		expect((prefixInput.element as HTMLInputElement).value).toBe("!");
		expect(setupState.state.prefix).toBe("!");
		expect(setupState.state.language).toStrictEqual({
			label: "English, United States",
			value: "en-US",
		});
	});

	it("mapToGuildData correctly transforms form state", async () => {
		const wrapper = await mountSuspended(General, {
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		const prefixInput = wrapper.find("input#prefix");
		await prefixInput.setValue("?");
		await nextTick();

		const setupState = getSetupState(wrapper);
		const mappedGuildData = setupState.mapToGuildData(setupState.state);

		expect(mappedGuildData).toStrictEqual({
			language: "en-US",
			prefix: "?",
		});
		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
			prefix: "?",
		});
	});

	it("maps language keys to display names correctly", async () => {
		const wrapper = await mountSuspended(General, {
			props: {
				languages: ["en-US", "de-DE", "unknown-key"],
			},
		});

		await nextTick();

		const { mapLanguageKeysToNames } = getSetupState(wrapper);

		expect(mapLanguageKeysToNames("en-US")).toStrictEqual([
			"American English",
			"English, United States",
		]);
		expect(mapLanguageKeysToNames("de-DE")).toStrictEqual(["Deutsch", "German"]);
		expect(mapLanguageKeysToNames("unknown-key")).toStrictEqual(["unknown-key"]);
	});

	it("renders language options from prop", async () => {
		const wrapper = await mountSuspended(General, {
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		const selectMenu = wrapper.findComponent({ name: "USelectMenu" });

		expect(selectMenu.exists()).toBeTruthy();
		expect(selectMenu.props("items")).toStrictEqual([
			{
				label: "English, United States",
				value: "en-US",
			},
			{
				label: "Spanish",
				value: "es-ES",
			},
			{
				label: "German",
				value: "de-DE",
			},
		]);
	});
});
