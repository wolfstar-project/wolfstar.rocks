import { bench, describe } from "vitest";
import { differenceArray, differenceMap } from "../../../../shared/utils/comparators";

describe("differenceArray benchmarks", () => {
	// Test data preparation
	const sizes = [10, 100, 1000];

	for (const size of sizes) {
		const baseArray = Array.from({ length: size }, (_, i) => i);

		bench(`differenceArray - no difference (${size} items)`, () => {
			differenceArray(baseArray, baseArray);
		});

		bench(`differenceArray - partial difference (${size} items, 50% changed)`, () => {
			const modifiedArray = Array.from({ length: size }, (_, i) =>
				i % 2 === 0 ? i : i + 1000,
			);
			differenceArray(baseArray, modifiedArray);
		});

		bench(`differenceArray - complete difference (${size} items)`, () => {
			const completelyDifferent = Array.from({ length: size }, (_, i) => i + 10_000);
			differenceArray(baseArray, completelyDifferent);
		});

		bench(`differenceArray - append operation (${size} items, +10 items)`, () => {
			const appendedArray = [...baseArray, ...Array.from({ length: 10 }, (_, i) => i + size)];
			differenceArray(baseArray, appendedArray);
		});
	}
});

describe("differenceMap benchmarks", () => {
	const sizes = [10, 100, 1000];

	for (const size of sizes) {
		const baseMap = new Map(Array.from({ length: size }, (_, i) => [i, `value-${i}`] as const));

		bench(`differenceMap - no difference (${size} entries)`, () => {
			differenceMap(baseMap, baseMap);
		});

		bench(`differenceMap - partial difference (${size} entries, 50% changed)`, () => {
			const modifiedMap = new Map(
				Array.from(
					{ length: size },
					(_, i) => [i, i % 2 === 0 ? `value-${i}` : `modified-${i}`] as const,
				),
			);
			differenceMap(baseMap, modifiedMap);
		});

		bench(`differenceMap - partial additions/removals (${size} entries)`, () => {
			const entries = Array.from({ length: size }, (_, i) => {
				if (i % 2 === 0) {
					return [i, `value-${i}`] as const;
				}
				return [i + 10_000, `new-${i}`] as const;
			});
			const modifiedMap = new Map(entries);
			differenceMap(baseMap, modifiedMap);
		});

		bench(`differenceMap - append operation (${size} entries, +10 entries)`, () => {
			const appendedMap = new Map([
				...baseMap,
				...Array.from({ length: 10 }, (_, i) => [i + size, `value-${i + size}`] as const),
			]);
			differenceMap(baseMap, appendedMap);
		});
	}
});
