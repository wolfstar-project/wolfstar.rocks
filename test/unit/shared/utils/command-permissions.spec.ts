import type { CommandRule } from "#shared/utils/command-rules";
import {
	allChannelsId,
	applyChanges,
	assertOverwriteLimit,
	changedRows,
	commandDiscordState,
	commandRuleOverwrites,
	diffOverwrites,
	everyoneId,
	isAppDefault,
	MAXIMUM_COMMAND_OVERWRITES,
	OverwriteLimitError,
	overwritesEqual,
	snapshotOf,
	usesAppDefault,
	type Overwrite,
} from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";
import { describe, expect, it } from "vitest";

function thrownBy(run: () => void): unknown {
	try {
		run();
	} catch (error) {
		return error;
	}
	return null;
}

const GUILD = "110000000000000000";
const APP = "500000000000000001";
const ROLE_A = "300000000000000001";
const ROLE_B = "300000000000000002";
const CHANNEL_X = "400000000000000001";

const role = (id: string, permission: boolean): Overwrite => ({
	id,
	type: ApplicationCommandPermissionType.Role,
	permission,
});
const channel = (id: string, permission: boolean): Overwrite => ({
	id,
	type: ApplicationCommandPermissionType.Channel,
	permission,
});

describe("constants", () => {
	it("uses the guild id for @everyone and the id before it for every channel", () => {
		expect(everyoneId(GUILD)).toBe(GUILD);
		expect(allChannelsId(GUILD)).toBe("109999999999999999");
	});
});

describe("applyChanges", () => {
	const current = [role(ROLE_A, true), channel(CHANNEL_X, false)];

	it("keeps every row Discord has when one is added", () => {
		const next = applyChanges(current, [{ kind: "set", row: role(ROLE_B, false) }]);
		expect(overwritesEqual(next, [...current, role(ROLE_B, false)])).toBe(true);
	});

	it("flips a row in place and keeps the others", () => {
		const next = applyChanges(current, [{ kind: "set", row: role(ROLE_A, false) }]);
		expect(overwritesEqual(next, [role(ROLE_A, false), channel(CHANNEL_X, false)])).toBe(true);
	});

	it("removes one row", () => {
		const next = applyChanges(current, [
			{ kind: "remove", id: CHANNEL_X, type: ApplicationCommandPermissionType.Channel },
		]);
		expect(next).toEqual([role(ROLE_A, true)]);
	});

	it("empties the set to use the app default", () => {
		expect(applyChanges(current, [{ kind: "reset" }])).toEqual([]);
	});

	it("does not throw past the limit, so a draft can show it", () => {
		const many = Array.from({ length: 101 }, (_, index) => ({
			kind: "set" as const,
			row: role(String(300000000000000100n + BigInt(index)), true),
		}));
		expect(applyChanges([], many)).toHaveLength(101);
	});
});

describe("overwritesEqual", () => {
	it("ignores the order of the rows", () => {
		expect(
			overwritesEqual(
				[role(ROLE_A, true), role(ROLE_B, false)],
				[role(ROLE_B, false), role(ROLE_A, true)],
			),
		).toBe(true);
	});

	it("sees a flipped permission", () => {
		expect(overwritesEqual([role(ROLE_A, true)], [role(ROLE_A, false)])).toBe(false);
	});

	it("collapses duplicates before comparing", () => {
		expect(
			overwritesEqual([role(ROLE_A, true), role(ROLE_A, true)], [role(ROLE_A, true)]),
		).toBe(true);
	});
});

describe("assertOverwriteLimit", () => {
	const rows = (count: number) =>
		Array.from({ length: count }, (_, index) =>
			role(String(300000000000000100n + BigInt(index)), true),
		);

	it("lets 100 rows through", () => {
		expect(MAXIMUM_COMMAND_OVERWRITES).toBe(100);
		expect(() => assertOverwriteLimit(rows(100))).not.toThrow();
	});

	it("refuses 101 rows and says how many", () => {
		const error = thrownBy(() => assertOverwriteLimit(rows(101)));
		expect(error).toBeInstanceOf(OverwriteLimitError);
		expect((error as OverwriteLimitError).count).toBe(101);
	});
});

describe("diffOverwrites", () => {
	it("tells added, removed and flipped rows apart", () => {
		const diff = diffOverwrites(
			[role(ROLE_A, true), channel(CHANNEL_X, false)],
			[role(ROLE_A, false), role(ROLE_B, true)],
		);
		expect(diff).toEqual({
			added: [role(ROLE_B, true)],
			removed: [channel(CHANNEL_X, false)],
			flipped: [role(ROLE_A, false)],
		});
	});
});

describe("app default", () => {
	it("is the set keyed by the application id", () => {
		expect(isAppDefault(APP, APP)).toBe(true);
		expect(isAppDefault("600000000000000001", APP)).toBe(false);
	});

	it("is what a command without rows of its own uses", () => {
		expect(usesAppDefault([])).toBe(true);
		expect(usesAppDefault(undefined)).toBe(true);
		expect(usesAppDefault([role(ROLE_A, true)])).toBe(false);
	});
});

