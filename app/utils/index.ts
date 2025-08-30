import type { Selfmod } from "~~/shared/types/ConfigurableData";
import type { GetItemKeys, NestedItem } from "@/types/utils";

import { isEqual } from "ohash/utils";

export function updateSliderValueObj(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
  return {
    [prop]: Array.isArray(value) && typeof value[0] === "number" ? value[0] * multiplier : typeof value === "number" ? value * multiplier : 0,
  };
}

export function updateSliderValueArr(prop: Selfmod.Union, value: number | number[], multiplier = 1) {
  return {
    [prop]: Array.isArray(value) ? value.map(v => v * multiplier) : value * multiplier,
  };
}
/**
 * Sorts in ascending order.
 * @param a The first value.
 * @param b The second value.
 * @returns The result.
 */
/* eslint-disable no-cond-assign */
export function asc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Sorts in ascending order.
 * @param a The first value.
 * @param b The second value.
 * @returns The result.
 */

export function desc(a: number | string | bigint, b: number | string | bigint): -1 | 0 | 1 {
  return a > b ? -1 : a < b ? 1 : 0;
}

export interface BidirectionalReplaceOptions<T> {
  onMatch: (match: RegExpExecArray) => T;
  outMatch: (content: string, previous: number, next: number) => T;
}

/**
 * Bidirectionally replaces content.
 * @param regex The regex.
 * @param content The content.
 * @param options The options.
 * @returns The content.
 */

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

  if (previous < content.length)
    results.push(options.outMatch(content.slice(previous), previous, content.length));
  return results;
}

export type BooleanFn<ArgumentTypes extends readonly unknown[], ReturnType extends boolean = boolean> = (...args: ArgumentTypes) => ReturnType;

/**
 * Ands functions.
 * @param fns The functions.
 * @returns The function.
 */

export function andMix<T extends readonly unknown[], R extends boolean>(...fns: readonly BooleanFn<T, R>[]): BooleanFn<T, R> {
  if (fns.length === 0)
    throw new Error("You must input at least one function.");
  return (...args) => {
    let ret!: R;
    for (const fn of fns) {
      if (!(ret = fn(...args)))
        break;
    }

    return ret;
  };
}

/**
 * Ors functions.
 * @param fns The functions.
 * @returns The function.
 */

