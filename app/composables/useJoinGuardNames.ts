import type { JoinGuardNames } from "~/utils/join-guard";

/**
 * The names of the open guild's roles and channels, for the words of the
 * Join Guard section: a rule's tags and sentence name them, not their ids.
 */
export function useJoinGuardNames(): JoinGuardNames {
	const { guildData } = useGuildData();
	return {
		channel: (id) =>
			guildData.value?.channels.find((channel) => channel.id === id)?.name ?? null,
		role: (id) => guildData.value?.roles.find((role) => role.id === id)?.name ?? null,
	};
}
