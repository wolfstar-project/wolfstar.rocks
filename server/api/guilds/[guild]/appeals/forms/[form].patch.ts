import type { AppealForm } from "#shared/utils/appeal-forms";
import { updateAppealForm } from "#server/utils/appeals/forms";
import {
	auditAppealFormChange,
	authorizeAppealFormManager,
	throwAppealFormError,
	throwInvalidFormBody,
} from "#server/utils/appeals/route";
import { parseAppealFormPatch } from "#server/utils/appeals/validation";
import { useManagedGuild } from "#server/utils/guilds/manager";

/**
 * `PATCH /api/guilds/:guild/appeals/forms/:form`: edits a form. The body has
 * what changes; the fields that are not given keep their value, and the
 * questions are sent whole.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const formId = getRouterParam(event, "form") ?? "";
		const body: unknown = await readBody(event);

		// The body is validated against the form the database has inside the
		// write queue, so a role list it does not give is the one it has now.
		let errors: string[] | undefined;
		const change = await updateAppealForm(guild.id, formId, (current) => {
			const parsed = parseAppealFormPatch(body, current);
			errors = parsed.errors;
			return parsed.data ?? null;
		}).catch(throwAppealFormError);
		if (errors) throwInvalidFormBody(errors);

		const changedKeys = Object.keys(change.patch) as (keyof AppealForm)[];
		if (changedKeys.length > 0) {
			const pick = (form: AppealForm) =>
				Object.fromEntries(changedKeys.map((key) => [key, form[key]]));
			auditAppealFormChange(
				event,
				pick(change.before),
				pick(change.after),
				change.before.name,
			);
		}

		return change.after;
	},
	{
		auth: true,
		authorize: authorizeAppealFormManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
