import { coerceBigIntFields, serializeSettings, writeSettingsTransaction } from "#server/database";
import { SettingsUpdateSchema } from "#shared/schemas";
import { isNullOrUndefined, isNullishOrEmpty } from "@sapphire/utilities";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const body = await readValidatedBody(event, (body) => parse(SettingsUpdateSchema, body));

		if (isNullOrUndefined(body) || isNullOrUndefined(body.data)) {
			throw createError({
				message: "Invalid request body or missing data",
				status: 400,
				why: "The request body is missing or does not contain a 'data' field",
				fix: "Send a JSON body with a 'data' array of [key, value] tuples",
			});
		}

		const { data } = body;

		if (isNullishOrEmpty(data)) {
			throw createError({
				message: "Data array cannot be empty",
				status: 400,
				why: "The 'data' field is present but contains no entries",
				fix: "Provide at least one [key, value] tuple in the data array",
			});
		}

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		using trx = await writeSettingsTransaction(guild.id);

		if (!data.every((entry): entry is [string, any] => entry !== undefined)) {
			throw createError({
				message: "Invalid data entries",
				status: 400,
				why: "All data entries must be valid [key, value] tuples",
				fix: "Ensure every entry in the data array is a two-element array",
			});
		}

		const settingsData = Object.fromEntries(data);
		log.set({ settings: { keysUpdated: Object.keys(settingsData).length } });

		// Coerce BigInt fields from JSON (numbers/strings) to BigInt
		coerceBigIntFields(settingsData);

		await trx.write(settingsData).submit();
		return serializeSettings(trx.settings);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