export function orMix<ArgumentTypes extends readonly unknown[], ReturnType extends boolean>(
  ...fns: readonly BooleanFn<ArgumentTypes, ReturnType>[]
): BooleanFn<ArgumentTypes, ReturnType> {
  if (fns.length === 0)
    throw new Error("You must input at least one function.");
  return (...args) => {
    let ret!: ReturnType;
    for (const fn of fns) {
      if ((ret = fn(...args)))
        break;
    }

    return ret;
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
  const raw = await useStorage().getItem(key);
  const data = ref(raw ? JSON.parse(raw as string) : initial);
  for (const key2 in initial) {
    if (data.value[key2] === void 0)
      data.value[key2] = initial[key2];
  }
  let updating = false;
  let wrote = "";
  watch(
    data,
    (value) => {
      if (updating)
        return;
      wrote = JSON.stringify(value);
      useStorage().setItem(key, wrote);
    },
    { deep: true, flush: "post" },
  );
  if (listenToStorage) {
    useEventListener(window, "storage", (e) => {
      if (e.key === key && e.newValue && e.newValue !== wrote) {
        updating = true;
        data.value = JSON.parse(e.newValue);
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
    if (acc[key] === undefined)
      acc[key] = {};
    if (i === path.length - 1)
      acc[key] = value;
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
 * Gets the display value.
 * @param items The items.
 * @param value The value.
 * @param options The options.
 * @param options.valueKey The value key.
 * @param options.labelKey The label key.
 * @returns The display value.
 */
export function getDisplayValue<T, V>(
  items: T[],
  value: V | undefined | null,
  options: {
    valueKey?: GetItemKeys<T>;
    labelKey?: keyof NestedItem<T>;
  } = {},
): string | undefined {
  const { valueKey, labelKey } = options;

  if (value === null || value === undefined) {
    return undefined;
  }

  const foundItem = items.find((item) => {
    const itemValue = (typeof item === "object" && item !== null && valueKey)
      ? get(item, valueKey as string)
      : item;
    return compare(itemValue, value);
  });

  const source = foundItem ?? value;

  if (source === null || source === undefined) {
    return undefined;
  }

  if (typeof source === "object") {
    return labelKey ? get(source as Record<string, any>, labelKey as string) : undefined;
  }

  return String(source);
}

/**
 * Checks if the item is an array of arrays.
 * @param item The item.
 * @returns Whether the item is an array of arrays.
 */
export function isArrayOfArray<A>(item: A[] | A[][]): item is A[][] {
  return Array.isArray(item[0]);
}

/**
 * Merges the default class and the property class.
 * @param defaultClass The default class.
 * @param propClass The property class.
 * @returns The merged class.
 */
export function mergeClasses(defaultClass?: string | string[], propClass?: string) {
  if (!defaultClass && !propClass) {
    return "";
  }

  return [
    ...(Array.isArray(defaultClass) ? defaultClass : [defaultClass]),
    propClass,
  ].filter(Boolean);
}

/**
 * Gets the text content of a slot.
 * @param children The slot children.
 * @returns The text content of the slot.
 */
export function getSlotChildrenText(children: any) {
  // eslint-disable-next-line array-callback-return
  return children.map((node: any) => {
    if (!node.children || typeof node.children === "string")
      return node.children || "";
    else if (Array.isArray(node.children))
      return getSlotChildrenText(node.children);
    else if (node.children.default)
      return getSlotChildrenText(node.children.default());
  }).join("");
}

/**
 * Transforms the UI object.
 * @param ui The UI object.
 * @param uiProp The UI property.
 * @returns The transformed UI object.
 */
export function transformUI(ui: any, uiProp?: any) {
  return Object.entries(ui).reduce((acc, [key, value]) => {
    acc[key] = typeof value === "function" ? value({ class: uiProp?.[key] }) : value;
    return acc;
  }, uiProp || {});
}

/**
 * Gets the maximum value.
 * @param values The values to compare.
 * @returns The maximum value.
 */
export function max<N extends number | bigint>(...values: readonly N[]): N {
  if (values.length === 0)
    throw new TypeError("Expected at least 1 value.");

  let lowest = values[0]!;
  for (let i = 1; i < values.length; ++i) {
    const value = values[i]!;
    if (value > lowest)
      lowest = value;
  }

  return lowest;
}
/**
 * Gets the difference between two bit fields.
 * @param previous The previous bit field.
 * @param next The next bit field.
 * @returns The difference between the two bit fields.
 */

export function differenceBitField<T extends number | bigint>(previous: T, next: T) {
  const diff = (previous ^ next) as T;
  const added = (next & diff) as T;
  const removed = (previous & diff) as T;
  return { added, removed };
}
/**
 * Gets the difference between two arrays.
 * @param previous The previous array.
 * @param next The next array.
 * @returns The difference between the two arrays.
 */

export function differenceArray<T>(previous: readonly T[], next: readonly T[]) {
  const added = next.filter(value => !previous.includes(value));
  const removed = previous.filter(value => !next.includes(value));

  return { added, removed };
}
/**
 * Gets the difference between two maps.
 * @param previous The previous map.
 * @param next The next map.
 * @returns The difference between the two maps.
 */
export function differenceMap<K, V>(previous: ReadonlyMap<K, V>, next: ReadonlyMap<K, V>) {
  const added = new Map<K, V>();
  const removed = new Map<K, V>();
  const updated = new Map<K, [previous: V, next: V]>();

  for (const [key, value] of previous.entries()) {
    const other = next.get(key);
    if (other === undefined) {
      removed.set(key, value);
    }
    else if (other !== value) {
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
