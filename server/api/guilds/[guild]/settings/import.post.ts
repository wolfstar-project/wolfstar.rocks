import type { ConfigurationImportResponse } from "#shared/utils/settings-transfer";
import { readSettings } from "#server/database";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeAutoModerationManager, useManagedGuild } from "#server/utils/automod/route";
import { readAutoModerationRules } from "#server/utils/automod/rules";
import {
	applyConfigurationImport,
	ConfigurationImportStaleError,
} from "#server/utils/settings-transfer/apply";
import { parseConfigurationFile } from "#server/utils/settings-transfer/parse";
import {
	planConfigurationImport,
	summarizeConfigurationPlan,
} from "#server/utils/settings-transfer/plan";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { ConfigurationImportSchema } from "#shared/schemas";
import { createError, useLogger, withAuditMethods } from "evlog";
import { parse } from "valibot";

/**
 * `POST /api/guilds/:guild/settings/import`: reads a file of the settings and
 * the auto-moderation rules of a guild. Without `apply` nothing is written and
 * the answer is what the file would change, or everything that is wrong in it;
 * with it, what the file says is written in one transaction, worked out again
 * from what the database has by then.
 */
export default defineWrappedResponseHandler(
	async (event): Promise<ConfigurationImportResponse> => {
		const { guild, member } = useManagedGuild(event);
		const body = await readValidatedBody(event, (value) =>
			parse(ConfigurationImportSchema, value),
		);

		const rules = await readAutoModerationRules(guild.id);
		const parsed = parseConfigurationFile(body.text, rules);
		if (!parsed.ok) return { ok: false, issues: parsed.issues };

		if (!body.apply) {
			const plan = planConfigurationImport(await readSettings(guild.id), rules, parsed.value);
			return {
				ok: true,
				applied: false,
				preview: summarizeConfigurationPlan(plan, parsed.value),
			};
		}

		const applied = await applyConfigurationImport(guild, parsed.value).catch(
			(error: unknown) => {
				if (!(error instanceof ConfigurationImportStaleError)) throw error;
				throw createError({
					message: "The server changed while the file was being read",
					status: 409,
					why: "A list of a rule of the file is longer than the server allows by now",
					fix: "Read the file again",
				});
			},
		);

		const preview = summarizeConfigurationPlan(applied.plan, parsed.value);
		if (!applied.plan.isEmpty) {
			withAuditMethods(useLogger(event)).audit(
				guildSettingsUpdate({
					actor: { type: "user", id: member.user.id, displayName: member.user.username },
					target: { type: "guild", id: guild.id },
					outcome: "success",
					changes: compactSettingsChanges(applied.audit.before, applied.audit.after),
				}),
			);
		}

		return {
			ok: true,
			applied: true,
			preview,
			settings: applied.settings,
			rules: applied.rules,
		};
	},
	{
		auth: true,
		authorize: authorizeAutoModerationManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
