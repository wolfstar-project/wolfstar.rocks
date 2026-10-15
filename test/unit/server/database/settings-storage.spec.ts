import type { Database } from "#server/database/prisma";
import { Tables, type TableName } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import { fetchGuildData, writeGuildData } from "#server/database/settings/storage";
import { describe, expect, it, vi } from "vitest";

const GUILD_ID = "123456789012345678";
const CHANNEL = "234567890123456789";
const ROLE = "345678901234567890";

type Row = Record<string, unknown>;

/**
 * A stand-in for the ORM surface the storage layer uses: `first` and `upsert`
 * per settings table, plus the `StickyRole` collection.
 */
function createOrm(rows: Partial<Record<TableName, Row>> = {}, stickyRoles: Row[] = []) {
	const upserts: { table: TableName; create: Row; update: Row }[] = [];
	const stickyRole = {
		where: vi.fn(() => ({
			all: vi.fn().mockResolvedValue(stickyRoles),
			deleteAndCount: vi.fn().mockResolvedValue(stickyRoles.length),
		})),
		createAndCount: vi.fn().mockResolvedValue(0),
	};

	const publicNamespace: Record<string, unknown> = { StickyRole: stickyRole };
	for (const table of Tables) {
		publicNamespace[table] = {
			first: vi.fn().mockResolvedValue(rows[table] ?? null),
			upsert: vi.fn((input: { create: Row; update: Row }) => {
				upserts.push({ table, ...input });
				return Promise.resolve({});
			}),
		};
	}

	const orm = { public: publicNamespace } as unknown as Database["orm"];
	const db = {
		orm,
		transaction: vi.fn(async (fn: (tx: { orm: Database["orm"] }) => Promise<void>) =>
			fn({ orm }),
		),
	} as unknown as Database;

	return { db, orm, stickyRole, upserts };
}

describe("fetchGuildData", () => {
	it("returns null when the guild has no Guild row yet", async () => {
		const { orm } = createOrm();
		await expect(fetchGuildData(orm, GUILD_ID)).resolves.toBeNull();
	});

	it("flattens the tables into GuildData and converts BIGINT to strings", async () => {
		const { orm } = createOrm(
			{
				Guild: { id: BigInt(GUILD_ID), language: "fr-FR" },
				Modules: {
					id: BigInt(GUILD_ID),
					automod: false,
					moderation: true,
					logs: true,
					commands: true,
					roles: true,
				},
				GuildLogs: {
					id: BigInt(GUILD_ID),
					memberAdd: BigInt(CHANNEL),
					ignoreAll: [],
					ignoreMessages: [],
					ignoreReactions: [],
				},
				GuildRoles: {
					id: BigInt(GUILD_ID),
					admin: [BigInt(ROLE)],
					initial: [],
					initialHumans: [],
					initialRobots: [],
					moderator: [],
					muted: null,
					public: [],
					uniqueRoleSets: [],
				},
			},
			[{ userId: BigInt(ROLE), guildId: BigInt(GUILD_ID), roleIds: [BigInt(ROLE)] }],
		);

		const data = await fetchGuildData(orm, GUILD_ID);

		expect(data).toMatchObject({
			id: GUILD_ID,
			language: "fr-FR",
			modulesAutomod: false,
			logsMemberAdd: CHANNEL,
			rolesAdmin: [ROLE],
			rolesMuted: null,
			stickyRoles: [{ user: ROLE, roles: [ROLE] }],
		});
	});

	it("keeps the defaults for the tables that have no row", async () => {
		const { orm } = createOrm({ Guild: { id: BigInt(GUILD_ID), language: "en-US" } });

		const data = await fetchGuildData(orm, GUILD_ID);

		expect(data).toMatchObject({ ...getDefaultGuildSettings(), id: GUILD_ID });
	});
});

describe("writeGuildData", () => {
	const settings = { ...getDefaultGuildSettings(), id: GUILD_ID };

	it("does nothing when no setting changed", async () => {
		const { db } = createOrm();
		await writeGuildData(db, settings, {});
		expect(db.transaction).not.toHaveBeenCalled();
	});

	it("writes the changed table and the chain of rows it references, in foreign-key order", async () => {
		const { db, upserts } = createOrm();
		const changes = { rolesAdmin: [ROLE] };

		await writeGuildData(db, { ...settings, ...changes }, changes);

		expect(db.transaction).toHaveBeenCalledOnce();
		// `GuildRoles` references `Modules`, which references `Guild`.
		expect(upserts.map((entry) => entry.table)).toStrictEqual([
			"Guild",
			"Modules",
			"GuildRoles",
		]);
	});

	it("updates only the changed columns but creates the row with every column", async () => {
		const { db, upserts } = createOrm();
		const changes = { rolesAdmin: [ROLE] };

		await writeGuildData(db, { ...settings, ...changes }, changes);

		const roles = upserts.find((entry) => entry.table === "GuildRoles")!;
		expect(roles.update).toStrictEqual({ admin: [BigInt(ROLE)] });
		expect(roles.create).toMatchObject({
			id: BigInt(GUILD_ID),
			admin: [BigInt(ROLE)],
			moderator: [],
			muted: null,
			removeInitial: false,
		});
	});

	it("gives a parent row that only has to exist something to set", async () => {
		const { db, upserts } = createOrm();
		const changes = { logsMemberAdd: CHANNEL };

		await writeGuildData(db, { ...settings, ...changes }, changes);

		const guild = upserts.find((entry) => entry.table === "Guild")!;
		expect(guild.update).toStrictEqual({ id: BigInt(GUILD_ID) });
	});

	it("touches Guild alone for a setting stored on it", async () => {
		const { db, upserts } = createOrm();
		const changes = { language: "de-DE" };

		await writeGuildData(db, { ...settings, ...changes }, changes);

		expect(upserts).toStrictEqual([
			{
				table: "Guild",
				create: { id: BigInt(GUILD_ID), language: "de-DE" },
				update: { language: "de-DE" },
			},
		]);
	});

	it("replaces the sticky roles of the guild", async () => {
		const { db, stickyRole } = createOrm();
		const changes = { stickyRoles: [{ user: ROLE, roles: [ROLE] }] };

		await writeGuildData(db, { ...settings, ...changes }, changes);

		expect(stickyRole.where).toHaveBeenCalledWith({ guildId: BigInt(GUILD_ID) });
		expect(stickyRole.createAndCount).toHaveBeenCalledWith([
			{ guildId: BigInt(GUILD_ID), userId: BigInt(ROLE), roleIds: [BigInt(ROLE)] },
		]);
	});
});
