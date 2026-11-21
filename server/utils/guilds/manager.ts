import type { APIGuild, APIGuildMember } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { guildSettingsAccessDenied } from "#shared/audit/actions";
import { createError, useLogger, withAuditMethods } from "evlog";

interface ManagedGuild {
	guild: APIGuild;
	member: APIGuildMember;
}

// The `authorize` hook cannot hand its result to the handler, and resolving
// the member twice would cost a second Discord round trip per request.
const managedGuilds = new WeakMap<H3Event, ManagedGuild>();

/**
 * Builds the `authorize` hook of a route that changes something of a guild:
 * it resolves the guild of the path and checks that who asks can manage it. A
 * refusal is audited, as it is for the settings routes, with `deniedReason`.
 */
export function authorizeGuildManager(deniedReason: string) {
	return async (event: H3Event): Promise<void> => {
		const log = withAuditMethods(useLogger(event));
		const guildId = getGuildParam(event);

		const guild = await getGuild(guildId);
		if (!guild) {
			throw createError({
				message: "Guild not found",
				status: 404,
				why: `The bot is not a member of guild ${guildId}`,
				fix: "check bot is a member of the guild",
			});
		}

		const member = await getCurrentMember(event, guild.id);
		log.set({ guild: { id: guildId }, member: { id: member.user.id } });

		try {
			await canManage(guild, member);
		} catch (error) {
			const status =
				error instanceof Error && "status" in error
					? (error as { status: number }).status
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
						reason: deniedReason,
					}),
				);
			}
			throw error;
		}

		managedGuilds.set(event, { guild, member });
	};
}

/** The guild and member an {@linkcode authorizeGuildManager} hook resolved. */
export function useManagedGuild(event: H3Event): ManagedGuild {
	const managed = managedGuilds.get(event);
	if (!managed) {
		throw createError({
			message: "Guild authorization did not run",
			status: 500,
			why: "The route handler ran without its authorize hook",
			fix: "Pass an authorizeGuildManager hook as the route's authorize option",
		});
	}
	return managed;
}
