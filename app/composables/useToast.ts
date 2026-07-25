import type { SemanticColor } from "#shared/types/ui";

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
	color?: SemanticColor;
	icon?: string;
	closeIcon?: string;
	duration?: number;
	actions?: ToastAction[];
}

const DEFAULT_DURATION = 5000;

let toastIdCounter = 0;

export function useToast() {
	const toasts = useState<Toast[]>("toasts", () => []);
	const timers = useState<Record<string, ReturnType<typeof setTimeout>>>("toast-timers", () => ({}));

	function clearTimer(id: string | number) {
		const key = String(id);
		const timer = timers.value[key];
		if (timer) {
			clearTimeout(timer);
			const next = { ...timers.value };
			delete next[key];
			timers.value = next;
		}
	}

	function scheduleRemove(toast: Toast) {
		const duration = toast.duration ?? DEFAULT_DURATION;
		if (duration <= 0 || !import.meta.client) return;
		clearTimer(toast.id);
		timers.value = {
			...timers.value,
			[String(toast.id)]: setTimeout(() => {
				remove(toast.id);
			}, duration),
		};
	}

	function add(toast: Partial<Toast> & Pick<Toast, never> = {}): Toast {
		const id = toast.id ?? `toast-${++toastIdCounter}`;
		const entry: Toast = {
			...toast,
			duration: toast.duration ?? DEFAULT_DURATION,
			id,
		};
		toasts.value = [...toasts.value, entry];
		scheduleRemove(entry);
		return entry;
	}

	function update(id: string | number, patch: Partial<Toast>) {
		toasts.value = toasts.value.map((toast) => {
			if (toast.id !== id) return toast;
			const next = { ...toast, ...patch, id };
			scheduleRemove(next);
			return next;
		});
	}

	function remove(id: string | number) {
		clearTimer(id);
		toasts.value = toasts.value.filter((toast) => toast.id !== id);
	}

	function clear() {
		for (const id of Object.keys(timers.value)) {
			clearTimer(id);
		}
		toasts.value = [];
	}

	return { toasts, add, update, remove, clear };
}
