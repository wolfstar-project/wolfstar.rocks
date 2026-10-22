import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { ChannelType } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import General from "~/components/guild/settings/General.vue";
import { mapLanguageKeysToNames } from "~/utils/guild-languages";
import {
	createMockChannel,
	createMockOauthFlattenedGuild,
	createMockRole,
} from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const createInitialGuildSettings = () =>
	createMockGuildData("123456789012345678", {
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
// Two members' reports wait for a moderator; the tile reads only the count.
registerEndpoint("/api/guilds/123456789012345678/reports", () => ({ entries: [], total: 2 }));

// UChart's tooltip needs the UApp provider the real app wraps every page in.
const chartStub = { stubs: { UChart: true } };

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
		mapToGuildData: (formState: {
			language: { label: string; value: string };
		}) => Partial<GuildData>;
		state: {
			language: { label: string; value: string };
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

	it("renders the language select and no prefix field", async () => {
		const wrapper = await mountSuspended(General, {
			global: chartStub,
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		// V7 is slash-command only: the bot has no prefix setting any more.
		expect(wrapper.find("input#prefix").exists()).toBe(false);
		expect(wrapper.text()).toContain("Language");
		expect(wrapper.html()).toContain("language");
	});

	it("initializes state from guildSettings", async () => {
		const wrapper = await mountSuspended(General, {
			global: chartStub,
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		expect(getSetupState(wrapper).state.language).toStrictEqual({
			label: "English, United States",
			value: "en-US",
		});
	});

	it("mapToGuildData correctly transforms form state", async () => {
		const wrapper = await mountSuspended(General, {
			global: chartStub,
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		const setupState = getSetupState(wrapper);
		setupState.state.language = { label: "German", value: "de-DE" };
		await nextTick();

		// The form owns both settings, and stages only the one that changed.
		expect(setupState.mapToGuildData(setupState.state)).toStrictEqual({
			language: "de-DE",
			timezone: "UTC",
		});
		expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({ language: "de-DE" });
	});

	it("maps language keys to display names correctly", () => {
		expect(mapLanguageKeysToNames("en-US")).toStrictEqual([
			"American English",
			"English, United States",
		]);
		expect(mapLanguageKeysToNames("de-DE")).toStrictEqual(["Deutsch", "German"]);
		expect(mapLanguageKeysToNames("unknown-key")).toStrictEqual(["unknown-key"]);
	});

	it("renders language options from prop", async () => {
		const wrapper = await mountSuspended(General, {
			global: chartStub,
			props: {
				languages: ["en-US", "es-ES", "de-DE"],
			},
		});

		await nextTick();

		// The select shows each language by its English name and flag, with the
		// native name and the tag the bot stores set beside it.
		const select = wrapper.findComponent({ name: "SelectBase" });

		expect(select.exists()).toBeTruthy();
		expect(select.props("options")).toStrictEqual([
			{
				flag: "/flags/en-US.svg",
				label: "English, United States",
				note: "American English \u00B7 en-US",
				value: "en-US",
			},
			{
				flag: "/flags/es-ES.svg",
				label: "Spanish",
				note: "Espa\u00F1ol \u00B7 es-ES",
				value: "es-ES",
			},
			{
				flag: "/flags/de.svg",
				label: "German",
				note: "Deutsch \u00B7 de-DE",
				value: "de-DE",
			},
		]);
	});

	it("plots the last seven days of moderation actions as a bar chart", async () => {
		const wrapper = await mountSuspended(General, {
			global: chartStub,
			props: { languages: ["en-US"] },
		});

		await nextTick();

		const chart = wrapper.findComponent({ name: "UChart" });
		expect(chart.exists()).toBe(true);
		expect(chart.props("type")).toBe("bar");
		expect(chart.props("index")).toBe("label");
		expect(chart.props("data")).toHaveLength(7);
	});

	describe("information section", () => {
		it("renders server statistics from guildData", async () => {
			const wrapper = await mountSuspended(General, {
				global: chartStub,
				props: { languages: ["en-US"] },
			});

			await nextTick();

			const stats = wrapper.findAll("dl > div").map((card) => ({
				label: card.find("dt").text(),
				value: card.find("dd").text(),
			}));

			expect(stats.map((stat) => stat.label)).toStrictEqual([
				"Members",
				"Cases",
				"AutoMod hits",
				"Open reports",
				"Commands",
				"Channels",
				"Roles",
			]);
			expect(stats.find((stat) => stat.label === "Members")?.value).toBe("42");
			// Nothing counts these yet, so it says so instead of showing a number.
			expect(stats.find((stat) => stat.label === "AutoMod hits")?.value).toBe("—");
			await vi.waitFor(() => {
				const openReports = wrapper
					.findAll("dl > div")
					.find((card) => card.find("dt").text() === "Open reports");
				expect(openReports?.find("dd").text()).toBe("2");
			});
			// Three channels besides the category, which has its own note.
			expect(stats.find((stat) => stat.label === "Channels")?.value).toBe("3");
			expect(wrapper.text()).toContain("1 category");
			expect(stats.find((stat) => stat.label === "Roles")?.value).toBe("2");
		});

		it("edits the time zone of the server and tells the time it is there", async () => {
			const wrapper = await mountSuspended(General, {
				global: chartStub,
				props: { languages: ["en-US"] },
			});

			await nextTick();

			const timeZone = wrapper
				.findAllComponents({ name: "SelectBase" })
				.find((select) => select.props("ariaLabel") === "Time zone");
			expect(timeZone?.props("modelValue")).toBe("UTC");
			expect(wrapper.find("#timezone-now").text()).toContain("there now.");

			timeZone?.vm.$emit("update:modelValue", "Europe/Rome");
			await nextTick();
			await nextTick();

			expect(mockSetGuildSettingsChanges).toHaveBeenLastCalledWith({
				timezone: "Europe/Rome",
			});
		});

		it("calls copy with server id and toast options when Copy Server ID is clicked", async () => {
			const wrapper = await mountSuspended(General, {
				global: chartStub,
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
				global: chartStub,
				props: { languages: ["en-US"] },
			});

			await nextTick();

			expect(wrapper.html()).toContain("Copied!");
		});

		it("renders Need Help? link pointing to support Discord", async () => {
			const wrapper = await mountSuspended(General, {
				global: chartStub,
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
