import { createAppealForm } from "#server/utils/appeals/forms";
import {
	auditAppealFormChange,
	authorizeAppealFormManager,
	throwAppealFormError,
	throwInvalidFormBody,
} from "#server/utils/appeals/route";
import { parseAppealFormPatch } from "#server/utils/appeals/validation";
import { useManagedGuild } from "#server/utils/guilds/manager";

/**
 * `POST /api/guilds/:guild/appeals/forms`: creates a form. The body has the
 * `name` and the `questions` of the form, and whatever else it does not take
 * the default of.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body: unknown = await readBody(event);
		const { name } = (typeof body === "object" && body !== null ? body : {}) as {
			name?: unknown;
		};
		if (typeof name !== "string") throwInvalidFormBody(["name: Expected a string."]);

		const parsed = parseAppealFormPatch(body);
		if (parsed.errors) throwInvalidFormBody(parsed.errors);

		const form = await createAppealForm(guild.id, { ...parsed.data, name }).catch(
			throwAppealFormError,
		);

		auditAppealFormChange(event, null, form, form.name);
		setResponseStatus(event, 201);
		return form;
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
