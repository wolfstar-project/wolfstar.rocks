import type { StagedDraft } from "~/utils/command-permissions-run";

/**
 * The unsent command permission edits of a guild, by command id. Kept per guild
 * for the session like the staged settings: they survive a section switch, count
 * as unsaved changes when the admin leaves the guild, and go with a discard.
 * `guildId` defaults to the active guild.
 */
export function useCommandPermissionDrafts(guildId?: MaybeRefOrGetter<string | null>) {
	const { activeGuildId } = useActiveGuild();
	const store = useState<Record<string, Record<string, StagedDraft>>>(
		"guild:command-permissions:drafts",
		() => ({}),
	);

	const id = computed(() => (guildId === undefined ? activeGuildId.value : toValue(guildId)));

	const drafts = computed<Record<string, StagedDraft>>({
		get: () => (id.value ? store.value[id.value] : undefined) ?? {},
		set: (next) => {
			if (!id.value) return;
			store.value = { ...store.value, [id.value]: next };
		},
	});

	const hasDrafts = computed(() => Object.keys(drafts.value).length > 0);

	function discardAll() {
		drafts.value = {};
	}

	return { discardAll, drafts, hasDrafts };
}
