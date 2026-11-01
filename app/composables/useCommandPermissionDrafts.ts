import type { StagedDraft } from "~/utils/command-permissions-run";
import { overwritesEqual } from "#shared/utils/command-permissions";

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

	/**
	 * Drops the drafts of `sentIds` that a save took from `staged` and sent to
	 * `sentGuildId`, which need not be the active guild any more. A draft edited
	 * again while the save ran stays, rebased on the rows the save wrote, so its
	 * own save is checked against what Discord holds now.
	 */
	function settle(
		sentGuildId: string,
		staged: Readonly<Record<string, StagedDraft>>,
		sentIds: readonly string[],
	) {
		const current = store.value[sentGuildId];
		if (!current) return;
		const next = { ...current };
		for (const commandId of sentIds) {
			const sent = staged[commandId];
			const draft = next[commandId];
			if (!sent || !draft) continue;
			if (overwritesEqual(draft.rows, sent.rows)) delete next[commandId];
			else next[commandId] = { rows: draft.rows, base: sent.rows };
		}
		store.value = { ...store.value, [sentGuildId]: next };
	}

	return { discardAll, drafts, hasDrafts, settle };
}
