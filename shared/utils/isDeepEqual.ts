import { objectKeys } from "@sapphire/utilities/objectKeys";

export type DeepEqualPathSegment = string | number;
export type DeepEqualPath = readonly DeepEqualPathSegment[];

export interface DeepEqualDifference {
	path: DeepEqualPath;
	left: unknown;
	right: unknown;
}

export interface IsDeepEqualOptions {
	/**
	 * Called when a difference is found.
	 *
	 * - With `mode: "first"` (default), it is called at most once.
	 * - With `mode: "all"`, it is called for each difference we encounter.
	 */
	onDifference?: (diff: DeepEqualDifference) => void;

	/**
	 * Called once when values are deeply equal.
	 */
	onEqualSuccess?: () => void;

	/**
	 * Called once when values are not deeply equal.
	 * When available, the first detected difference is provided.
	 */
	onEqualFailed?: (diff?: DeepEqualDifference) => void;

	/**
	 * Backwards-compatible alias for `onEqualFailed` (common misspelling).
	 */
	onEqualFalied?: (diff?: DeepEqualDifference) => void;

	/**
	 * Optional override to compare values for a given path.
	 * Return `true`/`false` to short-circuit the comparison, or `undefined` to fall back to default.
	 */
	customEqual?: (left: unknown, right: unknown, path: DeepEqualPath) => boolean | undefined;

	/**
	 * How aggressively we search for differences.
	 * - "first": stop at the first difference.
	 * - "all": traverse the whole structure (best effort) to report more differences.
	 */
	mode?: "first" | "all";
}

/**
 * Deep equality for JSON-like data (objects/arrays/primitives) with a few extras (Date/Map/Set/RegExp).
 *
 * This is intentionally isomorphic (no Node.js-only imports) so it can be used in client bundles.
 */