describe("snapshotOf", () => {
	it("is the same for the same sets in any order", () => {
		const one = snapshotOf({ b: [role(ROLE_A, true), role(ROLE_B, false)], a: [] });
		const two = snapshotOf({ a: [], b: [role(ROLE_B, false), role(ROLE_A, true)] });
		expect(one).toBe(two);
		expect(snapshotOf({ a: [role(ROLE_A, false)] })).not.toBe(
			snapshotOf({ a: [role(ROLE_A, true)] }),
		);
	});
});

describe("changedRows", () => {
	it("is the rows a write adds or flips, not the ones it keeps or drops", () => {
		const before = [role(ROLE_A, true), channel(CHANNEL_X, false)];
		const after = [role(ROLE_A, false), role(ROLE_B, true)];
		expect(changedRows(before, after)).toEqual([role(ROLE_A, false), role(ROLE_B, true)]);
		expect(changedRows(before, before)).toEqual([]);
	});
});

const USER_A = "500000000000000101";
const USER_B = "500000000000000102";
const CHANNEL_Y = "400000000000000002";

const user = (id: string, permission: boolean): Overwrite => ({
	id,
	type: ApplicationCommandPermissionType.User,
	permission,
});

function rule(lists: Partial<Omit<CommandRule, "command">> = {}): CommandRule {
	return {
		command: "ban",
		allowedChannels: [],
		ignoredChannels: [],
		allowedRoles: [],
		ignoredRoles: [],
		allowedUsers: [],
		ignoredUsers: [],
		...lists,
	};
}

describe("commandRuleOverwrites", () => {
	it("makes nothing of a rule that rules nothing", () => {
		expect(commandRuleOverwrites(rule(), GUILD)).toEqual([]);
	});

	it("allows what the rule allows and denies what it ignores, one row each", () => {
		const rows = commandRuleOverwrites(
			rule({
				allowedRoles: [ROLE_A],
				ignoredRoles: [ROLE_B],
				allowedUsers: [USER_A],
				ignoredUsers: [USER_B],
				ignoredChannels: [CHANNEL_Y],
			}),
			GUILD,
		);
		expect(
			overwritesEqual(rows, [
				role(ROLE_A, true),
				role(ROLE_B, false),
				user(USER_A, true),
				user(USER_B, false),
				channel(CHANNEL_Y, false),
			]),
		).toBe(true);
		expect(rows).toHaveLength(5);
	});

	it("denies @everyone when only the allowed may run it", () => {
		const rows = commandRuleOverwrites(
			rule({ allowedRoles: [ROLE_A], ignoredRoles: [GUILD] }),
			GUILD,
		);
		expect(rows).toContainEqual(role(everyoneId(GUILD), false));
		expect(rows).toHaveLength(2);
	});

	it("denies All channels besides the allowed ones", () => {
		const rows = commandRuleOverwrites(rule({ allowedChannels: [CHANNEL_X] }), GUILD);
		expect(
			overwritesEqual(rows, [channel(CHANNEL_X, true), channel(allChannelsId(GUILD), false)]),
		).toBe(true);
	});

	it("denies an id the rule both allows and ignores, as the bot reads ignored first", () => {
		const rows = commandRuleOverwrites(
			rule({ allowedRoles: [ROLE_A], ignoredRoles: [ROLE_A] }),
			GUILD,
		);
		expect(rows).toEqual([role(ROLE_A, false)]);
	});

	it("counts what Discord keeps against the limit", () => {
		const roles = Array.from({ length: 99 }, (_, index) =>
			String(300000000000000100n + BigInt(index)),
		);
		const rows = commandRuleOverwrites(
			rule({ allowedRoles: roles, allowedChannels: [CHANNEL_X] }),
			GUILD,
		);
		// 99 roles, the channel, and All channels.
		expect(rows).toHaveLength(MAXIMUM_COMMAND_OVERWRITES + 1);
	});
});

describe("commandDiscordState", () => {
	const ruled = rule({ allowedRoles: [ROLE_A] });

	it("is off while the command has no permissions of its own", () => {
		expect(commandDiscordState(undefined, ruled, GUILD)).toBe("off");
		expect(commandDiscordState([], ruled, GUILD)).toBe("off");
	});

	it("matches when Discord holds the rule's rows, in any order", () => {
		expect(commandDiscordState([role(ROLE_A, true)], ruled, GUILD)).toBe("matching");
	});

	it("differs when the rows were changed in Discord", () => {
		expect(commandDiscordState([role(ROLE_A, false)], ruled, GUILD)).toBe("different");
		expect(commandDiscordState([role(ROLE_A, true), role(ROLE_B, true)], ruled, GUILD)).toBe(
			"different",
		);
	});
});
