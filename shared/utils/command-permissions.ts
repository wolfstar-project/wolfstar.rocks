import {
	APIApplicationCommandPermissionsConstant,
	type APIApplicationCommandPermission,
} from "discord-api-types/v10";

/**
 * Discord's own permissions for the bot's commands in a server, the ones of
 * Server Settings → Integrations. One row (an overwrite, in Discord's words)
 * allows or denies a role, a member or a channel.
 *
 * Discord replaces a command's whole set on every write, so a change is always
 * read → changed → written back whole: {@link applyChanges} keeps every row it
 * does not touch.
 */
export type Overwrite = APIApplicationCommandPermission;

/**
 * The OAuth2 scope a user's token needs to edit command permissions: Discord
 * refuses the bot's token on that endpoint.
 */
export const COMMAND_PERMISSIONS_SCOPE = "applications.commands.permissions.update";

/** The `grant` the sign-in page reads to ask for {@link COMMAND_PERMISSIONS_SCOPE}. */
export const COMMAND_PERMISSIONS_GRANT = "command-permissions";

/** The most rows Discord keeps for one command. */
export const MAXIMUM_COMMAND_OVERWRITES = 100;

/** The id of the `@everyone` row: the server's own id. */
export function everyoneId(guildId: string): string {
	return APIApplicationCommandPermissionsConstant.Everyone(guildId);
}

/** The id of the "All channels" row: the server's id minus one. */
export function allChannelsId(guildId: string): string {
	return APIApplicationCommandPermissionsConstant.AllChannels(guildId);
}

function keyOf(row: Pick<Overwrite, "id" | "type">): string {
	return `${row.type}:${row.id}`;
}

/** The rows with one per role, member or channel, the last one winning, in a stable order. */
export function normalizeOverwrites(rows: readonly Overwrite[]): Overwrite[] {
	const byKey = new Map<string, Overwrite>();
	for (const row of rows)
		byKey.set(keyOf(row), { id: row.id, type: row.type, permission: row.permission });
	return [...byKey.values()].toSorted((a, b) => a.type - b.type || a.id.localeCompare(b.id));
}

/** Whether two sets hold the same rows, whatever their order. */
export function overwritesEqual(a: readonly Overwrite[], b: readonly Overwrite[]): boolean {
	const left = normalizeOverwrites(a);
	const right = normalizeOverwrites(b);
	return (
		left.length === right.length &&
		left.every(
			(row, index) =>
				row.id === right[index]?.id &&
				row.type === right[index]?.type &&
				row.permission === right[index]?.permission,
		)
	);
}

export type OverwriteChange =
	/** Adds a row, or flips the one of the same role, member or channel. */
	| { kind: "set"; row: Overwrite }
	| { kind: "remove"; id: string; type: Overwrite["type"] }
	/** Drops every row of the command, which then uses the app default. */
	| { kind: "reset" };

/** The full set to write: `current` with `changes` applied, every other row kept in place. */
export function applyChanges(
	current: readonly Overwrite[],
	changes: readonly OverwriteChange[],
): Overwrite[] {
	let rows = current.map((row) => ({ id: row.id, type: row.type, permission: row.permission }));
	for (const change of changes) {
		switch (change.kind) {
			case "reset": {
				rows = [];
				break;
			}
			case "remove": {
				const key = keyOf(change);
				rows = rows.filter((row) => keyOf(row) !== key);
				break;
			}
			case "set": {
				const key = keyOf(change.row);
				const index = rows.findIndex((row) => keyOf(row) === key);
				const row = {
					id: change.row.id,
					type: change.row.type,
					permission: change.row.permission,
				};
				rows = index === -1 ? [...rows, row] : rows.with(index, row);
				break;
			}
		}
	}
	return rows;
}

export class OverwriteLimitError extends Error {
	public readonly count: number;

	public constructor(count: number) {
		super(`A command holds at most ${MAXIMUM_COMMAND_OVERWRITES} permissions, not ${count}.`);
		this.name = "OverwriteLimitError";
		this.count = count;
	}
}

/** Throws {@link OverwriteLimitError} when a set holds more rows than Discord keeps. */
export function assertOverwriteLimit(rows: readonly Overwrite[]): void {
	const count = normalizeOverwrites(rows).length;
	if (count > MAXIMUM_COMMAND_OVERWRITES) throw new OverwriteLimitError(count);
}

export interface OverwriteDiff {
	added: Overwrite[];
	removed: Overwrite[];
	/** The rows kept with the other permission, as they will be. */
	flipped: Overwrite[];
}

/** What a write changes, for the preview. */
export function diffOverwrites(
	before: readonly Overwrite[],
	after: readonly Overwrite[],
): OverwriteDiff {
	const old = new Map(normalizeOverwrites(before).map((row) => [keyOf(row), row]));
	const next = new Map(normalizeOverwrites(after).map((row) => [keyOf(row), row]));
	const diff: OverwriteDiff = { added: [], removed: [], flipped: [] };
	for (const [key, row] of next) {
		const previous = old.get(key);
		if (!previous) diff.added.push(row);
		else if (previous.permission !== row.permission) diff.flipped.push(row);
	}
	for (const [key, row] of old) {
		if (!next.has(key)) diff.removed.push(row);
	}
	return diff;
}

/**
 * The rows a write adds or flips: the ones the editor answers for. The rows it
 * keeps were someone else's to set, and may name a role above the editor or one
 * deleted since.
 */
export function changedRows(
	before: readonly Overwrite[],
	after: readonly Overwrite[],
): Overwrite[] {
	const { added, flipped } = diffOverwrites(before, after);
	return normalizeOverwrites([...added, ...flipped]);
}

/** Whether a set is the app default: Discord keys it by the application id. */
export function isAppDefault(commandId: string, applicationId: string): boolean {
	return commandId === applicationId;
}

/** Whether a command has no rows of its own, and so uses the app default. */
export function usesAppDefault(rows: readonly Overwrite[] | undefined): boolean {
	return rows === undefined || rows.length === 0;
}

/**
 * A stable string of the sets, keyed by command id, that a write sends back to
 * show which state it was made on: a change in Discord since then changes it.
 */
export function snapshotOf(sets: Readonly<Record<string, readonly Overwrite[]>>): string {
	const keys = Object.keys(sets).toSorted();
	return JSON.stringify(
		keys.map((key) => [
			key,
			normalizeOverwrites(sets[key] ?? []).map((row) => [row.type, row.id, row.permission]),
		]),
	);
}
