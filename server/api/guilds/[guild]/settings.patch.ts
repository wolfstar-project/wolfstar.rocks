import { coerceBigIntFields, serializeSettings, writeSettingsTransaction } from "#server/database";
import { guildSettingsAccessDenied, guildSettingsUpdate } from "#shared/audit/actions";
import { SettingsUpdateSchema } from "#shared/schemas";
import { isNullOrUndefined, isNullishOrEmpty } from "@sapphire/utilities";
import { auditDiff, createError, useLogger, withAuditMethods } from "evlog";
import { parse } from "valibot";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = withAuditMethods(useLogger(event));

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

		try {
			await canManage(guild, member);
		} catch (canManageErr) {
			const status =
				canManageErr instanceof Error && "status" in canManageErr
					? (canManageErr as { status: number }).status
					: null;
			if (status === 403) {
				log.audit(
					guildSettingsAccessDenied({
						actor: {
							type: "user",
							id: member.user.id,
							displayName: member.user.username,
						},
						target: { type: "guild", id: guild.id },
						outcome: "denied",
						reason: "Insufficient permissions to manage guild settings",
					}),
				);
			}
			throw canManageErr;
		}

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

		const beforeSettings = JSON.parse(serializeSettings(trx.settings)) as Record<
			string,
			unknown
		>;
		await trx.write(settingsData).submit();
		const afterSettings = JSON.parse(serializeSettings(trx.settings)) as Record<
			string,
			unknown
		>;

		log.audit(
			guildSettingsUpdate({
				actor: { type: "user", id: member.user.id, displayName: member.user.username },
				target: { type: "guild", id: guild.id },
				outcome: "success",
				changes: auditDiff(beforeSettings, afterSettings),
			}),
		);

		return JSON.stringify(afterSettings);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
