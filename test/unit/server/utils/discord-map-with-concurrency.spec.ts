import { mapWithConcurrency } from "#server/utils/mapWithConcurrency";
import { describe, expect, it, vi } from "vitest";

describe("mapWithConcurrency", () => {
	it("preserves result order regardless of completion timing", async () => {
		const items = [3, 1, 2];

		const fn = async (delay: number) => {
			await new Promise<void>((resolve) => setTimeout(resolve, delay));
			return delay;
		};

		const output = await mapWithConcurrency(items, 3, fn);
		expect(output).toEqual([3, 1, 2]);
	});

	it("limits concurrency to the specified limit", async () => {
		let concurrent = 0;
		let maxConcurrent = 0;

		const fn = async (item: number) => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise<void>((resolve) => setTimeout(resolve, 10));
			concurrent--;
			return item;
		};

		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		await mapWithConcurrency(items, 3, fn);

		expect(maxConcurrent).toBeLessThanOrEqual(3);
	});

	it("propagates the first rejection and does not swallow the error", async () => {
		const fn = vi.fn().mockImplementation(async (item: number) => {
			if (item === 2) throw new Error("item 2 failed");
			return item;
		});

		await expect(mapWithConcurrency([1, 2, 3, 4], 2, fn)).rejects.toThrow("item 2 failed");
	});

	it("handles empty input without calling fn", async () => {
		const fn = vi.fn();
		const result = await mapWithConcurrency([], 5, fn);

		expect(result).toEqual([]);
		expect(fn).not.toHaveBeenCalled();
	});

	it("runs all items when limit exceeds input length", async () => {
		const fn = vi.fn().mockImplementation(async (item: number) => item * 2);
		const result = await mapWithConcurrency([1, 2, 3], 10, fn);

		expect(result).toEqual([2, 4, 6]);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("processes single-item input with limit of 1", async () => {
		const fn = vi.fn().mockResolvedValue("done");
		const result = await mapWithConcurrency(["x"], 1, fn);

		expect(result).toEqual(["done"]);
		expect(fn).toHaveBeenCalledOnce();
	});

	it("throws RangeError when limit is zero", async () => {
		await expect(mapWithConcurrency([1, 2], 0, async (x) => x)).rejects.toThrow(RangeError);
	});

	it("throws RangeError when limit is negative", async () => {
		await expect(mapWithConcurrency([1, 2], -1, async (x) => x)).rejects.toThrow(RangeError);
	});

	it("throws RangeError when limit is a non-integer", async () => {
		await expect(mapWithConcurrency([1, 2], 1.5, async (x) => x)).rejects.toThrow(RangeError);
	});
});
