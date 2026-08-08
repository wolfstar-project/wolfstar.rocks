/**
 * From Nuxt UI v4 `useToast`. Duration auto-dismiss lives here (no Reka ToastRoot).
 * @license MIT — Copyright (c) NuxtHub / Nuxt UI contributors
 * @see https://github.com/nuxt/ui
 */
import type { SemanticColor } from "#shared/types/ui";
import type { InjectionKey, Ref } from "vue";

export const toastMaxInjectionKey: InjectionKey<Ref<number | undefined>> =
	Symbol("nuxt-ui.toast-max");

export interface ToastAction {
	label: string;
	onClick?: (e: Event) => void;
	color?: string;
	variant?: string;
	to?: string;
	target?: string;
}

export interface Toast {
	id: string | number;
	title?: string;
	description?: string;
	icon?: string;
	avatar?: { src?: string; alt?: string };
	color?: SemanticColor;
	orientation?: "vertical" | "horizontal";
	close?: boolean;
	closeIcon?: string;
	actions?: ToastAction[];
	/**
	 * Milliseconds before auto-dismiss. Overrides the default (5000).
	 * Set to `0` to keep the toast open until it is manually closed.
	 */
	duration?: number;
	progress?: boolean;
	/** Whether the toast is visible (set `false` during close before removal). */
	open?: boolean;
	onClick?: (toast: Toast) => void;
	/** @internal */
	_duplicate?: number;
	/** @internal */
	_updated?: boolean;
}

const DEFAULT_DURATION = 5000;

export function useToast() {
	const toasts = useState<Toast[]>("toasts", () => []);
	const timers = useState<Record<string, ReturnType<typeof setTimeout>>>(
		"toast-timers",
		() => ({}),
	);
	const max = inject(toastMaxInjectionKey, undefined);

	const running = ref(false);
	const queue: Toast[] = [];

	const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

	function clearTimer(id: string | number) {
		const key = String(id);
		const timer = timers.value[key];
		if (!timer) return;
		clearTimeout(timer);
		const next = { ...timers.value };
		delete next[key];
		timers.value = next;
	}

	function scheduleAutoDismiss(toast: Toast) {
		const duration = toast.duration ?? DEFAULT_DURATION;
		clearTimer(toast.id);
		if (duration <= 0 || !import.meta.client) return;
		timers.value = {
			...timers.value,
			[String(toast.id)]: setTimeout(() => {
				remove(toast.id);
			}, duration),
		};
	}

	function mergeDuplicate(index: number, toast: Toast) {
		const existing = toasts.value[index];
		if (!existing) return;
		const merged: Toast = {
			...existing,
			...toast,
			_duplicate: (existing._duplicate || 0) + 1,
		};
		toasts.value[index] = merged;
		scheduleAutoDismiss(merged);
	}

	async function processQueue() {
		if (running.value || queue.length === 0) {
			return;
		}

		running.value = true;

		while (queue.length > 0) {
			await nextTick();

			const toast = queue.shift();
			if (!toast) continue;

			const maxValue = max?.value ?? 5;
			if (maxValue <= 0) {
				if (toasts.value.length) {
					toasts.value = [];
				}
				continue;
			}

			// Dedupe at display time so duplicate ids merge no matter which `useToast()` instance queued them.
			const existingIndex = toasts.value.findIndex((entry) => entry.id === toast.id);
			if (existingIndex !== -1) {
				mergeDuplicate(existingIndex, toast);
				continue;
			}

			toasts.value = [...toasts.value, toast].slice(-maxValue);
			scheduleAutoDismiss(toast);
		}

		running.value = false;
	}

	function add(toast: Partial<Toast> = {}): Toast {
		const body: Toast = {
			id: generateId(),
			open: true,
			...toast,
		};

		const existingIndex = toasts.value.findIndex((entry) => entry.id === body.id);
		if (existingIndex !== -1) {
			mergeDuplicate(existingIndex, body);
			return body;
		}

		queue.push(body);
		void processQueue();

		return body;
	}

	function update(id: string | number, toast: Omit<Partial<Toast>, "id">) {
		const index = toasts.value.findIndex((entry) => entry.id === id);
		const existing = index === -1 ? undefined : toasts.value[index];
		if (!existing) return;

		const next: Toast = {
			...existing,
			...toast,
			duration: toast.duration,
			open: true,
			_updated: true,
		};
		toasts.value[index] = next;
		scheduleAutoDismiss(next);

		nextTick(() => {
			const i = toasts.value.findIndex((entry) => entry.id === id);
			const current = i === -1 ? undefined : toasts.value[i];
			if (current?._updated) {
				toasts.value[i] = {
					...current,
					_updated: undefined,
				};
			}
		});
	}

	function remove(id: string | number) {
		const index = toasts.value.findIndex((entry) => entry.id === id);
		const existing = index === -1 ? undefined : toasts.value[index];
		if (existing?._updated) {
			return;
		}

		clearTimer(id);

		if (existing) {
			toasts.value[index] = {
				...existing,
				open: false,
			};
		}

		setTimeout(() => {
			toasts.value = toasts.value.filter((entry) => entry.id !== id);
			clearTimer(id);
		}, 200);
	}

	function clear() {
		for (const id of Object.keys(timers.value)) {
			clearTimer(id);
		}
		toasts.value = [];
	}

	return {
		toasts,
		add,
		update,
		remove,
		clear,
	};
}
