import { coerceBigIntFields, serializeSettings, writeSettingsTransaction } from "#server/database";
import { isNullOrUndefined, isNullishOrEmpty } from "@sapphire/utilities";
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
		const guildId = getGuildParam(event);

		// Get and validate body data
		const body = await readValidatedBody(event, (body) => v.parse(settingsUpdateSchema, body));

		if (isNullOrUndefined(body) || isNullOrUndefined(body.data)) {
			throw createError({
				data: {
					error: "invalid_request_body",
					field: "body",
					message: "Invalid request body or missing data",
				},
				message: "Invalid request body or missing data",
				status: 400,
			});
		}

		const { data } = body;

		if (isNullishOrEmpty(data)) {
			throw createError({
				data: {
					error: "empty_data_array",
					field: "data",
					message: "Data array cannot be empty",
				},
				message: "Data array cannot be empty",
				status: 400,
			});
		}

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		// Check permissions
		await canManage(guild, member);
		// Update settings
		using trx = await writeSettingsTransaction(guild.id);

		if (!data.every((entry): entry is [string, any] => entry !== undefined)) {
			throw createError({
				data: {
					error: "invalid_data_entries",
					message: "All data entries must be valid [key, value] tuples",
				},
				message: "Invalid data entries",
				status: 400,
			});
		}

		const settingsData = Object.fromEntries(data);

		// Coerce BigInt fields from JSON (numbers/strings) to BigInt
		coerceBigIntFields(settingsData);

		await trx.write(settingsData).submit();
		return serializeSettings(trx.settings);
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to update settings:", error);
		},
		onSuccess(logger) {
			logger.info(`Successfully updated settings`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
