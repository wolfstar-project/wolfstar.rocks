import type { GuildData } from "#server/database";
import { beforeEach, describe, expect, it } from "vitest";

const GUILD_A = "111111111111111111";
const GUILD_B = "222222222222222222";

describe("useActiveGuild", () => {
	beforeEach(() => {
		clearNuxtState();
	});

	it("starts with no guild and the Home section", () => {
		const { activeGuildId, section } = useActiveGuild();

		expect(activeGuildId.value).toBeNull();
		expect(section.value).toBe("");
	});

	it("selects only well-formed snowflakes and returns to Home on a switch", () => {
		const { activeGuildId, section, selectGuild, setSection } = useActiveGuild();

		selectGuild(GUILD_A);
		setSection("roles");
		expect(section.value).toBe("roles");

		selectGuild("not-a-snowflake");
		expect(activeGuildId.value).toBeNull();
		expect(section.value).toBe("");

		selectGuild(GUILD_B);
		expect(activeGuildId.value).toBe(GUILD_B);
	});

	it("keeps settings and staged changes apart per guild", () => {
		const { selectGuild } = useActiveGuild();
		const { originalGuildSettings, setGuildSettings } = useGuildSettings();
		const { guildSettingsChanges, setGuildSettingsChanges } = useGuildSettingsChanges();

		selectGuild(GUILD_A);
		setGuildSettings({ prefix: "a!" } as GuildData);
		setGuildSettingsChanges({ prefix: "b!" });

		selectGuild(GUILD_B);
		expect(originalGuildSettings.value).toBeUndefined();
		expect(guildSettingsChanges.value).toBeUndefined();

		selectGuild(GUILD_A);
		expect(originalGuildSettings.value?.prefix).toBe("a!");
		expect(guildSettingsChanges.value?.prefix).toBe("b!");
	});
});

describe("useDashboardNavigation", () => {
	beforeEach(() => {
		clearNuxtState();
	});

	it("switches sections directly when nothing is staged", () => {
		const { selectGuild } = useActiveGuild();
		const { goToSection, pendingNavigation, section } = useDashboardNavigation();

		selectGuild(GUILD_A);
		goToSection("channels");

		expect(section.value).toBe("channels");
		expect(pendingNavigation.value).toBeNull();
	});

	it("parks a switch while changes are staged until it is confirmed or cancelled", () => {
		const { selectGuild } = useActiveGuild();
		const { setGuildSettingsChanges } = useGuildSettingsChanges();
		const {
			activeGuildId,
			cancelPendingNavigation,
			confirmPendingNavigation,
			goToGuild,
			goToSection,
			hasStagedChanges,
			pendingNavigation,
			section,
		} = useDashboardNavigation();

		selectGuild(GUILD_A);
		setGuildSettingsChanges({ prefix: "b!" });
		expect(hasStagedChanges.value).toBe(true);

		goToSection("events");
		expect(section.value).toBe("");
		expect(pendingNavigation.value).toStrictEqual({ section: "events" });

		cancelPendingNavigation();
		expect(pendingNavigation.value).toBeNull();
		expect(section.value).toBe("");

		goToGuild(GUILD_B);
		expect(activeGuildId.value).toBe(GUILD_A);
		expect(pendingNavigation.value).toStrictEqual({ guildId: GUILD_B });

		confirmPendingNavigation();
		expect(activeGuildId.value).toBe(GUILD_B);
		expect(pendingNavigation.value).toBeNull();
	});
});
