import { Collection } from "@discordjs/collection";
import { AsyncQueue } from "@sapphire/async-queue";

/**
 * Whether a request may wait on work another request started: a lock it holds,
 * a read it is making. On Cloudflare Workers it may not. The runtime cancels a
 * request as hung once its own code has nothing left to run, though the request
 * it waits on is still working, and a request that is cancelled never lets go of
 * what it holds. A Worker's isolate is one of many anyway, so what is shared in
 * its memory orders little.
 */
export function canWaitOnOtherRequests() {
	return globalThis.navigator?.userAgent !== "Cloudflare-Workers";
}

/**
 * An in-process mutex per key: `run(key, fn)` runs `fn` once the calls made
 * before it with the same key are done. It orders the calls of this process
 * only. Where requests cannot wait on each other (see
 * {@linkcode canWaitOnOtherRequests}), it runs `fn` at once.
 */
export function createKeyedLock<K = string>() {
	const queues = new Collection<K, AsyncQueue>();

	return async function run<T>(key: K, fn: () => Promise<T>): Promise<T> {
		if (!canWaitOnOtherRequests()) {
			return fn();
		}

		const queue = queues.ensure(key, () => new AsyncQueue());
		await queue.wait();
		try {
			return await fn();
		} finally {
			queue.shift();
			if (queue.remaining === 0) {
				queues.delete(key);
			}
		}
	};
}
