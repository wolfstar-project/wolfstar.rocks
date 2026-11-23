import type { Database } from "#server/database/prisma";
import type {
	GuildData,
	GuildDataKey,
	ReadonlyGuildData,
	StickyRole,
} from "#server/database/settings/types";
import type { Snowflake } from "discord-api-types/v10";
import contractJson from "#server/database/generated/prisma/contract.json" with { type: "json" };
import {
	Columns,
	Tables,
	type Column,
	type ColumnKind,
	type StoredKey,
	type TableName,
} from "#server/database/settings/columns";
import { getDefaultGuildSettings } from "#server/database/settings/constants";

const StoredKeys = Object.keys(Columns) as StoredKey[];
const ColumnsByKey: Record<StoredKey, Column> = Columns;

/**
 * The ORM surface of a table as the storage layer uses it. The tables are
 * addressed by name, so the typed per-model collections are narrowed to the
 * terminals every one of them shares.
 */
interface TableCollection {
	upsert(input: {
		create: Record<string, unknown>;
		update: Record<string, unknown>;
	}): PromiseLike<unknown>;
}

type Orm = Database["orm"];

export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

function table(orm: Pick<Orm, "public">, name: TableName): TableCollection {
	return orm.public[name] as unknown as TableCollection;
}

function toSetting(kind: ColumnKind, value: unknown): unknown {
	switch (kind) {
		case "snowflake": {
			return value === null || value === undefined ? null : String(value);
		}
		case "snowflakes": {
			return (value as readonly bigint[]).map(String);
		}
		case "boolean": {
			return value === true;
		}
		case "value": {
			return value;
		}
	}
}

function toColumn(kind: ColumnKind, value: unknown): unknown {
	switch (kind) {
		case "snowflake": {
			return value === null || value === undefined ? null : BigInt(value as string);
		}
		case "snowflakes": {
			return (value as readonly string[]).map((entry) => BigInt(entry));
		}
		case "boolean":
		case "value": {
			return value;
		}
	}
}

/** Where a table and its columns are in the database, as the contract names them. */
interface StorageNames {
	table: string;
	columns: Record<string, string>;
}

function storageNames(name: TableName): StorageNames {
	const model = contractJson.domain.namespaces.public.models[name];
	return {
		table: model.storage.table,
		columns: Object.fromEntries(
			Object.entries(model.storage.fields).map(([field, { column }]) => [field, column]),
		),
	};
}

const StorageByTable = new Map<TableName, StorageNames>(
	Tables.map((name) => [name, storageNames(name)]),
);

function storageOf(name: TableName): StorageNames {
	const storage = StorageByTable.get(name);
	if (!storage) throw new Error(`[settings] the contract has no table for ${name}`);
	return storage;
}

/** The alias under which the read selects a setting, and the one that tells whether a table has a row. */
const settingAlias = (index: number) => `s${index}`;
const rowAlias = (index: number) => `r${index}`;

type Plan = Parameters<DatabaseTransaction["query"]>[0];
type FieldScope = Record<string, Record<string, unknown>>;
interface Operators {
	eq(left: unknown, right: unknown): unknown;
}

/**
 * The SQL builder of a table, narrowed to the calls the read of the settings
 * makes: the joined tables and the selected columns are only known from
 * {@link Tables} and {@link Columns} at run time, so the typed builder cannot
 * follow them.
 */
interface SettingsQueryBuilder {
	outerLeftJoin(
		other: unknown,
		on: (fields: FieldScope, fns: Operators) => unknown,
	): SettingsQueryBuilder;
	select(alias: string, pick: (fields: FieldScope) => unknown): SettingsQueryBuilder;
	where(predicate: (fields: FieldScope, fns: Operators) => unknown): SettingsQueryBuilder;
	limit(count: number): SettingsQueryBuilder;
	build(): Plan;
}

/** What the settings are read through: the client, or an open transaction. */
export type SettingsSource = Database | DatabaseTransaction;

function sqlTable(source: SettingsSource, name: TableName): SettingsQueryBuilder {
	return source.sql.public[
		storageOf(name).table as keyof Database["sql"]["public"]
	] as unknown as SettingsQueryBuilder;
}

/**
 * One query for every settings table: the `Guild` row, joined on its ID to the
 * row of each other table when there is one. Reading them one query each held
 * a connection per table, more than a Worker may open at once, so the reads
 * waited for each other.
 */
function settingsPlan(source: SettingsSource, key: bigint): Plan {
	const [root, ...joined] = Tables;
	let query = sqlTable(source, root);
	const rootTable = storageOf(root).table;
	for (const name of joined) {
		const { table: other } = storageOf(name);
		query = query.outerLeftJoin(sqlTable(source, name), (fields, fns) =>
			fns.eq(fields[rootTable]?.id, fields[other]?.id),
		);
	}

	Tables.forEach((name, index) => {
		const { table: tableName } = storageOf(name);
		query = query.select(rowAlias(index), (fields) => fields[tableName]?.id);
	});
	StoredKeys.forEach((settingKey, index) => {
		const { table: tableName, column } = ColumnsByKey[settingKey];
		const storage = storageOf(tableName);
		const storageColumn = storage.columns[column] ?? column;
		query = query.select(
			settingAlias(index),
			(fields) => fields[storage.table]?.[storageColumn],
		);
	});

	return query
		.where((fields, fns) => fns.eq(fields[rootTable]?.id, key))
		.limit(1)
		.build();
}

