/** The channels a set of logs posts to, as one picker for all of them shows it. */
export type SharedLogChannel =
	| { kind: "none" }
	| { kind: "same"; channel: string }
	| { kind: "mixed" };

/** How many of a set of logs are ticked, as its "select all" checkbox shows it. */
export type LogSelectionState = "none" | "some" | "all";

type ChannelValues<Key extends string> = Readonly<Partial<Record<Key, string | null>>>;

/**
 * The one channel every log of `keys` posts to, `none` when none of them is
 * logged (or there are no keys), and `mixed` otherwise, including when only
 * some of them are logged.
 */
export function sharedLogChannel<Key extends string>(
	values: ChannelValues<Key>,
	keys: readonly Key[],
): SharedLogChannel {
	const channels = new Set(keys.map((key) => values[key] ?? null));
	if (channels.size !== 1) return channels.size === 0 ? { kind: "none" } : { kind: "mixed" };

	const [channel] = channels;
	return typeof channel === "string" ? { channel, kind: "same" } : { kind: "none" };
}

/**
 * The changes that make every log of `keys` post to `channel`, or stop being
 * logged when it is `null`. Logs that already hold that value are left out, so
 * assigning the result does not stage anything for them.
 */
export function logChannelChanges<Key extends string>(
	values: ChannelValues<Key>,
	keys: readonly Key[],
	channel: string | null,
): Partial<Record<Key, string | null>> {
	const changes: Partial<Record<Key, string | null>> = {};
	for (const key of keys) {
		if ((values[key] ?? null) !== channel) changes[key] = channel;
	}
	return changes;
}

/** Whether none, some or all of `keys` are in `selected`. */
export function logSelectionState<Key extends string>(
	selected: ReadonlySet<Key>,
	keys: readonly Key[],
): LogSelectionState {
	const count = keys.filter((key) => selected.has(key)).length;
	if (count === 0) return "none";
	return count === keys.length ? "all" : "some";
}

/** `selected` with every key of `keys` added, or removed when `ticked` is false. */
export function toggleLogSelection<Key extends string>(
	selected: ReadonlySet<Key>,
	keys: readonly Key[],
	ticked: boolean,
): Set<Key> {
	const next = new Set(selected);
	for (const key of keys) {
		if (ticked) next.add(key);
		else next.delete(key);
	}
	return next;
}
