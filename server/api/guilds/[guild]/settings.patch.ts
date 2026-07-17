import { SettingsUpdateSchema } from "#shared/schemas";
import { isNullOrUndefined, isNullishOrEmpty } from "@sapphire/utilities";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

/**
 * Proxies to the internal bot API: PATCH /guilds/:guild/settings
 * Adds `guild_id` expected by the bot while accepting the dashboard body shape.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);
		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const body = await readValidatedBody(event, (raw) => parse(SettingsUpdateSchema, raw));

		if (isNullOrUndefined(body) || isNullOrUndefined(body.data)) {
			throw createError({
				message: "Invalid request body or missing data",
				status: 400,
				why: "The request body is missing or does not contain a 'data' field",
				fix: "Send a JSON body with a 'data' array of [key, value] tuples",
			});
		}

		if (isNullishOrEmpty(body.data)) {
			throw createError({
				message: "Data array cannot be empty",
				status: 400,
				why: "The 'data' field is present but contains no entries",
				fix: "Provide at least one [key, value] tuple in the data array",
			});
		}

		return await fetchBotApi(event, `/guilds/${guildId}/settings`, {
			method: "PATCH",
			body: {
				guild_id: guildId,
				data: body.data,
			},
		});
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