async function queryRows(source: SettingsSource, plan: Plan): Promise<Record<string, unknown>[]> {
	const runtime = (source as Partial<Database>).runtime;
	const rows: unknown =
		typeof runtime === "function"
			? await (source as Database).runtime().query(plan)
			: await (source as DatabaseTransaction).query(plan);
	return rows as Record<string, unknown>[];
}

/**
 * Reads the settings of a guild, in two queries sent together: one for the
 * settings tables, one for the sticky roles.
 * @param source The client to read through, `db` or a transaction's `tx`.
 * @param id The guild's ID.
 * @returns The settings, or `null` when the guild has no `Guild` row yet.
 */
export async function fetchGuildData(
	source: SettingsSource,
	id: Snowflake,
): Promise<GuildData | null> {
	const key = BigInt(id);
	const [rows, stickyRoles] = await Promise.all([
		queryRows(source, settingsPlan(source, key)),
		source.orm.public.StickyRole.where({ guildId: key }).all(),
	]);

	const [row] = rows;
	if (row === undefined) return null;

	const data = Object.assign(Object.create(null), getDefaultGuildSettings(), {
		id,
	}) as GuildData;
	const hasRow = new Map<TableName, boolean>(
		Tables.map((name, index) => [name, row[rowAlias(index)] != null]),
	);
	StoredKeys.forEach((settingKey, index) => {
		const { table: tableName, kind } = ColumnsByKey[settingKey];
		// A missing row keeps the default values for every key the table stores:
		if (!hasRow.get(tableName)) return;
		Reflect.set(data, settingKey, toSetting(kind, row[settingAlias(index)]));
	});

	data.stickyRoles = stickyRoles.map(
		(entry) =>
			({
				user: String(entry.userId),
				roles: entry.roleIds.map(String),
			}) satisfies StickyRole,
	);

	return data;
}

/**
 * Writes changed settings into their tables, in one transaction. The rows a
 * change needs are created with the rest of {@link settings} when they do not
 * exist yet, together with the rows they reference.
 * @param db The database to write through.
 * @param settings The settings the changes apply to, with the changes already merged in.
 * @param changes The changed keys and their new values.
 * @param extra Other writes that belong with the changes: they run in the same transaction, after them.
 * @param check What the changes depend on: it runs first in the same transaction, where it can lock what it
 * reads, and throwing leaves everything unwritten.
 * @param within A transaction already open, to write in instead of opening another: an import holds the lock of the
 * rules in one, and a second connection for the settings would take two of the pool for each import.
 */
export async function writeGuildData(
	db: Database,
	settings: ReadonlyGuildData,
	changes: Partial<ReadonlyGuildData>,
	extra?: (tx: DatabaseTransaction) => Promise<void>,
	check?: (tx: DatabaseTransaction) => Promise<void>,
	within?: DatabaseTransaction,
): Promise<void> {
	const id = BigInt(settings.id);
	const changedKeys = Object.keys(changes) as GuildDataKey[];

	const touched = new Set<TableName>();
	for (const key of changedKeys) {
		if (key === "id") continue;
		if (key === "stickyRoles") touched.add("Guild");
		else touched.add(ColumnsByKey[key].table);
	}

	if (touched.size === 0 && !extra) return;

	// Every table references the chain above it, so the whole chain has to exist first:
	if (touched.size > 0) {
		touched.add("Guild");
		if (touched.size > 1) touched.add("Modules");
	}

	const write = async (tx: DatabaseTransaction) => {
		await check?.(tx);

		for (const name of Tables) {
			if (!touched.has(name)) continue;

			const create: Record<string, unknown> = { id };
			const update: Record<string, unknown> = {};
			for (const key of StoredKeys) {
				const { table: tableName, column, kind } = ColumnsByKey[key];
				if (tableName !== name) continue;

				const value = toColumn(kind, settings[key]);
				create[column] = value;
				if (key in changes) update[column] = value;
			}

			// An upsert needs something to set: a row that only has to exist
			// (a parent of the changed table) rewrites its own key.
			if (Object.keys(update).length === 0) update.id = id;

			await table(tx.orm, name).upsert({ create, update });
		}

		if ("stickyRoles" in changes) {
			const stickyRoles = tx.orm.public.StickyRole;
			await stickyRoles.where({ guildId: id }).deleteAndCount();
			if (settings.stickyRoles.length > 0) {
				await stickyRoles.createAndCount(
					settings.stickyRoles.map((entry) => ({
						guildId: id,
						userId: BigInt(entry.user),
						roleIds: entry.roles.map((role) => BigInt(role)),
					})),
				);
			}
		}

		await extra?.(tx);
	};

	await (within ? write(within) : db.transaction(write));
}
