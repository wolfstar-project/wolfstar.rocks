import type { APIGuildMember } from "discord-api-types/v10";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { mapWithConcurrency } from "#server/utils/mapWithConcurrency";
import { MEMBER_SEARCH_LIMIT, MemberSearchQuerySchema } from "#shared/schemas/member-search";
import { isSnowflake } from "#shared/utils/snowflake";
import { DiscordAPIError } from "@discordjs/rest";
import { RESTJSONErrorCodes } from "discord-api-types/v10";
import { parse } from "valibot";

/**
 * `GET /api/guilds/:guild/members/search`: the members to pick from, for the
 * dashboard access rules and the command permissions. `query` searches the
 * names (a pasted id is looked up as such); `ids` resolves members already
 * picked, and leaves out those no longer in the server.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const input = await getValidatedQuery(event, (query) =>
			parse(MemberSearchQuerySchema, query),
		);
		const api = useApi();

		const lookUp = (id: string): Promise<APIGuildMember | null> =>
			api.guilds.getMember(guild.id, id).catch((error: unknown) => {
				if (
					error instanceof DiscordAPIError &&
					error.code === RESTJSONErrorCodes.UnknownMember
				) {
					return null;
				}
				throw error;
			});

		let members: (APIGuildMember | null)[];
		if ("ids" in input) {
			members = await mapWithConcurrency(input.ids, 5, lookUp);
		} else if (isSnowflake(input.query)) {
			members = [await lookUp(input.query)];
		} else {
			members = await api.guilds.searchForMembers(guild.id, {
				query: input.query,
				limit: MEMBER_SEARCH_LIMIT,
			});
		}

		return members
			.filter((member): member is APIGuildMember => member !== null)
			.map((member) => flattenMember(member, guild));
	},
	{
		auth: true,
		authorize: authorizeGuildManager("Insufficient permissions to search members"),
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
