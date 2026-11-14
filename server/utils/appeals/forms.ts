import type { Snowflake } from "discord-api-types/v10";
import { db, type Database } from "#server/database/prisma";
import {
	fetchAppealForms,
	insertAppealForm,
	patchAppealForm,
	removeAppealForm,
} from "#server/database/settings/appeals/storage";
import { createKeyedLock } from "#server/utils/keyed-lock";
import {
	AppealFormLimits,
	asksSomething,
	getDefaultAppealForm,
	MaximumAppealForms,
	type AppealForm,
	type AppealFormData,
} from "#shared/utils/appeal-forms";

/**
 * What goes wrong when a form is created, edited, deleted or moved, to
 * translate for whoever asked.
 */
export type AppealFormErrorCode = "limit" | "nameTaken" | "nameInvalid" | "unknown" | "invalid";

export class AppealFormError extends Error {
	public constructor(public readonly code: AppealFormErrorCode) {
		super(`Appeal form error: ${code}`);
	}
}

export type AppealFormUpdate = Partial<AppealFormData>;

/** Reads the forms of a guild, in the order the dashboard gave them. */
export function readAppealForms(guildId: Snowflake): Promise<AppealForm[]> {
	return fetchAppealForms(db.orm, guildId);
}

function validateName(forms: readonly AppealForm[], name: string, ignoreId: string | null = null) {
	const trimmed = name.trim();
	if (trimmed.length === 0 || trimmed.length > AppealFormLimits.name) {
		throw new AppealFormError("nameInvalid");
	}
	// A name made of digits could be taken for the ID of another form:
	if (/^\d+$/u.test(trimmed)) throw new AppealFormError("nameInvalid");

	const lower = trimmed.toLowerCase();
	if (forms.some((form) => form.id !== ignoreId && form.name.toLowerCase() === lower)) {
		throw new AppealFormError("nameTaken");
	}
	return trimmed;
}

type Orm = Database["orm"];

const withGuildLock = createKeyedLock<Snowflake>();

// First key of the advisory lock the form writes of a guild run under; the
// second is derived from the guild. Arbitrary, and only has to differ from the
// keys other code locks on (the rules use the one before it).
const FORMS_LOCK_NAMESPACE = 1_635_086_446;
const FORMS_LOCK_KEY_RANGE = 2_147_483_647n;

/**
 * Runs the writes of a guild one after the other, each on the forms the
 * database has at that time, so two changes made at once do not undo each
 * other: the queue orders the writes of this process, the transaction-scoped
 * advisory lock orders them across the other instances of the dashboard.
 *
 * The bot is not told: it reads the forms from the database every time it
 * needs them and caches none, so there is nothing to drop.
 */
async function writeAppealForms<T>(
	guildId: Snowflake,
	callback: (forms: readonly AppealForm[], orm: Orm) => Promise<T>,
): Promise<T> {
	return withGuildLock(guildId, () => {
		// Two guilds that share a key only wait for each other; nothing breaks.
		const guildKey = Number(BigInt(guildId) % FORMS_LOCK_KEY_RANGE);
		return db.transaction(async (tx) => {
			await tx.execute(
				db.raw.sql`SELECT pg_advisory_xact_lock(${FORMS_LOCK_NAMESPACE}, ${guildKey})`
					.affectedCount()
					.build(),
			);
			return callback(await fetchAppealForms(tx.orm, guildId), tx.orm);
		});
	});
}

/**
 * The name of the index that keeps the names of the forms of a guild unique,
 * whatever the case. It catches what {@linkcode validateName} cannot: two
 * processes creating the same name at once.
 */
const UNIQUE_NAME_INDEX = "AppealForm_guild_id_name_key";

function isUniqueNameError(error: unknown) {
	for (let current = error; current instanceof Error; current = current.cause) {
		if (current.message.includes(UNIQUE_NAME_INDEX)) return true;
	}
	return false;
}

function rethrowNameTaken(error: unknown): never {
	throw isUniqueNameError(error) ? new AppealFormError("nameTaken") : error;
}

/**
 * Creates a form for a guild, after the ones it has.
 *
 * @param guildId - The ID of the guild.
 * @param data - The form, with at least its name and its questions: the
 * validator only checks the fields a request gives, and a form with no
 * question that asks something could never be answered.
 * @throws {@linkcode AppealFormError} When the guild has too many forms, the
 * name is invalid or taken, or the questions are missing.
 */
