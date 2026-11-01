import type * as Port from "#shared/utils/dashboard-access";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { resolve } from "node:path";
import {
	createAccessEntry,
	isAccessEntry,
	resolveAccess,
	type PermissionEntry,
} from "#shared/utils/dashboard-access";
import { describe, expect, it } from "vitest";

const USER = "100000000000000001";
const GUILD = "900000000000000001";
const HIGH = "300000000000000001";
const LOW = "300000000000000002";
const TIED = "300000000000000003";
const OTHER = "300000000000000004";

const guildRoles = [
	{ id: GUILD, position: 0 },
	{ id: LOW, position: 1 },
	{ id: TIED, position: 1 },
	{ id: HIGH, position: 5 },
	{ id: OTHER, position: 9 },
];

const legacy: PermissionEntry = { id: HIGH, allow: ["settings"], deny: [] };

const cases: [
	name: string,
	roleIds: readonly string[],
	users: readonly PermissionEntry[],
	roles: readonly PermissionEntry[],
][] = [
	["no rule", [HIGH], [], []],
	["a legacy node, which is no rule", [HIGH], [legacy], [legacy]],
	[
		"their own allow over a role's deny",
		[HIGH],
		[createAccessEntry(USER, "allow")],
		[createAccessEntry(HIGH, "deny")],
	],
	[
		"their own deny over a role's allow",
		[HIGH],
		[createAccessEntry(USER, "deny")],
		[createAccessEntry(HIGH, "allow")],
	],
	[
		"the highest role with a rule",
		[LOW, HIGH],
		[],
		[createAccessEntry(LOW, "allow"), createAccessEntry(HIGH, "deny")],
	],
	[
		"the higher id of two roles at a position",
		[LOW, TIED],
		[],
		[createAccessEntry(LOW, "allow"), createAccessEntry(TIED, "deny")],
	],
	["a rule on a role they do not hold", [LOW], [], [createAccessEntry(OTHER, "deny")]],
	["a rule on @everyone", [GUILD, LOW], [], [createAccessEntry(GUILD, "deny")]],
	[
		"a role over @everyone",
		[GUILD, LOW],
		[],
		[createAccessEntry(GUILD, "deny"), createAccessEntry(LOW, "allow")],
	],
	[
		"a rule on a role the guild no longer has",
		[HIGH],
		[],
		[createAccessEntry("300000000000000099", "deny")],
	],
];

// The bot's sources cannot be imported from here (see `AGENTS.md`), which is why
// `shared/utils/dashboard-access.ts` is a port. `settings/access.ts` only has
// type imports, so it runs once they are stripped, and it is read from the
// pinned bot commit. It is not transformed by Vite, which would load the
// tsconfig of the bot's project, and that extends a package this app lacks.
const source = readFileSync(
	resolve(process.cwd(), "vendor/wolfstar/projects/database/src/settings/access.ts"),
	"utf8",
);
const encoded = Buffer.from(stripTypeScriptTypes(source)).toString("base64");
const bot = (await import(
	/* @vite-ignore */ `data:text/javascript;base64,${encoded}`
)) as typeof Port;

describe("the port of the bot's dashboard access rules", () => {
	it.each(cases)("decides as the bot does: %s", (_name, roleIds, users, roles) => {
		const subject = { userId: USER, roleIds };

		expect(resolveAccess(subject, { users, roles }, guildRoles)).toBe(
			bot.resolveAccess(subject, { users, roles }, guildRoles),
		);
	});

	it("stores what the bot stores, and tells it apart the same way", () => {
		expect(createAccessEntry(HIGH, "deny")).toStrictEqual(bot.createAccessEntry(HIGH, "deny"));
		expect(isAccessEntry(legacy)).toBe(bot.isAccessEntry(legacy));
		expect(isAccessEntry(createAccessEntry(HIGH, "allow"))).toBe(
			bot.isAccessEntry(createAccessEntry(HIGH, "allow")),
		);
	});
});
