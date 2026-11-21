import { reorderAppealForms } from "#server/utils/appeals/forms";
import {
	auditAppealFormChange,
	authorizeAppealFormManager,
	throwAppealFormError,
	throwInvalidFormBody,
} from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((entry: unknown) => typeof entry === "string");
}

/**
 * `PUT /api/guilds/:guild/appeals/forms/order`: puts the forms in the order of
 * the `ids` of the body, which name every form of the guild once. Answers with
 * the forms in their new order.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body: unknown = await readBody(event);
		const { ids } = (typeof body === "object" && body !== null ? body : {}) as {
			ids?: unknown;
		};
		if (!isStringArray(ids)) throwInvalidFormBody(["ids: Expected an array of IDs."]);

		// The order it replaced comes from the write itself, read under its lock:
		// a move that finished meanwhile would make an earlier read lie to the audit.
		const { before: replaced, forms } = await reorderAppealForms(guild.id, ids).catch(
			throwAppealFormError,
		);

		const before = replaced.map((form) => form.name);
		const after = forms.map((form) => form.name);
		if (before.some((name, index) => name !== after[index])) {
			auditAppealFormChange(event, before, after, null);
		}
		return forms;
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
