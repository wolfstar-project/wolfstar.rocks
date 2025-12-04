import { manageAbility } from "#shared/utils/abilities";
import {
  isNullishOrEmpty,
  isNullOrUndefined,
} from "@sapphire/utilities";
import * as yup from "yup";
import {
  serializeSettings,
  writeSettingsTransaction,
} from "~~/server/database";

const settingsUpdateSchema = yup.object({
  data: yup
    .array()
    .of(yup.tuple([yup.string().required(), yup.mixed().required()])),
});

defineRouteMeta({
  openAPI: {
    tags: ["General"],
    description: "Update guild settings",
    requestBody: {
      description: "Settings data to update",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                value: { type: "object" },
              },
              required: ["key", "value"],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successful response with updated settings",
        content: {
          "application/text": {
            schema: { type: "string" },
          },
        },
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
    parameters: [
      {
        in: "path",
        name: "guild",
        required: true,
        description: "The guild ID to update settings for",
      },
    ],
  },
});

export default defineWrappedResponseHandler(
  async (event) => {
    // Get guild ID from params
    const guildId = getGuildParam(event);

    // Get and validate body data
    const body = await readValidatedBody(event, (body) =>
      settingsUpdateSchema.validate(body));

    if (isNullOrUndefined(body) || isNullOrUndefined(body.data)) {
      throw createApiError({
        statusCode: 400,
        message: "Invalid request body or missing data",
        data: {
          field: "body",
          error: "invalid_request_body",
          message: "Invalid request body or missing data",
        },
      });
    }

    const { data } = body;

    if (isNullishOrEmpty(data)) {
      throw createApiError({
        statusCode: 400,
        message: "Data array cannot be empty",
        data: {
          field: "data",
          error: "empty_data_array",
          message: "Data array cannot be empty",
        },
      });
    }

    const { user } = await getCurrentUser(event);

    const guild = await getGuild(guildId);

    // Fetch member data
    const member = await getMember(guild, user);

    // Check permissions
    if (await denies(event, manageAbility, guild, member)) {
      throw createApiError({
        statusCode: 403,
        message: "Insufficient permissions",
        data: {
          error: "insufficient_permissions",
          message: "Insufficient permissions",
          details: {
            guild: guild.id,
            member: member.user.id,
          },
        },
      });
    }

    // Update settings
    const trx = await writeSettingsTransaction(guild.id);

    if (!data.every((entry): entry is [string, any] => entry !== undefined)) {
      throw createApiError({
        statusCode: 400,
        message: "Invalid data entries",
        data: {
          error: "invalid_data_entries",
          message: "All data entries must be valid [key, value] tuples",
        },
      });
    }

    await trx
      .write(
        Object.fromEntries(
          data,
        ),
      )
      .submit();
    return serializeSettings(trx.settings);
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: seconds(1), limit: 2 },
    onSuccess(logger) {
      logger.info(`Successfully updated settings`);
    },
    onError(logger, error) {
      logger.error(String.raw`Settings API error:\nStatus - ${error.statusCode}\n${error.message}`);
    },
  },
);
