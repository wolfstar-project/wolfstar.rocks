import type { Database } from "#server/database/prisma";
import type { JoinGuardRequestKind } from "#shared/utils/join-guard";
import type { Snowflake } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import { isRowId } from "#server/database/settings/ids";

type Orm = Database["orm"];
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * The Postgres channel the bot listens on to learn that the website made a
 * request of the join guard; its payload is the ID of the `JoinGuardRequest` row.
 */
export const JOIN_GUARD_REQUEST_CHANNEL = "join_guard_request";

/**
 * A request for the bot, as the website writes it. The bot's
 * `parseJoinGuardRequest()` trusts nothing in it: `Pass` needs the member, the
 * trust and the linked accounts; `Verify` and `Kick` the member and the moderator.
 */
export type JoinGuardRequestData =
	| {
			kind: "Pass";
			guildId: Snowflake;
			userId: Snowflake;
			checkpointId: string;
			trust: number;
			linkedAccounts: number;
	  }
	| {
			kind: "Verify";
			guildId: Snowflake;
			userId: Snowflake;
			checkpointId: string;
			moderatorId: Snowflake;
	  }
	| {
			kind: "Kick";
			guildId: Snowflake;
			userId: Snowflake;
			checkpointId: string;
			moderatorId: Snowflake;
			reason: string | null;
	  }
	| { kind: "PostButton"; guildId: Snowflake; moderatorId: Snowflake };

function toColumns(data: JoinGuardRequestData) {
	const base = { guildId: BigInt(data.guildId), kind: data.kind };
	switch (data.kind) {
		case "Pass":
			return {
				...base,
				userId: BigInt(data.userId),
				checkpointId: BigInt(data.checkpointId),
				trust: data.trust,
				linkedAccounts: data.linkedAccounts,
			};
		case "Verify":
			return {
				...base,
				userId: BigInt(data.userId),
				checkpointId: BigInt(data.checkpointId),
				moderatorId: BigInt(data.moderatorId),
			};
		case "Kick":
			return {
				...base,
				userId: BigInt(data.userId),
				checkpointId: BigInt(data.checkpointId),
				moderatorId: BigInt(data.moderatorId),
				reason: data.reason,
			};
		case "PostButton":
			return { ...base, moderatorId: BigInt(data.moderatorId) };
	}
}

/**
 * Writes a request for the bot. It belongs in the transaction that also
 * announces it (see {@linkcode notifyJoinGuardRequest}).
 *
 * @returns The ID of the request.
 */
export async function insertJoinGuardRequest(
	orm: Orm,
	data: JoinGuardRequestData,
): Promise<string> {
	const row = await orm.public.JoinGuardRequest.create(toColumns(data));
	return String(row.id);
}

/**
 * Tells the bot a request waits for it. Run inside the transaction that
 * writes the request: Postgres delivers a notification only when that
 * transaction commits, so the bot never hears of a request that was rolled
 * back. The payload is the ID alone.
 */
export async function notifyJoinGuardRequest(
	tx: Pick<Transaction, "execute">,
	requestId: string,
): Promise<void> {
	await tx.execute(
		db.raw.sql`SELECT pg_notify(${JOIN_GUARD_REQUEST_CHANNEL}, ${requestId})`
			.affectedCount()
			.build(),
	);
}

/**
 * Writes a request and announces it, in one transaction.
 * @returns The ID of the request.
 */
export function submitJoinGuardRequest(data: JoinGuardRequestData): Promise<string> {
	return db.transaction(async (tx) => {
		const id = await insertJoinGuardRequest(tx.orm, data);
		await notifyJoinGuardRequest(tx, id);
		return id;
	});
}

/** What the website reads of a request to tell where it is. */
export interface JoinGuardRequestRecord {
	id: string;
	kind: JoinGuardRequestKind;
	userId: Snowflake | null;
	/** Whether the bot has done it, or could not. */
	processed: boolean;
	/** Why the bot could not do it, as `<code>: <detail>`; `null` when it did. */
	error: string | null;
}

/**
 * Reads a request of a guild by its ID. With `scope.userId`, only a `Pass`
 * of that member is read: the member's page never sees a moderator's request,
 * nor another member's.
 *
 * @returns The request, `null` when the guild has none with that ID for the
 * scope, or the ID is not one.
 */
export async function fetchJoinGuardRequestRow(
	orm: Orm,
	guildId: Snowflake,
	requestId: string,
	scope: { userId?: Snowflake } = {},
): Promise<JoinGuardRequestRecord | null> {
	if (!isRowId(requestId)) return null;

	const row = await orm.public.JoinGuardRequest.first({
		id: BigInt(requestId),
		guildId: BigInt(guildId),
		...(scope.userId === undefined ? {} : { kind: "Pass", userId: BigInt(scope.userId) }),
	});
	if (row === null) return null;

	return {
		id: String(row.id),
		kind: row.kind,
		userId: row.userId === null ? null : String(row.userId),
		processed: row.processedAt !== null,
		error: row.error,
	};
}
