import { coerceBigIntFields, serializeSettings, writeSettingsTransaction } from "#server/database";
import { isNullOrUndefined, isNullishOrEmpty } from "@sapphire/utilities";
import { createError } from "evlog";
import * as v from "valibot";

const settingsUpdateSchema = v.object({
	data: v.optional(v.array(v.tuple([v.string(), v.unknown()]))),
});

defineRouteMeta({
	openAPI: {
		description: "Update guild settings",
		parameters: [
			{
				description: "The guild ID to update settings for",
				in: "path",
				name: "guild",
				required: true,
			},
		],
		requestBody: {
			content: {
				"application/json": {
					schema: {
						items: {
							properties: {
								key: { type: "string" },
								value: { type: "object" },
							},
							required: ["key", "value"],
							type: "object",
						},
						type: "array",
					},
				},
			},
			description: "Settings data to update",
			required: true,
		},
		responses: {
			200: {
				content: {
					"application/text": {
						schema: { type: "string" },
					},
				},
				description: "Successful response with updated settings",
			},
			400: {
				description: "Bad Request - Invalid input data",
			},
			401: {
				description: "Unauthorized - Missing or invalid authentication",
			},
			403: {
				description: "Forbidden - Insufficient permissions",
			},
			429: { description: "Rate limit exceeded" },
		},
		tags: ["General"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const body = await readValidatedBody(event, (body) => v.parse(settingsUpdateSchema, body));

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
