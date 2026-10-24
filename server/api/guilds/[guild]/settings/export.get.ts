import { readFreshSettings } from "#server/database";
import { authorizeAutoModerationManager, useManagedGuild } from "#server/utils/automod/route";
import { readAutoModerationRules } from "#server/utils/automod/rules";
import { createConfigurationFile } from "#server/utils/settings-transfer/format";
import { ConfigurationFileName } from "#shared/utils/settings-transfer";

/**
 * `GET /api/guilds/:guild/settings/export`: the settings that do not depend on
 * the guild and its auto-moderation rules, in the file the bot's
 * `/settings server export` writes.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		// A backup made of a stale copy would undo, once restored, what the bot or
		// another instance of the dashboard saved since this process last read.
		const [settings, rules] = await Promise.all([
			readFreshSettings(guild.id),
			readAutoModerationRules(guild.id),
		]);

		setHeader(event, "content-disposition", `attachment; filename="${ConfigurationFileName}"`);
		return createConfigurationFile(settings, rules);
	},
	{
		auth: true,
		authorize: authorizeAutoModerationManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 5, window: seconds(10) },
	},
);