export function isDeepEqual(a: unknown, b: unknown, options: IsDeepEqualOptions = {}): boolean {
	const mode = options.mode ?? "first";
	// 0 = not equal, 1 = equal, 2 = in-progress (cycle guard)
	const seen = new WeakMap<object, WeakMap<object, 0 | 1 | 2>>();

	let firstDifference: DeepEqualDifference | undefined;

	const reportDifference = (diff: DeepEqualDifference, report: boolean) => {
		if (!report) {
			return;
		}
		firstDifference ??= diff;
		options.onDifference?.(diff);
	};

	const inner = (
		left: unknown,
		right: unknown,
		path: DeepEqualPath,
		report: boolean,
	): boolean => {
		const custom = options.customEqual?.(left, right, path);
		if (custom !== undefined) {
			if (!custom) {
				reportDifference({ left, path, right }, report);
			}
			return custom;
		}

		if (Object.is(left, right)) {
			return true;
		}

		// If either is null/undefined or not an object, they can't be deeply equal here.
		if (
			typeof left !== "object" ||
			left === null ||
			typeof right !== "object" ||
			right === null
		) {
			reportDifference({ left, path, right }, report);
			return false;
		}

		const leftObj = left as object;
		const rightObj = right as object;

		// Cycle guard + cache: if we've already compared this pair, reuse result.
		let rightMap = seen.get(leftObj);
		if (!rightMap) {
			rightMap = new WeakMap<object, 0 | 1 | 2>();
			seen.set(leftObj, rightMap);
		}

		const cached = rightMap.get(rightObj);
		if (cached === 2) {
			return true;
		}
		if (cached === 1) {
			return true;
		}
		if (cached === 0) {
			return false;
		}

		// Mark as in-progress before descending, so self-references don't blow the stack.
		rightMap.set(rightObj, 2);

		const cacheAndReturn = (value: boolean) => {
			rightMap.set(rightObj, value ? 1 : 0);
			return value;
		};

		// Different prototypes => different “kind” of object.
		if (Object.getPrototypeOf(leftObj) !== Object.getPrototypeOf(rightObj)) {
			reportDifference({ left, path, right }, report);
			return cacheAndReturn(false);
		}

		if (leftObj instanceof Date) {
			const equal = rightObj instanceof Date && leftObj.getTime() === rightObj.getTime();
			if (!equal) {
				reportDifference({ left, path, right }, report);
			}
			return cacheAndReturn(equal);
		}

		if (leftObj instanceof RegExp) {
			const equal =
				rightObj instanceof RegExp &&
				leftObj.source === rightObj.source &&
				leftObj.flags === rightObj.flags;
			if (!equal) {
				reportDifference({ left, path, right }, report);
			}
			return cacheAndReturn(equal);
		}

		if (leftObj instanceof Map) {
			if (!(rightObj instanceof Map)) {
				reportDifference({ left, path, right }, report);
				return cacheAndReturn(false);
			}
			if (leftObj.size !== rightObj.size) {
				return cacheAndReturn(
					inner(leftObj.size, rightObj.size, [...path, "size"], report),
				);
			}

			const rightEntries = [...rightObj.entries()];
			const used = new Set<number>();

			let equal = true;
			for (const [leftKey, leftValue] of leftObj.entries()) {
				const keyCandidates: number[] = [];
				for (let i = 0; i < rightEntries.length; i++) {
					if (used.has(i)) {
						continue;
					}
					const [rightKey] = rightEntries[i]!;
					if (inner(leftKey, rightKey, [...path, "<mapKey>"], false)) {
						keyCandidates.push(i);
					}
				}

				// If we found key candidates, try to find one whose value also matches.
				let matchedIndex: number | undefined;
				for (const i of keyCandidates) {
					const [, rightValue] = rightEntries[i]!;
					if (inner(leftValue, rightValue, [...path, "<mapValue>"], false)) {
						matchedIndex = i;
						break;
					}
				}

				if (matchedIndex !== undefined) {
					used.add(matchedIndex);
					continue;
				}

				equal = false;

				// Key wasn't found at all.
				if (keyCandidates.length === 0) {
					reportDifference(
						{ left: leftKey, path: [...path, "<mapKey>"], right: undefined },
						report,
					);
				}
				// Key matched but value didn't.
				else {
					const candidateIndex = keyCandidates[0]!;
					const [, rightValue] = rightEntries[candidateIndex]!;
					// Re-run with reporting enabled to capture a meaningful first diff.
					inner(leftValue, rightValue, [...path, "<mapValue>"], report);
				}

				if (mode === "first") {
					return cacheAndReturn(false);
				}
			}

			// Anything left unmatched in the right map is an extra key.
			if (equal && used.size !== rightEntries.length) {
				equal = false;
			}
			if (!equal && mode !== "first") {
				for (let i = 0; i < rightEntries.length; i++) {
					if (used.has(i)) {
						continue;
					}
					const [rightKey] = rightEntries[i]!;
					reportDifference(
						{ left: undefined, path: [...path, "<mapKey>"], right: rightKey },
						report,
					);
				}
			}

			return cacheAndReturn(equal);
		}

		if (leftObj instanceof Set) {
			if (!(rightObj instanceof Set)) {
				reportDifference({ left, path, right }, report);
				return cacheAndReturn(false);
			}
			if (leftObj.size !== rightObj.size) {
				return cacheAndReturn(
					inner(leftObj.size, rightObj.size, [...path, "size"], report),
				);
			}

			const rightValues = [...rightObj.values()];
			const used = new Set<number>();

			let equal = true;
			for (const leftValue of leftObj.values()) {
				let matchedIndex: number | undefined;
				for (let i = 0; i < rightValues.length; i++) {
					if (used.has(i)) {
						continue;
					}
					const rightValue = rightValues[i];
					if (inner(leftValue, rightValue, [...path, "<setValue>"], false)) {
						matchedIndex = i;
						break;
					}
				}

				if (matchedIndex !== undefined) {
					used.add(matchedIndex);
					continue;
				}

				equal = false;
				reportDifference(
					{ left: leftValue, path: [...path, "<setValue>"], right: undefined },
					report,
				);

				if (mode === "first") {
					return cacheAndReturn(false);
				}
			}

			// Anything left unmatched in the right set is an extra value.
			if (equal && used.size !== rightValues.length) {
				equal = false;
			}
			if (!equal && mode !== "first") {
				for (let i = 0; i < rightValues.length; i++) {
					if (used.has(i)) {
						continue;
					}
					reportDifference(
						{ left: undefined, path: [...path, "<setValue>"], right: rightValues[i] },
						report,
					);
				}
			}

			return cacheAndReturn(equal);
		}

		if (Array.isArray(leftObj)) {
			if (!Array.isArray(rightObj)) {
				reportDifference({ left, path, right }, report);
				return cacheAndReturn(false);
			}
			if (leftObj.length !== rightObj.length) {
				return cacheAndReturn(
					inner(leftObj.length, rightObj.length, [...path, "length"], report),
				);
			}

			let equal = true;
			for (let i = 0; i < leftObj.length; i++) {
				const itemEqual = inner(leftObj[i], rightObj[i], [...path, i], report);
				if (!itemEqual) {
					equal = false;
				}

				if (!equal && mode === "first") {
					return cacheAndReturn(false);
				}
			}
			return cacheAndReturn(equal);
		}

		// Plain objects (and other non-special objects): compare own enumerable keys.
		const leftKeys = objectKeys(leftObj);
		const rightKeys = objectKeys(rightObj);
		if (leftKeys.length !== rightKeys.length) {
			return cacheAndReturn(
				inner(leftKeys.length, rightKeys.length, [...path, "<keys>"], report),
			);
		}

		const leftRecord = leftObj as Record<string, unknown>;
		const rightRecord = rightObj as Record<string, unknown>;

		let equal = true;
		for (const key of leftKeys) {
			if (!Object.hasOwn(rightObj, key)) {
				reportDifference(
					{ left: leftRecord[key], path: [...path, key], right: undefined },
					report,
				);
				equal = false;
				if (mode === "first") {
					return cacheAndReturn(false);
				}
				continue;
			}

			const leftValue = leftRecord[key];
			const rightValue = rightRecord[key];

			const valueEqual = inner(leftValue, rightValue, [...path, key], report);
			if (!valueEqual) {
				equal = false;
			}

			if (!equal && mode === "first") {
				return cacheAndReturn(false);
			}
		}

		return cacheAndReturn(equal);
	};

	const result = inner(a, b, [], true);
	if (result) {
		options.onEqualSuccess?.();
	} else {
		options.onEqualFailed?.(firstDifference);
		options.onEqualFalied?.(firstDifference);
	}

	return result;
}

/**
 * Visits differences between two values, invoking `visitor` for each difference found.
 * Returns `true` if no differences were found.
 */
export function visitDeepDifferences(
	left: unknown,
	right: unknown,
	visitor: (diff: DeepEqualDifference) => void,
	options: Omit<
		IsDeepEqualOptions,
		"onDifference" | "mode" | "onEqualSuccess" | "onEqualFailed" | "onEqualFalied"
	> = {},
): boolean {
	return isDeepEqual(left, right, {
		...options,
		mode: "all",
		onDifference: visitor,
	});
}
