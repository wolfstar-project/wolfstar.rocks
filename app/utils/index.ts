import type { Selfmod } from "#shared/types/configurableData";
import type { Ref } from "vue";
import { isEqual } from "ohash/utils";

export function updateSliderValueObj(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
	return {
		[prop]: Array.isArray(value) && typeof value[0] === "number" ? value[0] * multiplier : typeof value === "number" ? value * multiplier : 0,
	};
}

export function updateSliderValueArr(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
	return {
		[prop]: Array.isArray(value) ? value.map((v) => v * multiplier) : value * multiplier,
	};
}

/**
 * Removes non-alphanumeric characters from a string.
 * @param str The string.
 * @returns The string.
 */
export default function removeNonAlphaNumeric(str: string) {
	return str.replace(/[^0-9a-z]/gi, "");
}

/**
 * Uses object storage.
 * @param key The key.
 * @param initial The initial value.
 * @param listenToStorage Whether to listen to storage.
 * @returns The object.
 */

export async function useObjectStorage<T>(key: string, initial: T, listenToStorage = true): Promise<Ref<T>> {
	const storage = useStorage();
	const raw = await storage.getItem(key);

	let parsedValue: T;
	try {
		parsedValue = raw ? JSON.parse(raw as string) : initial;
	} catch {
		parsedValue = initial;
	}

	const data = ref(parsedValue) as Ref<T>;

	for (const key2 in initial) {
		if (data.value[key2] === void 0) {
			data.value[key2] = initial[key2];
		}
	}

	let updating = false;
	let wrote = "";

	watch(
		data,
		(value) => {
			if (updating) {
				return;
			}
			wrote = JSON.stringify(value);
			storage.setItem(key, wrote);
		},
		{ deep: true, flush: "post" },
	);

	if (listenToStorage) {
		useEventListener(window, "storage", (e) => {
			if (e.key === key && e.newValue && e.newValue !== wrote) {
				updating = true;
				try {
					data.value = JSON.parse(e.newValue);
				} catch {
					data.value = initial;
				}
				updating = false;
			}
		});
	}

	return data;
}

/**
 * Picks keys from an object.
 * @param data The object.
 * @param keys The keys.
 * @returns The object.
 */
export function pick<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Pick<Data, Keys> {
	const result = {} as Pick<Data, Keys>;

	for (const key of keys) {
		result[key] = data[key];
	}

	return result;
}

/**
 * Omits keys from an object.
 * @param data The object.
 * @param keys The keys.
 * @returns The object.
 */
export function omit<Data extends object, Keys extends keyof Data>(data: Data, keys: Keys[]): Omit<Data, Keys> {
	const result = { ...data };

	for (const key of keys) {
		delete result[key];
	}

	return result as Omit<Data, Keys>;
}

/**
 * Gets a value from an object.
 * @param object The object.
 * @param path The path.
 * @param defaultValue The default value.
 * @returns The value.
 */
export function get(object: Record<string, any> | undefined, path: (string | number)[] | string, defaultValue?: any): any {
	if (typeof path === "string") {
		path = path.split(".").map((key) => {
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

/**
 * Sets a value in an object.
 * @param object The object.
 * @param path The path.
 * @param value The value.
 */
export function set(object: Record<string, any>, path: (string | number)[] | string, value: any): void {
	if (typeof path === "string") {
		path = path.split(".").map((key) => {
			const numKey = Number(key);
			return Number.isNaN(numKey) ? key : numKey;
		});
	}

	path.reduce((acc, key, i) => {
		if (acc[key] === undefined) {
			acc[key] = {};
		}
		if (i === path.length - 1) {
			acc[key] = value;
		}
		return acc[key];
	}, object);
}
/**
 * Converts a value to a number.
 * @param val The value.
 * @returns The number.
 */

export function looseToNumber(val: any): any {
	const n = Number.parseFloat(val);
	return Number.isNaN(n) ? val : n;
}

export function formatNumber(num: number): string {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 1,
		notation: "compact",
	}).format(num);
}

/**
 * Compares two values.
 * @param value The value.
 * @param currentValue The current value.
 * @param comparator The comparator.
 * @returns Whether the values are equal.
 */
export function compare<T>(value?: T, currentValue?: T, comparator?: string | ((a: T, b: T) => boolean)) {
	if (value === undefined || currentValue === undefined) {
		return false;
	}

	if (typeof value === "string") {
		return value === currentValue;
	}

	if (typeof comparator === "function") {
		return comparator(value, currentValue);
	}

	if (typeof comparator === "string") {
		return get(value!, comparator) === get(currentValue!, comparator);
	}

	return isEqual(value, currentValue);
}

/**
 * Checks if the item is an array of arrays.
 * @param item The item.
 * @returns Whether the item is an array of arrays.
 */
export function isArrayOfArray<A>(item: A[] | A[][]): item is A[][] {
	return Array.isArray(item[0]);
}
