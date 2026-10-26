import {
	allChannelsId,
	everyoneId,
	overwritesEqual,
	type Overwrite,
} from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";

export interface SaveOutcome {
	/** The commands Discord saved, in order. */
	sent: string[];
	/** The command the run stopped at, with the server's error code. */
	failed: { commandId: string; code: string } | null;
}

export interface CommandPermissionsDraft {
	commandId: string;
	permissions: Overwrite[];
	/** The snapshot of the command's set as the page read it. */
	snapshot: string;
}

function errorCode(error: unknown): string {
	const data = (error as { data?: { code?: unknown; data?: { code?: unknown } } } | null)?.data;
	const code = data?.code ?? data?.data?.code;
	return typeof code === "string" ? code : "unknown";
}

/**
 * Sends the drafts one after another, as Discord takes one command a request
 * and limits each route. Stops at the first refusal: the commands before it
 * stay saved, the ones after it are not sent.
 */
export async function runSequentialSaves(
	drafts: readonly CommandPermissionsDraft[],
	save: (
		commandId: string,
		body: { snapshot: string; permissions: Overwrite[] },
	) => Promise<void>,
): Promise<SaveOutcome> {
	const sent: string[] = [];
	for (const draft of drafts) {
		try {
			await save(draft.commandId, {
				snapshot: draft.snapshot,
				permissions: draft.permissions,
			});
		} catch (error) {
			return { sent, failed: { commandId: draft.commandId, code: errorCode(error) } };
		}
		sent.push(draft.commandId);
	}
	return { sent, failed: null };
}

interface AllowDeny {
	allow: string[];
	deny: string[];
}

/** A command's set as the editor shows it: allowed and denied lists, `@everyone` and All channels apart. */
export interface PermissionLists {
	/** `null` when the set has no `@everyone` row. */
	everyone: boolean | null;
	/** `null` when the set has no All channels row. */
	allChannels: boolean | null;
	roles: AllowDeny;
	users: AllowDeny;
	channels: AllowDeny;
}

export function rowsToLists(rows: readonly Overwrite[], guildId: string): PermissionLists {
	const lists: PermissionLists = {
		everyone: null,
		allChannels: null,
		roles: { allow: [], deny: [] },
		users: { allow: [], deny: [] },
		channels: { allow: [], deny: [] },
	};
	const everyone = everyoneId(guildId);
	const allChannels = allChannelsId(guildId);
	for (const row of rows) {
		const side = row.permission ? "allow" : "deny";
		if (row.type === ApplicationCommandPermissionType.Role) {
			if (row.id === everyone) lists.everyone = row.permission;
			else lists.roles[side].push(row.id);
		} else if (row.type === ApplicationCommandPermissionType.User) {
			lists.users[side].push(row.id);
		} else if (row.id === allChannels) {
			lists.allChannels = row.permission;
		} else {
			lists.channels[side].push(row.id);
		}
	}
	return lists;
}

export function listsToRows(lists: PermissionLists, guildId: string): Overwrite[] {
	const rows: Overwrite[] = [];
	const push = (type: ApplicationCommandPermissionType, { allow, deny }: AllowDeny) => {
		for (const id of allow) rows.push({ id, type, permission: true });
		for (const id of deny) if (!allow.includes(id)) rows.push({ id, type, permission: false });
	};
	if (lists.everyone !== null) {
		rows.push({
			id: everyoneId(guildId),
			type: ApplicationCommandPermissionType.Role,
			permission: lists.everyone,
		});
	}
	push(ApplicationCommandPermissionType.Role, lists.roles);
	push(ApplicationCommandPermissionType.User, lists.users);
	if (lists.allChannels !== null) {
		rows.push({
			id: allChannelsId(guildId),
			type: ApplicationCommandPermissionType.Channel,
			permission: lists.allChannels,
		});
	}
	push(ApplicationCommandPermissionType.Channel, lists.channels);
	return rows;
}

/** A command's edited rows, with Discord's rows the edit was made on. */
export interface StagedDraft {
	rows: Overwrite[];
	base: Overwrite[];
}

/**
 * Stages `rows` for a command. A draft keeps the rows it was first made on,
 * whatever Discord holds since: its snapshot is sent from them, so a set that
 * changed in Discord after the edit began is refused instead of overwritten.
 */
export function stageRows(
	drafts: Readonly<Record<string, StagedDraft>>,
	commandId: string,
	rows: Overwrite[],
	saved: Overwrite[],
): Record<string, StagedDraft> {
	const base = drafts[commandId]?.base ?? saved;
	const next = { ...drafts };
	if (overwritesEqual(rows, base)) delete next[commandId];
	else next[commandId] = { rows, base };
	return next;
}
