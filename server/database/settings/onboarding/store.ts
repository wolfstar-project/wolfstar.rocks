import type {
	OnboardingChange,
	OnboardingRecord,
	OnboardingStore,
	OnboardingStoreWrites,
	OnboardingWeek,
} from "#server/utils/onboarding/store";
import type {
	OnboardingCounts,
	OnboardingStage,
	OnboardingStageInput,
} from "#shared/utils/onboarding";
import type { Snowflake } from "discord-api-types/v10";
import { db, type Database, type Models } from "#server/database/prisma";
import { notifyGuildSettingsUpdate } from "#server/database/settings/notify";
import { asTimestampString, timestampStringToDate } from "#server/utils/timestamp-string";

type Orm = Database["orm"];
type StageRow = Omit<Models.public_GuildOnboardingStage, "guild">;

/** How far back the counts read: the last 7 days. */
const OnboardingCountWindow = 7 * 24 * 60 * 60 * 1000;

/** What the bot is told changed: the onboarding is no key of `GuildData`, so it has a name of its own. */
const ONBOARDING_NOTIFY_KEY = "onboarding";

function toSnowflake(value: bigint | null): Snowflake | null {
	return value === null ? null : String(value);
}

function toBigInt(value: Snowflake | null): bigint | null {
	return value === null ? null : BigInt(value);
}

/** A moment, as a `timestamp(3)` column compares with it: UTC without a zone. */
function toTimestamp(milliseconds: number) {
	return asTimestampString(new Date(milliseconds).toISOString().slice(0, -1));
}

/** A stage as the dashboard reads it, from its row. */
function toStage(row: StageRow): OnboardingStage {
	return {
		answers: [...row.answers],
		challenge: row.challenge,
		createdAt: timestampStringToDate(row.createdAt).getTime(),
		enabled: row.enabled,
		failureAction: row.failureAction,
		failureTimeout: row.failureTimeout,
		id: String(row.id),
		maxAttempts: row.maxAttempts,
		name: row.name,
		position: row.position,
		question: row.question,
		roleId: toSnowflake(row.roleId),
		timeLimit: row.timeLimit,
		trigger: row.trigger,
	};
}

/** The columns of the fields of a stage that are given, the role as a `bigint`. */
function toColumns(stage: Partial<OnboardingStageInput>) {
	const { roleId, ...rest } = stage;
	return { ...rest, ...(roleId === undefined ? {} : { roleId: toBigInt(roleId) }) };
}

/** Reads the onboarding of a guild; one that has no row yet is off, at revision 0, with no stage. */
async function readRecord(orm: Orm, guildId: Snowflake): Promise<OnboardingRecord> {
	const id = BigInt(guildId);
	const [row, stages] = await Promise.all([
		orm.public.GuildOnboarding.first({ id }),
		orm.public.GuildOnboardingStage.where({ guildId: id }).all(),
	]);
	return {
		enabled: row?.enabled ?? false,
		logChannelId: toSnowflake(row?.logChannelId ?? null),
		// The channel counts only with the message the bot posted in it.
		messageChannelId: row && row.messageId !== null ? toSnowflake(row.channelId) : null,
		revision: row?.revision ?? 0,
		stages: stages
			.map((stage) => toStage(stage))
			.toSorted((a, b) => a.position - b.position || (BigInt(a.id) < BigInt(b.id) ? -1 : 1)),
	};
}

function writesOf(orm: Orm, guildId: Snowflake): OnboardingStoreWrites {
	const id = BigInt(guildId);
	const stageOf = (stageId: string) =>
		orm.public.GuildOnboardingStage.where({ guildId: id, id: BigInt(stageId) });

	return {
		deleteStage: async (stageId) => {
			await stageOf(stageId).deleteAndCount();
		},
		insertStage: async (stage, position) => {
			const row = await orm.public.GuildOnboardingStage.create({
				...toColumns(stage),
				answers: stage.answers,
				challenge: stage.challenge,
				guildId: id,
				name: stage.name,
				position,
				trigger: stage.trigger,
			});
			return toStage(row);
		},
		setLogChannel: async (channelId) => {
			await orm.public.GuildOnboarding.where({ id }).updateAndCount({
				logChannelId: toBigInt(channelId),
			});
		},
		setOrder: async (order) => {
			for (const [position, stageId] of order.entries()) {
				await stageOf(stageId).updateAndCount({ position });
			}
		},
		updateStage: async (stageId, stage) => {
			await stageOf(stageId).updateAndCount(toColumns(stage));
		},
	};
}

