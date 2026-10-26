import { overwritesEqual, snapshotOf, type Overwrite } from "#shared/utils/command-permissions";
import { runSequentialSaves, type SaveOutcome } from "~/utils/command-permissions-run";

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
 * written as it is edited.
 */
export function useCommandPermissions(guildId: MaybeRefOrGetter<string | null>) {
	const { data, pending, refresh, error } = useFetch<CommandPermissionsResponse>(
		() => `/api/guilds/${toValue(guildId)}/command-permissions`,
		{
			key: computed(() => `command-permissions:${toValue(guildId)}`),
			immediate: toValue(guildId) !== null,
		},
	);

	const drafts = ref<Record<string, Overwrite[]>>({});

	const savedRows = (commandId: string): Overwrite[] => data.value?.permissions[commandId] ?? [];
	const rowsOf = (commandId: string): Overwrite[] =>
		drafts.value[commandId] ?? savedRows(commandId);

	function setRows(commandId: string, rows: Overwrite[]) {
		const next = { ...drafts.value };
		if (overwritesEqual(rows, savedRows(commandId))) delete next[commandId];
		else next[commandId] = rows;
		drafts.value = next;
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
		const list = changedCommandIds.value.map((commandId) => ({
			commandId,
			permissions: drafts.value[commandId] ?? [],
			snapshot: snapshotOf({ [commandId]: savedRows(commandId) }),
		}));
		const outcome = await runSequentialSaves(list, async (commandId, body) => {
			await $fetch(`/api/guilds/${id}/command-permissions/${commandId}`, {
				method: "PUT",
				body,
			});
		});
		for (const commandId of outcome.sent) discard(commandId);
		await refresh();
		return outcome;
	}

	return {
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
