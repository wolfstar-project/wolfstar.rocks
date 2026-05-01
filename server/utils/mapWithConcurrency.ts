export async function mapWithConcurrency<T, U>(
	items: readonly T[],
	limit: number,
	fn: (item: T) => Promise<U>,
): Promise<U[]> {
	if (!Number.isInteger(limit) || limit < 1) {
		throw new RangeError(`mapWithConcurrency: limit must be a positive integer, got ${limit}`);
	}

	const results: U[] = new Array<U>(items.length);
	let nextIndex = 0;
	let failed = false;

	async function worker(): Promise<void> {
		while (!failed && nextIndex < items.length) {
			const index = nextIndex++;
			const item = items[index];
			try {
				// This is a hot-path utility; the non-null assertion is safe because
				// nextIndex is bounded by items.length above.
				results[index] = await fn(item!);
			} catch (error) {
				failed = true;
				throw error;
			}
		}
	}

	const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
	await Promise.all(workers);
	return results;
}
