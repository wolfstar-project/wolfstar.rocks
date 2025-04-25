/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEqual } from 'ohash/utils';

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
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

export function isArrayOfArray<A>(item: A[] | A[][]): item is A[][] {
	return Array.isArray(item[0]);
}
export default function removeNonAlphaNumeric(str: string) {
	return str.replace(/[^0-9a-zA-Z]/gi, '');
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
