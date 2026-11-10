interface RegisteredCommandEntry {
	/** `null` when Discord has no such command here. */
	id: string | null;
	name: string;
	/** The bot's piece name, which the command's rule targets. */
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
 * Discord's own permissions of the bot's commands in a guild, which a command's
 * rules are written as when they are also in Discord. The tiles and the rule
 * editor share them through the key, and a write updates them for both.
 */
export function useCommandPermissions(guildId: MaybeRefOrGetter<string | null>) {
	const { data, error, pending, refresh } = useFetch<CommandPermissionsResponse>(
		() => `/api/guilds/${toValue(guildId)}/command-permissions`,
		{
			key: computed(() => `command-permissions:${toValue(guildId)}`),
			immediate: toValue(guildId) !== null,
		},
	);

	/**
	 * The Discord id of a rule's target: the application id, the app default,
	 * for every command, and `null` for a command Discord has not registered here
	 * or while the permissions are not read.
	 */
	function commandIdOf(target: string): string | null {
		if (!data.value) return null;
		if (target === EVERY_COMMAND) return data.value.applicationId;
		return data.value.commands.find((entry) => entry.command === target)?.id ?? null;
	}

	/** A command's rows as read; empty when it has none, and so uses the app default. */
	function rowsOf(commandId: string): Overwrite[] {
		return data.value?.permissions[commandId] ?? [];
	}

	/**
	 * Replaces a command's whole set with `rows`. The write sends the snapshot
	 * of the set as read, so Discord's set changed since is refused (409) and not
	 * overwritten. Throws what the route answers.
	 */
	async function write(commandId: string, rows: Overwrite[]): Promise<void> {
		const id = toValue(guildId);
		if (!id) return;
		const saved = await $fetch<{ permissions: Overwrite[] }>(
			`/api/guilds/${id}/command-permissions/${commandId}`,
			{
				method: "PUT",
				body: {
					snapshot: snapshotOf({ [commandId]: rowsOf(commandId) }),
					permissions: rows,
				},
			},
		);
		// The admin may have moved to another guild meanwhile.
		if (data.value && toValue(guildId) === id) {
			data.value = {
				...data.value,
				permissions: { ...data.value.permissions, [commandId]: saved.permissions },
			};
		}
	}

	return { commandIdOf, data, error, pending, refresh, rowsOf, write };
}
