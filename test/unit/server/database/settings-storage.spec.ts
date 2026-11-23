import type { Database } from "#server/database/prisma";
import contractJson from "#server/database/generated/prisma/contract.json" with { type: "json" };
import { Tables, type TableName } from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import { fetchGuildData, writeGuildData } from "#server/database/settings/storage";
import { describe, expect, it, vi } from "vitest";

const GUILD_ID = "123456789012345678";
const CHANNEL = "234567890123456789";
const ROLE = "345678901234567890";

type Row = Record<string, unknown>;

/** The column a model field is stored in, as the contract names it. */
function storageColumn(table: TableName, field: string): string {
	const fields: Record<string, { column: string }> =
		contractJson.domain.namespaces.public.models[table].storage.fields;
	return fields[field]?.column ?? field;
}

/**
 * A stand-in for the SQL builder the read of the settings goes through: it
 * records what each alias selects, and answers the joined row from `rows`
 * when the `Guild` table has one.
 */
function createSql(rows: Partial<Record<TableName, Row>>) {
	const values = new Map<string, unknown>();
	for (const [table, row] of Object.entries(rows) as [TableName, Row][]) {
		const tableName = contractJson.domain.namespaces.public.models[table].storage.table;
		for (const [field, value] of Object.entries(row)) {
			values.set(`${tableName}.${storageColumn(table, field)}`, value);
		}
	}

	const fields = new Proxy(
		{},
		{
			get: (_target, table) =>
				new Proxy({}, { get: (_inner, column) => `${String(table)}.${String(column)}` }),
		},
	);
	const fns = { eq: (left: unknown, right: unknown) => ({ left, right }) };
	interface RecordedQuery {
		joins: unknown[];
		selects: Map<string, string>;
		where: unknown;
	}
	const queries: RecordedQuery[] = [];

	const builder = () => {
		const query: RecordedQuery = { joins: [], selects: new Map<string, string>(), where: null };
		const chain = {
			outerLeftJoin(_other: unknown, on: (f: unknown, o: typeof fns) => unknown) {
				query.joins.push(on(fields, fns));
				return chain;
			},
			select(alias: string, pick: (f: unknown) => string) {
				query.selects.set(alias, pick(fields));
				return chain;
			},
			where(predicate: (f: unknown, o: typeof fns) => unknown) {
				query.where = predicate(fields, fns);
				return chain;
			},
			limit: () => chain,
			build() {
				queries.push(query);
				return query;
			},
		};
		return chain;
	};

	const sql = { public: new Proxy({}, { get: () => builder() }) };
	const query = vi.fn(async (plan: { selects: Map<string, string> }) => {
		if (!rows.Guild) return [];
		return [
			Object.fromEntries(
				Array.from(plan.selects, ([alias, token]) => [alias, values.get(token) ?? null]),
			),
		];
	});
	return { sql, query, queries };
}

/**
 * A stand-in for the client the storage layer uses: the SQL builder of the
 * read, `upsert` per settings table, and the `StickyRole` collection.
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
			upsert: vi.fn((input: { create: Row; update: Row }) => {
				upserts.push({ table, ...input });
				return Promise.resolve({});
			}),
		};
	}

	const orm = { public: publicNamespace } as unknown as Database["orm"];
	const { sql, query, queries } = createSql(rows);
	const db = {
		orm,
		sql,
		runtime: () => ({ query }),
		transaction: vi.fn(async (fn: (tx: { orm: Database["orm"] }) => Promise<void>) =>
			fn({ orm }),
		),
	} as unknown as Database;

	return { db, orm, query, queries, stickyRole, upserts };
}

describe("fetchGuildData", () => {
	it("returns null when the guild has no Guild row yet", async () => {
		const { db } = createOrm();
		await expect(fetchGuildData(db, GUILD_ID)).resolves.toBeNull();
	});

	it("reads every settings table in one query, joined on the guild", async () => {
		const { db, query, queries } = createOrm({ Guild: { id: BigInt(GUILD_ID) } });
		await fetchGuildData(db, GUILD_ID);
		expect(query).toHaveBeenCalledOnce();
		const tableName = (name: TableName) =>
			contractJson.domain.namespaces.public.models[name].storage.table;
		expect(queries[0]?.joins).toStrictEqual(
			Tables.slice(1).map((name) => ({ left: "Guild.id", right: `${tableName(name)}.id` })),
		);
		expect(queries[0]?.where).toStrictEqual({ left: "Guild.id", right: BigInt(GUILD_ID) });
	});

	it("flattens the tables into GuildData and converts BIGINT to strings", async () => {
		const { db } = createOrm(
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

		const data = await fetchGuildData(db, GUILD_ID);

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
		const { db } = createOrm({
			Guild: {
				id: BigInt(GUILD_ID),
				language: "en-US",
				timezone: "UTC",
				updatesChannelId: null,
			},
		});

		const data = await fetchGuildData(db, GUILD_ID);

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
				// A created row starts from the defaults of its other columns:
				create: {
					id: BigInt(GUILD_ID),
					language: "de-DE",
					timezone: "UTC",
					updatesChannelId: null,
				},
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
