/**
 * Pure helpers mirrored from the extracted Nuxt UI `useToast` queue behavior.
 * Full composable coverage lives behind Nuxt `useState` / inject; these tests lock the
 * merge / slice rules that drive toast display.
 */
import { describe, expect, it } from "vitest";

interface ToastLike {
	id: string | number;
	title?: string;
	_duplicate?: number;
}

function mergeDuplicate(toasts: ToastLike[], index: number, toast: ToastLike): ToastLike[] {
	const existing = toasts[index];
	if (!existing) return toasts;
	const next = [...toasts];
	next[index] = {
		...existing,
		...toast,
		_duplicate: (existing._duplicate || 0) + 1,
	};
	return next;
}

function applyMax(toasts: ToastLike[], toast: ToastLike, maxValue: number): ToastLike[] {
	if (maxValue <= 0) return [];
	const existingIndex = toasts.findIndex((entry) => entry.id === toast.id);
	if (existingIndex !== -1) {
		return mergeDuplicate(toasts, existingIndex, toast);
	}
	return [...toasts, toast].slice(-maxValue);
}

describe("useToast queue helpers", () => {
	it("should merge duplicate ids and bump _duplicate", () => {
		const toasts: ToastLike[] = [{ id: "a", title: "First" }];
		const next = applyMax(toasts, { id: "a", title: "Second" }, 5);
		expect(next).toHaveLength(1);
		expect(next[0]).toMatchObject({ id: "a", title: "Second", _duplicate: 1 });
	});

	it("should keep only the newest `max` toasts", () => {
		let toasts: ToastLike[] = [];
		for (const id of ["1", "2", "3", "4"]) {
			toasts = applyMax(toasts, { id }, 3);
		}
		expect(toasts.map((toast) => toast.id)).toEqual(["2", "3", "4"]);
	});

	it("should clear the list when max is 0", () => {
		expect(applyMax([{ id: "1" }], { id: "2" }, 0)).toEqual([]);
	});
});
