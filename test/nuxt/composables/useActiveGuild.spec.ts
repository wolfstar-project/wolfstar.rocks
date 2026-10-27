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
		setGuildSettings({ language: "de-DE" } as GuildData);
		setGuildSettingsChanges({ language: "it-IT" });

		selectGuild(GUILD_B);
		expect(originalGuildSettings.value).toBeUndefined();
		expect(guildSettingsChanges.value).toBeUndefined();

		selectGuild(GUILD_A);
		expect(originalGuildSettings.value?.language).toBe("de-DE");
		expect(guildSettingsChanges.value?.language).toBe("it-IT");
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

	it("parks a guild switch while changes are staged until it is confirmed or cancelled", () => {
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
		setGuildSettingsChanges({ language: "it-IT" });
		expect(hasStagedChanges.value).toBe(true);

		// Staged edits follow the admin across the sections of one guild.
		goToSection("events");
		expect(section.value).toBe("events");
		expect(pendingNavigation.value).toBeNull();

		goToGuild(GUILD_B);
		expect(activeGuildId.value).toBe(GUILD_A);
		expect(pendingNavigation.value).toStrictEqual({ guildId: GUILD_B });

		cancelPendingNavigation();
		expect(pendingNavigation.value).toBeNull();
		expect(activeGuildId.value).toBe(GUILD_A);

		goToGuild(GUILD_B);

		confirmPendingNavigation();
		expect(activeGuildId.value).toBe(GUILD_B);
		expect(pendingNavigation.value).toBeNull();
	});

	it("counts staged command permission edits as unsaved, per guild", () => {
		const { selectGuild } = useActiveGuild();
		const { drafts, discardAll } = useCommandPermissionDrafts();
		const { goToGuild, hasStagedChanges, pendingNavigation } = useDashboardNavigation();

		selectGuild(GUILD_A);
		drafts.value = {
			"600000000000000001": {
				rows: [{ id: "300000000000000001", type: 1, permission: true }],
				base: [],
			},
		};
		expect(hasStagedChanges.value).toBe(true);

		goToGuild(GUILD_B);
		expect(pendingNavigation.value).toStrictEqual({ guildId: GUILD_B });

		// The edits belong to the guild they were made in.
		const otherGuild = useCommandPermissionDrafts(GUILD_B);
		expect(otherGuild.drafts.value).toStrictEqual({});

		discardAll();
		expect(hasStagedChanges.value).toBe(false);
	});

	it("settles a save in the guild it was sent to, keeping edits made meanwhile", () => {
		const COMMAND_X = "600000000000000001";
		const COMMAND_Y = "600000000000000002";
		const row = (id: string) => ({ id, type: 1 as const, permission: true });
		const { selectGuild } = useActiveGuild();
		const guildA = useCommandPermissionDrafts(GUILD_A);
		const guildB = useCommandPermissionDrafts(GUILD_B);

		selectGuild(GUILD_A);
		guildA.drafts.value = {
			[COMMAND_X]: { rows: [row("300000000000000001")], base: [] },
			[COMMAND_Y]: { rows: [row("300000000000000002")], base: [] },
		};
		const staged = { ...guildA.drafts.value };

		// While A's save runs: the admin moves to B and edits the same command,
		// and A's second command is edited again.
		selectGuild(GUILD_B);
		guildB.drafts.value = { [COMMAND_X]: { rows: [row("300000000000000003")], base: [] } };
		guildA.drafts.value = {
			...guildA.drafts.value,
			[COMMAND_Y]: { rows: [row("300000000000000004")], base: [] },
		};

		guildA.settle(GUILD_A, staged, [COMMAND_X, COMMAND_Y]);

		// The newer edit is kept, and checked next against the rows this save wrote.
		expect(guildA.drafts.value).toStrictEqual({
			[COMMAND_Y]: { rows: [row("300000000000000004")], base: [row("300000000000000002")] },
		});
		expect(guildB.drafts.value[COMMAND_X]?.rows).toStrictEqual([row("300000000000000003")]);
	});
});
