import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import General from "~/components/guild/settings/General.vue";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
		prefix: "!",
		language: "en-US",
	});

const mockGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockOriginalGuildSettings = ref<GuildData | undefined>(createInitialGuildSettings());
const mockGuildData = ref(
	createMockOauthFlattenedGuild({
		approximateMemberCount: 42,
		channels: [
			createMockChannel({ id: "c1", type: ChannelType.GuildCategory }),
			createMockChannel({ id: "c2", type: ChannelType.GuildText }),
			createMockChannel({ id: "c3", type: ChannelType.GuildText }),
			createMockChannel({ id: "c4", type: ChannelType.GuildVoice }),
		],
		id: "123456789012345678",
		roles: [createMockRole({ id: "r1" }), createMockRole({ id: "r2" })],
	}),
);
const mockToastAdd = vi.fn();
const mockCopy = vi.fn();
const mockCopied = ref(false);
const mockSetGuildSettingsChanges = vi.fn();
const mockRemoveChange = vi.fn();
const mockSetGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalGuildSettings,
	setGuildSettings: mockSetGuildSettings,
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: mockGuildData,
}));

mockNuxtImport("useClipboard", () => () => ({
	copied: mockCopied,
	copy: mockCopy,
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
		mapToGuildData: (formState: { prefix: string; language: string }) => Partial<GuildData>;
		state: {
			prefix: string;
			language: string;
		};
	};
}

describe("general guild settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockGuildSettings.value = createInitialGuildSettings();
		mockOriginalGuildSettings.value = createInitialGuildSettings();
		mockCopied.value = false;

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
		expect(setupState.state.language).toBe("en-US");
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

		const select = wrapper.findComponent({ name: "USelect" });

		expect(select.exists()).toBeTruthy();
		expect(select.props("items")).toStrictEqual([
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

	describe("information section", () => {
		it("renders server statistics from guildData", async () => {
			const wrapper = await mountSuspended(General, {
				props: { languages: ["en-US"] },
			});

			await nextTick();

			const html = wrapper.html();
			expect(html).toContain("Members");
			expect(html).toContain("42");
			expect(html).toContain("Categories");
			expect(html).toContain("1");
			expect(html).toContain("Text Channels");
			expect(html).toContain("2");
			expect(html).toContain("Voice Channels");
			expect(html).toContain("1");
			expect(html).toContain("Roles");
		});

		it("calls copy with server id and toast options when Copy Server ID is clicked", async () => {
			const wrapper = await mountSuspended(General, {
				props: { languages: ["en-US"] },
			});

			await nextTick();

			const copyButton = wrapper
				.findAll("button")
				.find((b) => b.text().includes("Copy Server ID"));
			expect(copyButton?.exists()).toBeTruthy();

			await copyButton!.trigger("click");
			await nextTick();

			expect(mockCopy).toHaveBeenCalledWith("123456789012345678", {
				color: "success",
				description: "The server ID has been copied to your clipboard.",
				icon: "heroicons:check",
				title: "Server ID Copied",
			});
		});

		it("shows Copied! label when copied is true", async () => {
			mockCopied.value = true;

			const wrapper = await mountSuspended(General, {
				props: { languages: ["en-US"] },
			});

			await nextTick();

			expect(wrapper.html()).toContain("Copied!");
		});

		it("renders Need Help? link pointing to support Discord", async () => {
			const wrapper = await mountSuspended(General, {
				props: { languages: ["en-US"] },
			});

			await nextTick();

			const links = wrapper.findAll("a");
			const helpLink = links.find((a) => a.text().includes("Need Help?"));
			expect(helpLink?.exists()).toBeTruthy();
			expect(helpLink?.attributes("href")).toBe("https://discord.gg/gqAnRyUXG8");
		});
	});
});
