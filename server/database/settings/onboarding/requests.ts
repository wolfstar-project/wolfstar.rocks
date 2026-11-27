import type { OnboardingVerificationRow } from "#shared/utils/onboarding";
import type { Snowflake } from "discord-api-types/v10";
import { db, type Database } from "#server/database/prisma";
import { isRowId } from "#server/database/settings/ids";
import { timestampStringToDate } from "#server/utils/timestamp-string";

type Orm = Database["orm"];

/**
 * The Postgres channel the bot listens on to learn that a member passed the
 * captcha of a `Captcha` stage; its payload is the ID of the `OnboardingRequest` row.
 */
const ONBOARDING_REQUEST_CHANNEL = "onboarding_request";

/**
 * Reads the rows of `OnboardingVerification` of a member that still wait. The
 * bot writes them; the verification page only reads which `Captcha` stage the
 * member is at.
 */
export async function fetchWaitingOnboardingRows(
	orm: Orm,
	guildId: Snowflake,
	userId: Snowflake,
): Promise<OnboardingVerificationRow[]> {
	const rows = await orm.public.OnboardingVerification.where({
		guildId: BigInt(guildId),
		status: "Waiting",
		userId: BigInt(userId),
	}).all();
	return rows.map((row) => ({
		createdAt: timestampStringToDate(row.createdAt).getTime(),
		id: String(row.id),
		stageId: row.stageId === null ? null : String(row.stageId),
		status: row.status,
	}));
}

/**
 * Writes a request for the bot to pass a member who solved the captcha, and
 * announces it in the same transaction: Postgres delivers the notification
 * only when the transaction commits, so the bot never hears of a request that
 * was rolled back.
 *
 * @returns The ID of the request.
 */
export function submitOnboardingRequest(data: {
	guildId: Snowflake;
	userId: Snowflake;
	verificationId: string;
}): Promise<string> {
	return db.transaction(async (tx) => {
		const row = await tx.orm.public.OnboardingRequest.create({
			guildId: BigInt(data.guildId),
			userId: BigInt(data.userId),
			verificationId: BigInt(data.verificationId),
		});
		const id = String(row.id);
		await tx.execute(
			db.raw.sql`SELECT pg_notify(${ONBOARDING_REQUEST_CHANNEL}, ${id})`
				.affectedCount()
				.build(),
		);
		return id;
	});
}

/** What the page reads of a request to tell where it is. */
export interface OnboardingRequestRecord {
	id: string;
	/** Whether the bot has done it, or could not. */
	processed: boolean;
	/** Why the bot could not do it, as `<code>: <detail>`; `null` when it did. */
	error: string | null;
}

/**
 * Reads a request of a member in a guild by its ID: the page never sees
 * another member's.
 *
 * @returns The request, `null` when the member has none with that ID, or the ID is not one.
 */
export async function fetchOnboardingRequestRow(
	orm: Orm,
	guildId: Snowflake,
	userId: Snowflake,
	requestId: string,
): Promise<OnboardingRequestRecord | null> {
	if (!isRowId(requestId)) return null;

	const row = await orm.public.OnboardingRequest.first({
		guildId: BigInt(guildId),
		id: BigInt(requestId),
		userId: BigInt(userId),
	});
	if (row === null) return null;

	return { error: row.error, id: String(row.id), processed: row.processedAt !== null };
}
