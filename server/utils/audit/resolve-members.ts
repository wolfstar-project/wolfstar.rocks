import type { APIGuildMember } from "discord-api-types/v10";
import { getMember } from "#server/utils/discord";
import { GuildMemberFlags } from "discord-api-types/v10";

export function fallbackMember(userId: string): APIGuildMember {
	return {
		user: {
			id: userId,
			username: "Unknown User",
			discriminator: "0",
			avatar: null,
			global_name: null,
		},
		roles: [],
		joined_at: "",
		deaf: false,
		mute: false,
		flags: 0 as GuildMemberFlags,
	};
}

export async function resolveAuditMembers(
	guildId: string,
	userIds: string[],
): Promise<Map<string, APIGuildMember>> {
	const uniqueIds = [...new Set(userIds)];
	const settled = await Promise.allSettled(uniqueIds.map((id) => getMember(guildId, id)));

	const map = new Map<string, APIGuildMember>();
	for (let i = 0; i < uniqueIds.length; i++) {
		const result = settled[i];
		const userId = uniqueIds[i];
		if (result?.status === "fulfilled" && userId) {
			map.set(userId, result.value);
		}
	}
	return map;
}
