import type { GuildData } from "#server/database";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD_ID = "123456789012345678";
const LINKED_GUILD = "254360814063058944";

const mockIsPhone = ref(false);
const mockOpenPage = vi.fn();

mockNuxtImport("usePhoneScreen", () => () => ({
	isPhone: mockIsPhone,
	openList: vi.fn(),
	openPage: mockOpenPage,
	screen: ref("list"),
}));

describe("useAppealLink", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		clearNuxtState();
		mockIsPhone.value = false;
	});

	it("opens the Home on the appeals of the linked server", () => {
		useActiveGuild().selectGuild(GUILD_ID);

		useAppealLink().open(LINKED_GUILD);

		expect(useActiveGuild().activeGuildId.value).toBeNull();
		expect(useDirectMessages().page.value).toBe("appeals");
		expect(useDirectMessages().appealGuildId.value).toBe(LINKED_GUILD);
	});

	it("lists every server when the link names none, or not a server", () => {
		useAppealLink().open("not-a-snowflake");

		expect(useDirectMessages().page.value).toBe("appeals");
		expect(useDirectMessages().appealGuildId.value).toBeFalsy();
	});

	it("asks before leaving a server with staged changes, and lands on the appeals once confirmed", () => {
		const { selectGuild, pendingNavigation, activeGuildId } = useActiveGuild();
		selectGuild(GUILD_ID);
		useGuildSettings().setGuildSettings({ language: "en-US" } as GuildData);
		useGuildSettingsChanges().setGuildSettingsChanges({ language: "de-DE" });

		useAppealLink().open(LINKED_GUILD);

		expect(activeGuildId.value).toBe(GUILD_ID);
		expect(pendingNavigation.value).toStrictEqual({ guildId: null });

		useDashboardNavigation().confirmPendingNavigation();
		expect(activeGuildId.value).toBeNull();
		expect(useDirectMessages().page.value).toBe("appeals");
	});

	it("opens the page, not the list, on a phone", () => {
		mockIsPhone.value = true;

		useAppealLink().showPage();

		expect(mockOpenPage).toHaveBeenCalledTimes(1);
	});

	it("leaves a larger screen as it is", () => {
		useAppealLink().showPage();

		expect(mockOpenPage).not.toHaveBeenCalled();
	});
});
