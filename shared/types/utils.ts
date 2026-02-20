import type { Ref } from "vue";

export type RefType<T extends Ref> = T extends Ref<infer V> ? V : never;

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] | undefined;
};

export interface TightMap<O = any> {
	[key: string]: TightMap | O;
}
export type PartialString<T> = {
	[K in keyof T]?: string;
};

export type ValuesType<T extends ReadonlyArray<any> | ArrayLike<any> | Record<any, any>> =
	T extends readonly any[]
		? T[number]
		: T extends ArrayLike<any>
			? T[number]
			: T extends object
				? T[keyof T]
				: never;
