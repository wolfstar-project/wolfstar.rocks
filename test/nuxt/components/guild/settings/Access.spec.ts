import type { GuildData } from "#server/database";
import { mockNuxtImport, mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Access from "~/components/guild/settings/Access.vue";
import { createMockOauthFlattenedGuild } from "~~/test/mocks/discord";
import { createMockGuildData } from "~~/test/mocks/guildData";

const GUILD_ID = "123456789012345678";
const OWNER_ID = "987654321098765432";
const IMPORTABLE = "300000000000000001";
const STUCK = "300000000000000002";

const mockGuildSettings = ref<GuildData | undefined>(createMockGuildData(GUILD_ID));
const currentUserId = ref<string>(OWNER_ID);

const mockOriginalSettings = ref<GuildData | undefined>(mockGuildSettings.value);
const mockSetGuildSettings = vi.fn();
const mockStagedChanges = ref<GuildData | undefined>(undefined);
const mockMergeGuildSettings = vi.fn();

mockNuxtImport("useGuildSettings", () => () => ({
	guildSettings: mockGuildSettings,
	originalGuildSettings: mockOriginalSettings,
	setGuildSettings: mockSetGuildSettings,
}));

mockNuxtImport("useGuildSettingsChanges", () => () => ({
	guildSettingsChanges: mockStagedChanges,
	mergeGuildSettings: mockMergeGuildSettings,
	setGuildSettingsChanges: vi.fn(),
	removeChange: vi.fn(),
	resetGuildSettingsChanges: vi.fn(),
	resetCounter: ref(0),
}));

mockNuxtImport("useGuildData", () => () => ({
	guildData: ref(createMockOauthFlattenedGuild({ id: GUILD_ID, ownerId: OWNER_ID })),
}));

mockNuxtImport("useDiscordAccount", () => () => ({
	discordUser: computed(() => ({ id: currentUserId.value })),
}));

registerEndpoint(`/api/guilds/${GUILD_ID}/members/search`, { method: "GET", handler: () => [] });

function withNodes(roles: GuildData["permissionsRoles"]) {
	mockGuildSettings.value = createMockGuildData(GUILD_ID, { permissionsRoles: roles });
}

// Accessibility audits for GuildSettingsAccess live in test/nuxt/a11y.spec.ts.
describe("GuildSettingsAccess", () => {
	beforeEach(() => {
		currentUserId.value = OWNER_ID;
		withNodes([]);
		useActiveGuild().selectGuild(GUILD_ID);
	});

	it("says who opens the dashboard without a rule", async () => {
		const wrapper = await mountSuspended(Access);
		expect(wrapper.text()).toContain("Manage Server or Administrator");
	});

	it("warns that an allow opens the dashboard without Manage Server", async () => {
		const wrapper = await mountSuspended(Access);
		expect(wrapper.text()).toContain("without Manage Server");
	});

	it("offers to import a legacy node on settings and names what it drops", async () => {
		withNodes([{ id: IMPORTABLE, allow: ["settings", "ban"], deny: [] }]);
		const wrapper = await mountSuspended(Access);
		expect(wrapper.find(`button[data-import="${IMPORTABLE}"]`).exists()).toBe(true);
		expect(wrapper.text()).toContain("ban");
	});

	it("lists a legacy node it cannot convert, with the JSON download", async () => {
		withNodes([{ id: STUCK, allow: ["Moderation.*"], deny: [] }]);
		const wrapper = await mountSuspended(Access);
		expect(wrapper.find(`button[data-import="${STUCK}"]`).exists()).toBe(false);
		expect(wrapper.text()).toContain("Moderation.*");
		expect(wrapper.text()).toContain("Download legacy nodes as JSON");
	});

	it("offers the removal of legacy nodes to the owner only", async () => {
		withNodes([{ id: STUCK, allow: ["Moderation.*"], deny: [] }]);
		const asOwner = await mountSuspended(Access);
		expect(asOwner.text()).toContain("Remove legacy nodes");

		currentUserId.value = "111111111111111111";
		const asAdmin = await mountSuspended(Access);
		expect(asAdmin.text()).not.toContain("Remove legacy nodes");
	});

	it("leaves allow imports to a click of their own, with the Manage Server warning", async () => {
		const DENIED = "300000000000000004";
		withNodes([
			{ id: IMPORTABLE, allow: ["*"], deny: [] },
			{ id: DENIED, allow: [], deny: ["settings"] },
		]);
		const wrapper = await mountSuspended(Access);
		const allowRow = wrapper.get(`[data-legacy="${IMPORTABLE}"]`);
		expect(allowRow.text()).toContain("without Manage Server");

		await wrapper.get("button[data-import-all]").trigger("click");
		expect(wrapper.find(`button[data-import="${DENIED}"]`).exists()).toBe(false);
		expect(wrapper.find(`button[data-import="${IMPORTABLE}"]`).exists()).toBe(true);
	});

	it("removes the legacy nodes from the staged edits and the server they belong to", async () => {
		const OTHER_GUILD = "223456789012345678";
		const legacy = { id: STUCK, allow: ["Moderation.*"], deny: [] };
		const rule = { id: IMPORTABLE, allow: [], deny: [], dashboard: "allow" as const };
		withNodes([legacy]);
		mockOriginalSettings.value = mockGuildSettings.value;
		mockStagedChanges.value = { permissionsRoles: [rule, legacy] } as unknown as GuildData;
		registerEndpoint(`/api/guilds/${GUILD_ID}/access/legacy`, {
			method: "DELETE",
			handler: () => {
				// The admin switches servers while the removal is on its way.
				mockOriginalSettings.value = createMockGuildData(OTHER_GUILD);
				return { removed: 1 };
			},
		});

		const wrapper = await mountSuspended(Access);
		await wrapper
			.findAll("button")
			.find((button) => button.text() === "Remove legacy nodes")!
			.trigger("click");
		await vi.waitFor(() =>
			expect(document.querySelector("input[autocomplete='off']")).not.toBeNull(),
		);
		const input = document.querySelector("input[autocomplete='off']") as HTMLInputElement;
		input.value = "REMOVE";
		input.dispatchEvent(new Event("input"));
		await vi.waitFor(() => {
			const submit = [...document.querySelectorAll("button")]
				.filter((button) => button.textContent?.trim() === "Remove legacy nodes")
				.at(-1) as HTMLButtonElement;
			expect(submit.disabled).toBe(false);
		});
		(
			[...document.querySelectorAll("button")]
				.filter((button) => button.textContent?.trim() === "Remove legacy nodes")
				.at(-1) as HTMLButtonElement
		).click();

		await vi.waitFor(() => expect(mockSetGuildSettings).toHaveBeenCalled());
		const [savedSettings, savedFor] = mockSetGuildSettings.mock.calls.at(-1)!;
		expect(savedFor).toBe(GUILD_ID);
		expect((savedSettings as GuildData).id).toBe(GUILD_ID);
		expect(mockMergeGuildSettings).toHaveBeenCalledWith({ permissionsRoles: [rule] }, GUILD_ID);
		wrapper.unmount();
	});
});
