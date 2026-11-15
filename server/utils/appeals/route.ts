import type { AppealForm } from "#shared/utils/appeal-forms";
import type { H3Event } from "h3";
import { AppealFormError } from "#server/utils/appeals/forms";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

/**
 * `authorize` hook of the appeal form routes: resolves the guild of the path
 * and checks that who asks can manage it. A refusal is audited, as it is for
 * the settings routes.
 */
export const authorizeAppealFormManager = authorizeGuildManager(
	"Insufficient permissions to manage appeal forms",
);

/**
 * A refusal the form editor can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where `useAppealForms()` reads the code from.
 */
function formError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ statusCode, statusMessage, message: statusMessage, data });
}

const FORM_ERROR_RESPONSES = {
	invalid: [400, "Invalid form"],
	limit: [400, "Too many forms"],
	nameInvalid: [400, "Form name invalid"],
	nameTaken: [409, "Form name taken"],
	unknown: [404, "Form not found"],
} as const satisfies Record<AppealFormError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a form was created, edited,
 * deleted or moved. Anything that is not an {@linkcode AppealFormError} is
 * thrown again as it is.
 */
export function throwAppealFormError(error: unknown): never {
	if (!(error instanceof AppealFormError)) throw error;

	const [status, message] = FORM_ERROR_RESPONSES[error.code];
	throw formError(status, message, { code: error.code });
}

/** Answers a request whose body the form validator refused. */
export function throwInvalidFormBody(errors: readonly string[]): never {
	throw formError(400, "Invalid form", { code: "invalid", errors });
}

/**
 * Records a change to the forms of a guild in the audit chain. A form has no
 * settings key of its own, so its fields are filed under `appealForm.<name>`,
 * and the order of the forms under `appealForms.order`.
 */
export function auditAppealFormChange(
	event: H3Event,
	before: Partial<AppealForm> | string[] | null,
	after: Partial<AppealForm> | string[] | null,
	name: string | null,
): void {
	const { guild, member } = useManagedGuild(event);
	// The audit diff addresses a field by a `/`-separated path, so a `/` in the
	// name would split the key and lose the old values. `∕` reads the same.
	const key = name === null ? "appealForms.order" : `appealForm.${name.replaceAll("/", "∕")}`;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "success",
			changes: compactSettingsChanges(
				before === null ? {} : { [key]: before },
				after === null ? {} : { [key]: after },
			),
		}),
	);
}
