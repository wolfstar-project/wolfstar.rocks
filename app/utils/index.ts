import type { Selfmod } from '~~/shared/types/ConfigurableData';
import { isEqual } from 'ohash/utils';

export function updateSliderValueObj(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
	return {
		[prop]: Array.isArray(value) && typeof value[0] === 'number' ? value[0] * multiplier : typeof value === 'number' ? value * multiplier : 0
	};
}

export function updateSliderValueArr(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
	return {
		[prop]: Array.isArray(value) ? value.map((v) => v * multiplier) : value * multiplier
	};
}

export function pick<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Pick<Data, Keys> {
	const result = {} as Pick<Data, Keys>;

	for (const key of keys) {
		result[key] = data[key];
	}

	return result;
}

export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
	const result = { ...data };

	for (const key of keys) {
		delete result[key];
	}

	return result as Omit<Data, Keys>;
}

export function get(object: Record<string, any> | undefined, path: (string | number)[] | string, defaultValue?: any): any {
	if (typeof path === 'string') {
		path = path.split('.').map((key) => {
			const numKey = Number(key);
			return Number.isNaN(numKey) ? key : numKey;
		});
	}

	let result: any = object;

	for (const key of path) {
		if (result === undefined || result === null) {
			return defaultValue;
		}

		result = result[key];
	}

	return result !== undefined ? result : defaultValue;
}

export function set(object: Record<string, any>, path: (string | number)[] | string, value: any): void {
	if (typeof path === 'string') {
		path = path.split('.').map((key) => {
			const numKey = Number(key);
			return Number.isNaN(numKey) ? key : numKey;
		});
	}

	path.reduce((acc, key, i) => {
		if (acc[key] === undefined) acc[key] = {};
		if (i === path.length - 1) acc[key] = value;
		return acc[key];
	}, object);
}

export function looseToNumber(val: any): any {
	const n = Number.parseFloat(val);
	return Number.isNaN(n) ? val : n;
}

export function compare<T>(value?: T, currentValue?: T, comparator?: string | ((a: T, b: T) => boolean)) {
	if (value === undefined || currentValue === undefined) {
		return false;
	}

	if (typeof value === 'string') {
		return value === currentValue;
	}

	if (typeof comparator === 'function') {
		return comparator(value, currentValue);
	}

	if (typeof comparator === 'string') {
		return get(value!, comparator) === get(currentValue!, comparator);
	}

	return isEqual(value, currentValue);
}

/* eslint-disable no-cond-assign */
export function asc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
	return a < b ? -1 : a > b ? 1 : 0;
}

export function desc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
	return a > b ? -1 : a < b ? 1 : 0;
}

/**
 * Gets the maximum value.
 * @param values The values to compare.
 * @returns The maximum value.
 */
export function max<N extends number | bigint>(...values: readonly N[]): N {
	if (values.length === 0) throw new TypeError('Expected at least 1 value.');

	let lowest = values[0]!;
	for (let i = 1; i < values.length; ++i) {
		const value = values[i]!;
		if (value > lowest) lowest = value;
	}

	return lowest;
}

export function differenceBitField<T extends number | bigint>(previous: T, next: T) {
	const diff = (previous ^ next) as T;
	const added = (next & diff) as T;
	const removed = (previous & diff) as T;
	return { added, removed };
}

export function differenceArray<T>(previous: readonly T[], next: readonly T[]) {
	const added = next.filter((value) => !previous.includes(value));
	const removed = previous.filter((value) => !next.includes(value));

	return { added, removed };
}

export function differenceMap<K, V>(previous: ReadonlyMap<K, V>, next: ReadonlyMap<K, V>) {
	const added = new Map<K, V>();
	const removed = new Map<K, V>();
	const updated = new Map<K, [previous: V, next: V]>();

	for (const [key, value] of previous.entries()) {
		const other = next.get(key);
		if (other === undefined) {
			removed.set(key, value);
		} else if (other !== value) {
			updated.set(key, [value, other]);
		}
	}

	for (const [key, value] of next.entries()) {
		const other = previous.get(key);
		if (other === undefined) {
			added.set(key, value);
		}
	}

	return { added, updated, removed };
}

export interface BidirectionalReplaceOptions<T> {
	onMatch: (match: RegExpExecArray) => T;
	outMatch: (content: string, previous: number, next: number) => T;
}

export function bidirectionalReplace<T>(regex: RegExp, content: string, options: BidirectionalReplaceOptions<T>) {
	const results: T[] = [];
	let previous = 0;
	let match: RegExpExecArray | null = null;

	while ((match = regex.exec(content)) !== null) {
		if (previous !== match.index) {
			results.push(options.outMatch(content.slice(previous, match.index), previous, match.index));
		}

		previous = regex.lastIndex;
		results.push(options.onMatch(match));
	}

	if (previous < content.length) results.push(options.outMatch(content.slice(previous), previous, content.length));
	return results;
}

export type BooleanFn<ArgumentTypes extends readonly unknown[], ReturnType extends boolean = boolean> = (...args: ArgumentTypes) => ReturnType;

export function andMix<T extends readonly unknown[], R extends boolean>(...fns: readonly BooleanFn<T, R>[]): BooleanFn<T, R> {
	if (fns.length === 0) throw new Error('You must input at least one function.');
	return (...args) => {
		let ret!: R;
		for (const fn of fns) {
			if (!(ret = fn(...args))) break;
		}

		return ret;
	};
}

export function orMix<ArgumentTypes extends readonly unknown[], ReturnType extends boolean>(
	...fns: readonly BooleanFn<ArgumentTypes, ReturnType>[]
): BooleanFn<ArgumentTypes, ReturnType> {
	if (fns.length === 0) throw new Error('You must input at least one function.');
	return (...args) => {
		let ret!: ReturnType;
		for (const fn of fns) {
			if ((ret = fn(...args))) break;
		}

		return ret;
	};
}

export function isArrayOfArray<A>(item: A[] | A[][]): item is A[][] {
	return Array.isArray(item[0]);
}
export default function removeNonAlphaNumeric(str: string) {
	return str.replace(/[^0-9a-z]/gi, '');
}

export function useObjectStorage<T>(key: string, initial: T, listenToStorage = true): Ref<T> {
	const raw = localStorage.getItem(key);
	const data = ref(raw ? JSON.parse(raw) : initial);
	for (const key2 in initial) {
		if (data.value[key2] === void 0) data.value[key2] = initial[key2];
	}
	let updating = false;
	let wrote = '';
	watch(
		data,
		(value) => {
			if (updating) return;
			wrote = JSON.stringify(value);
			localStorage.setItem(key, wrote);
		},
		{ deep: true, flush: 'post' }
	);
	if (listenToStorage) {
		useEventListener(window, 'storage', (e) => {
			if (e.key === key && e.newValue && e.newValue !== wrote) {
				updating = true;
				data.value = JSON.parse(e.newValue);
				updating = false;
			}
		});
	}
	return data;
}