/**
 * Takes the revision: raises it by one if the onboarding is still at
 * `revision`, and says whether it was. The rows above the onboarding's own are
 * made first, as every table references the chain above it. Two writes at the
 * same revision meet on the row: the second waits for the first, then finds
 * the revision moved on.
 */
async function takeRevision(orm: Orm, guildId: Snowflake, revision: number): Promise<boolean> {
	const id = BigInt(guildId);
	await orm.public.Guild.upsert({ create: { id, language: "en-US" }, update: { id } });
	await orm.public.Modules.upsert({ create: { id }, update: { id } });
	await orm.public.GuildOnboarding.upsert({ create: { id }, update: { id } });

	const taken = await orm.public.GuildOnboarding.where({ id, revision }).updateAndCount({
		revision: revision + 1,
	});
	return Number(taken) > 0;
}

/** Whether `error`, or what caused it, is `signal`: the transaction may wrap what its callback throws. */
function isCausedBy(error: unknown, signal: Error): boolean {
	for (let current = error; current instanceof Error; current = current.cause) {
		if (current === signal) return true;
	}
	return false;
}

async function change<Value, Refusal>(
	guildId: Snowflake,
	revision: number,
	run: (
		writes: OnboardingStoreWrites,
		current: OnboardingRecord,
	) => Promise<OnboardingChange<Value, Refusal>>,
): Promise<OnboardingChange<Value, Refusal | { code: "conflict" }>> {
	// A refusal leaves nothing behind: the transaction is rolled back by
	// throwing this out of it, and the refusal is answered as a value.
	const rollback = new Error("The onboarding change was refused");
	let refusal: OnboardingChange<Value, Refusal | { code: "conflict" }> | null = null;

	try {
		return await db.transaction(async (tx) => {
			if (!(await takeRevision(tx.orm, guildId, revision))) {
				refusal = { error: { code: "conflict" }, ok: false };
				throw rollback;
			}

			const result = await run(writesOf(tx.orm, guildId), await readRecord(tx.orm, guildId));
			if (!result.ok) {
				refusal = result;
				throw rollback;
			}

			// The bot caches the onboarding per process: told inside the
			// transaction, it reads the change only once it is committed.
			await notifyGuildSettingsUpdate(tx, guildId, [ONBOARDING_NOTIFY_KEY]);
			return result;
		});
	} catch (error) {
		if (refusal !== null && isCausedBy(error, rollback)) return refusal;
		throw error;
	}
}

const NO_COUNTS: OnboardingCounts = { failed: 0, passed: 0, waiting: 0 };

/** Adds a group of rows to the counts of its stage and of the whole week. */
function addGroup(
	week: OnboardingWeek,
	stageId: bigint | null,
	status: "passed" | "failed" | "waiting",
	total: number,
): void {
	week.week[status] += total;
	if (stageId === null) return;
	const key = String(stageId);
	week.weekByStage[key] = { ...(week.weekByStage[key] ?? NO_COUNTS) };
	week.weekByStage[key][status] += total;
}

/**
 * Counts the passes and the failures of the last 7 days, and the members who
 * wait at a stage now, however long ago they started it. The rows of a
 * deleted stage count in the week, and in no stage.
 */
async function countWeek(guildId: Snowflake, now: number): Promise<OnboardingWeek> {
	const id = BigInt(guildId);
	const since = toTimestamp(now - OnboardingCountWindow);
	const verifications = db.orm.public.OnboardingVerification;

	const [resolved, waiting] = await Promise.all([
		verifications
			.where({ guildId: id })
			.where((row) => row.createdAt.gte(since))
			.groupBy("stageId", "status")
			.aggregate((aggregate) => ({ total: aggregate.count() })),
		verifications
			.where({ guildId: id, status: "Waiting" })
			.groupBy("stageId")
			.aggregate((aggregate) => ({ total: aggregate.count() })),
	]);

	const week: OnboardingWeek = { week: { ...NO_COUNTS }, weekByStage: {} };
	for (const group of resolved) {
		if (group.status === "Passed") addGroup(week, group.stageId, "passed", Number(group.total));
		if (group.status === "Failed") addGroup(week, group.stageId, "failed", Number(group.total));
	}
	for (const group of waiting) {
		addGroup(week, group.stageId, "waiting", Number(group.total));
	}
	return week;
}

/**
 * The onboarding of a guild in the database the bot shares. The bot owns the
 * tables; the dashboard writes the log channel and the stages, and never the
 * verification message or a verification.
 */
export const onboardingStore: OnboardingStore = {
	change,
	countWeek,
	read: (guildId) => readRecord(db.orm, guildId),
};
