import type { Database, Models } from "#server/database/prisma";
import type { Snowflake } from "discord-api-types/v10";
import { isRowId } from "#server/database/settings/ids";
import { asTimestampString } from "#server/utils/timestamp-string";
import { isAppealCaseType, type AppealForm, type AppealFormData } from "#shared/utils/appeal-forms";

type Orm = Database["orm"];
type Row = Omit<Models.public_AppealForm, "guild">;

function toForm(row: Row): AppealForm {
	return {
		id: String(row.id),
		guildId: String(row.guildId),
		name: row.name,
		description: row.description,
		icon: row.icon,
		enabled: row.enabled,
		lockReason: row.lockReason,
		// A kind of case the dashboard does not know is left out, not shown:
		types: row.types.filter(isAppealCaseType),
		requiredRoles: row.requiredRoles.map(String),
		restrictedRoles: row.restrictedRoles.map(String),
		questions: row.questions,
		position: row.position,
	};
}

function toColumns(data: Partial<AppealFormData> & { position?: number }) {
	const { requiredRoles, restrictedRoles, ...rest } = data;
	return {
		...rest,
		...(requiredRoles === undefined
			? {}
			: { requiredRoles: requiredRoles.map((role) => BigInt(role)) }),
		...(restrictedRoles === undefined
			? {}
			: { restrictedRoles: restrictedRoles.map((role) => BigInt(role)) }),
	};
}

/** The moment a row is edited, as its `updated_at` column stores it: UTC without a zone. */
function now() {
	return asTimestampString(new Date().toISOString().slice(0, -1));
}

/**
 * Reads the forms of a guild, in the order the dashboard gave them.
 *
 * Mirrors `projects/database/src/settings/appeals/forms.ts` in the bot.
 *
 * @param orm The ORM surface to read through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID.
 */
export async function fetchAppealForms(orm: Orm, guildId: Snowflake): Promise<AppealForm[]> {
	const rows = await orm.public.AppealForm.where({ guildId: BigInt(guildId) }).all();
	return rows
		.map((row) => toForm(row))
		.toSorted((a, b) =>
			a.position === b.position
				? BigInt(a.id) < BigInt(b.id)
					? -1
					: 1
				: a.position - b.position,
		);
}

/**
 * Creates a form, and the `Guild` row it references when the guild has none
 * yet. The two writes belong together, so `orm` is a transaction's `tx.orm`.
 *
 * @param orm The transaction to write through.
 * @param guildId The guild's ID.
 * @param data The form to create, with its place in the order.
 * @param language The language a `Guild` row is created with.
 */
export async function insertAppealForm(
	orm: Orm,
	guildId: Snowflake,
	data: AppealFormData & { position: number },
	language = "en-US",
): Promise<AppealForm> {
	const id = BigInt(guildId);
	await orm.public.Guild.upsert({ create: { id, language }, update: { id } });
	const { requiredRoles, restrictedRoles, ...rest } = data;
	const row = await orm.public.AppealForm.create({
		...rest,
		guildId: id,
		requiredRoles: requiredRoles.map((role) => BigInt(role)),
		restrictedRoles: restrictedRoles.map((role) => BigInt(role)),
	});
	return toForm(row);
}

/**
 * Edits a form of a guild.
 * @param orm The ORM surface to write through, `db.orm` or a transaction's `tx.orm`.
 * @param guildId The guild's ID, so a form of another guild is never edited.
 * @param formId The form's ID.
 * @param data What changes.
 * @returns Whether the form existed: `false` as well for an ID that is not one.
 */
export async function patchAppealForm(
	orm: Orm,
	guildId: Snowflake,
	formId: string,
	data: Partial<AppealFormData> & { position?: number },
): Promise<boolean> {
	if (!isRowId(formId)) return false;

	const count = await orm.public.AppealForm.where({
		id: BigInt(formId),
		guildId: BigInt(guildId),
	}).updateAndCount({ ...toColumns(data), updatedAt: now() });
	return Number(count) > 0;
}

/**
 * Deletes a form of a guild. The appeals sent with it keep their answers, and
 * lose their form.
 * @returns Whether the form existed.
 */
export async function removeAppealForm(
	orm: Orm,
	guildId: Snowflake,
	formId: string,
): Promise<boolean> {
	if (!isRowId(formId)) return false;

	const count = await orm.public.AppealForm.where({
		id: BigInt(formId),
		guildId: BigInt(guildId),
	}).deleteAndCount();
	return Number(count) > 0;
}
