import { deleteAppealForm } from "#server/utils/appeals/forms";
import {
	auditAppealFormChange,
	authorizeAppealFormManager,
	throwAppealFormError,
} from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

/** `DELETE /api/guilds/:guild/appeals/forms/:form`: deletes a form. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const formId = getRouterParam(event, "form") ?? "";

		const form = await deleteAppealForm(guild.id, formId).catch(throwAppealFormError);

		auditAppealFormChange(event, form, null, form.name);
		setResponseStatus(event, 204);
		return null;
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
