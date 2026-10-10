import type { GuildData, ReadonlyGuildData } from "#server/database/settings/types";
import type { Awaitable } from "@sapphire/utilities";
import { db } from "#server/database/prisma";
import { getDefaultGuildSettings } from "#server/database/settings/constants";
import {
	getSettingsContext,
	updateSettingsContext,
} from "#server/database/settings/context/functions";
import { fetchGuildData, writeGuildData } from "#server/database/settings/storage";
import { Collection } from "@discordjs/collection";
import { AsyncQueue } from "@sapphire/async-queue";

const cache = new Collection<string, GuildData>();
const queue = new Collection<string, Promise<GuildData>>();
const locks = new Collection<string, AsyncQueue>();

/**
 * Serializes settings for an API response. Snowflakes are already strings in
 * `GuildData`, so nothing in it needs a custom replacer.
 */
export function serializeSettings(data: ReadonlyGuildData, space?: string | number) {
	return JSON.stringify(data, null, space);
}

export function readSettings(guildId: string): Awaitable<ReadonlyGuildData> {
	return cache.get(guildId) ?? processFetch(guildId);
}

export function readSettingsPermissionNodes(settings: ReadonlyGuildData) {
	return getSettingsContext(settings).permissionNodes;
}

export async function writeSettingsTransaction(id: string) {
	const lock = locks.ensure(id, () => new AsyncQueue());

	// Acquire a write lock:
	await lock.wait();

	// The bot writes these tables too, so the write is made on what the
	// database has now rather than on whatever this process cached earlier.
	const settings = await unlockOnThrow(processFetch(id, true), lock);

	return new Transaction(settings, lock);
}

class Transaction {
	#changes = Object.create(null) as Partial<ReadonlyGuildData>;
	#hasChanges = false;
	#locking = true;

	public constructor(
		public readonly settings: ReadonlyGuildData,
		private readonly queue: AsyncQueue,
	) {}

	public get hasChanges() {
		return this.#hasChanges;
	}

	public get locking() {
		return this.#locking;
	}

	public write(data: Partial<ReadonlyGuildData>) {
		Object.assign(this.#changes, data);
		this.#hasChanges = true;
		return this;
	}

	public async submit() {
		if (!this.#hasChanges) {
			return;
		}

		try {
			// Write the merged settings, so the rows created for the first time
			// carry every column and not just the changes:
			await writeGuildData(db, { ...this.settings, ...this.#changes }, this.#changes);

			Object.assign(this.settings, this.#changes);
			this.#hasChanges = false;
			updateSettingsContext(this.settings, this.#changes);
		} finally {
			this.#changes = Object.create(null);

			if (this.#locking) {
				this.queue.shift();
				this.#locking = false;
			}
		}
	}

	public abort() {
		if (this.#locking) {
			this.queue.shift();
			this.#locking = false;
		}
	}

	public dispose() {
		if (this.#locking) {
			this.queue.shift();
			this.#locking = false;
		}
	}

	public [Symbol.dispose]() {
		return this.dispose();
	}
}

async function unlockOnThrow(promise: Promise<ReadonlyGuildData>, lock: AsyncQueue) {
	try {
		return await promise;
	} catch (error) {
		lock.shift();
		throw error;
	}
}

/**
 * Reads the settings of a guild from the database, once for the callers that
 * ask at the same time.
 *
 * @param fresh - Whether a read that is already running is not enough: it may
 * have started before a write.
 */
async function processFetch(id: string, fresh = false): Promise<ReadonlyGuildData> {
	const previous = queue.get(id);
	if (previous && !fresh) {
		return previous;
	}

	const promise = fetch(id);
	queue.set(id, promise);
	try {
		const value = await promise;
		getSettingsContext(value);
		return value;
	} finally {
		if (queue.get(id) === promise) queue.delete(id);
	}
}

async function fetch(id: string): Promise<GuildData> {
	// A guild without rows reads as the defaults; its rows are created by the first write:
	const data =
		(await fetchGuildData(db.orm, id)) ??
		(Object.assign(Object.create(null), getDefaultGuildSettings(), { id }) as GuildData);
	cache.set(id, data);
	return data;
}
