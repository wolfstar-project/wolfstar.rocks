import { snapshotOf, type Overwrite } from "#shared/utils/command-permissions";
import { runSequentialSaves, stageRows, type SaveOutcome } from "~/utils/command-permissions-run";

export interface RegisteredCommandEntry {
	/** `null` when Discord has no such command here. */
	id: string | null;
	name: string;
	command: string;
	category: string;
	description: string;
}

export interface CommandPermissionsResponse {
	applicationId: string;
	commands: RegisteredCommandEntry[];
	/** Discord's sets, by command id; the application id is the app default. */
	permissions: Record<string, Overwrite[]>;
	snapshot: string;
	authorization: { scopeGranted: boolean; manageGuild: boolean; manageRoles: boolean };
}

/**
 * Discord's command permissions of a guild and the edits staged on them. Edits
 * stay here until `saveAll` sends them, one command after another; nothing is
 * written as it is edited. With `immediate: false` nothing is asked of Discord
 * until `refresh`.
 */
export function useCommandPermissions(
	guildId: MaybeRefOrGetter<string | null>,
	{ immediate = true }: { immediate?: boolean } = {},
) {
	const { data, pending, refresh, error } = useFetch<CommandPermissionsResponse>(
		() => `/api/guilds/${toValue(guildId)}/command-permissions`,
		{
			key: computed(() => `command-permissions:${toValue(guildId)}`),
			immediate: immediate && toValue(guildId) !== null,
		},
	);

	// Kept per guild beyond this page, so a section switch does not drop them.
	const { drafts, settle } = useCommandPermissionDrafts(guildId);

	const savedRows = (commandId: string): Overwrite[] => data.value?.permissions[commandId] ?? [];
	const rowsOf = (commandId: string): Overwrite[] =>
		drafts.value[commandId]?.rows ?? savedRows(commandId);

	/** The rows a command's draft was made on, or Discord's rows without a draft. */
	const baseRows = (commandId: string): Overwrite[] =>
		drafts.value[commandId]?.base ?? savedRows(commandId);

	function setRows(commandId: string, rows: Overwrite[]) {
		drafts.value = stageRows(drafts.value, commandId, rows, savedRows(commandId));
	}

	const resetToDefault = (commandId: string) => setRows(commandId, []);

	function discard(commandId: string) {
		const next = { ...drafts.value };
		delete next[commandId];
		drafts.value = next;
	}

	const changedCommandIds = computed(() => Object.keys(drafts.value));

	async function saveAll(): Promise<SaveOutcome> {
		const id = toValue(guildId);
		if (!id) return { sent: [], failed: null };
		// Captured with the guild: the admin may switch guilds before the writes end.
		const staged = { ...drafts.value };
		const list = Object.entries(staged).map(([commandId, draft]) => ({
			commandId,
			permissions: draft.rows,
			// The rows the edit was made on, not the ones a later reload brought.
			snapshot: snapshotOf({ [commandId]: draft.base }),
		}));
		const outcome = await runSequentialSaves(list, async (commandId, body) => {
			await $fetch(`/api/guilds/${id}/command-permissions/${commandId}`, {
				method: "PUT",
				body,
			});
		});
		settle(id, staged, outcome.sent);
		await refresh();
		return outcome;
	}

	return {
		baseRows,
		changedCommandIds,
		data,
		discard,
		error,
		pending,
		refresh,
		resetToDefault,
		rowsOf,
		saveAll,
		savedRows,
		setRows,
	};
}
