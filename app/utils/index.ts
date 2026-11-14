/**
 * Picks keys from an object.
 * @param data The object.
 * @param keys The keys.
 * @returns The object.
 */
export function pick<Data extends object, Keys extends keyof Data>(
	data: Data,
	keys: Keys[],
): Pick<Data, Keys> {
	const result = {} as Pick<Data, Keys>;

	for (const key of keys) {
		result[key] = data[key];
	}

	return result;
}

/**
 * Gets a value from an object.
 * @param object The object.
 * @param path The path.
 * @param defaultValue The default value.
 * @returns The value.
 */
export function get(
	object: Record<string, any> | undefined,
	path: (string | number)[] | string,
	defaultValue?: any,
): any {
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
export function set(
	object: Record<string, any>,
	path: (string | number)[] | string,
	value: any,
): void {
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