export function createAppealForm(
	guildId: Snowflake,
	data: Partial<AppealFormData> & { name: string },
): Promise<AppealForm> {
	return writeAppealForms(guildId, async (forms, orm) => {
		if (forms.length >= MaximumAppealForms) throw new AppealFormError("limit");
		if (!data.questions?.some((question) => asksSomething(question))) {
			throw new AppealFormError("invalid");
		}

		return insertAppealForm(orm, guildId, {
			...getDefaultAppealForm(),
			...data,
			name: validateName(forms, data.name),
			// After the highest place, not at `forms.length`: a deleted form leaves a gap,
			// and a new form must still come last.
			position: forms.reduce((highest, form) => Math.max(highest, form.position), -1) + 1,
		}).catch(rethrowNameTaken);
	});
}

export interface AppealFormChange {
	/** The form as the database had it when the write ran. */
	before: AppealForm;
	/** The form after the change. */
	after: AppealForm;
	/** What was written, empty when nothing changed. */
	patch: AppealFormUpdate;
}

/**
 * Edits a form of a guild.
 *
 * @param guildId - The ID of the guild.
 * @param formId - The ID of the form.
 * @param resolve - Reads what changes from the form as the database has it
 * inside the write queue, so two requests that change different fields do
 * not restore each other's old value. Returns `null` to change nothing.
 * @throws {@linkcode AppealFormError} When the form does not exist, or the
 * new name is invalid or taken.
 */
export function updateAppealForm(
	guildId: Snowflake,
	formId: string,
	resolve: (form: AppealForm) => AppealFormUpdate | null,
): Promise<AppealFormChange> {
	return writeAppealForms(guildId, async (forms, orm) => {
		const form = forms.find((entry) => entry.id === formId);
		if (!form) throw new AppealFormError("unknown");

		const update = resolve(form);
		if (update === null || Object.keys(update).length === 0) {
			return { before: form, after: form, patch: {} };
		}

		const patch =
			update.name === undefined
				? update
				: { ...update, name: validateName(forms, update.name, formId) };
		const found = await patchAppealForm(orm, guildId, formId, patch).catch(rethrowNameTaken);
		if (!found) throw new AppealFormError("unknown");

		return { before: form, after: { ...form, ...patch } as AppealForm, patch };
	});
}

/**
 * Deletes a form of a guild. The forms after it keep their positions: the
 * order only has to be read, and it still reads.
 *
 * @returns The form that was deleted.
 * @throws {@linkcode AppealFormError} When the form does not exist.
 */
export function deleteAppealForm(guildId: Snowflake, formId: string): Promise<AppealForm> {
	return writeAppealForms(guildId, async (forms, orm) => {
		const form = forms.find((entry) => entry.id === formId);
		if (!form || !(await removeAppealForm(orm, guildId, formId))) {
			throw new AppealFormError("unknown");
		}
		return form;
	});
}

export interface AppealFormReorder {
	/** The forms in the order the write found them: read under the lock, so an audit of it is exact. */
	before: AppealForm[];
	/** The forms in their new order. */
	forms: AppealForm[];
}

/**
 * Puts the forms of a guild in the order of `ids`, which has to name every
 * form of the guild once. Only a form whose place changes is written.
 *
 * @returns The forms in their new order, and in the one they had.
 * @throws {@linkcode AppealFormError} When `ids` misses a form, names one
 * twice or names one the guild does not have.
 */
export function reorderAppealForms(
	guildId: Snowflake,
	ids: readonly string[],
): Promise<AppealFormReorder> {
	return writeAppealForms(guildId, async (forms, orm) => {
		if (ids.length !== forms.length || new Set(ids).size !== ids.length) {
			throw new AppealFormError("invalid");
		}
		const ordered: AppealForm[] = [];
		for (const id of ids) {
			const form = forms.find((entry) => entry.id === id);
			if (!form) throw new AppealFormError("invalid");
			ordered.push(form);
		}

		const reordered: AppealForm[] = [];
		for (const [position, form] of ordered.entries()) {
			if (form.position !== position) {
				await patchAppealForm(orm, guildId, form.id, { position });
			}
			reordered.push({ ...form, position });
		}
		return { before: [...forms], forms: reordered };
	});
}
