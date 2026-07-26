/**
 * From Nuxt UI v4 `defineShortcuts`.
 * @license MIT — Copyright (c) NuxtHub / Nuxt UI contributors
 * @see https://github.com/nuxt/ui
 */
/* eslint-disable regexp/no-useless-quantifier */
/* eslint-disable regexp/no-super-linear-backtracking */
import type { ShortcutsConfig, ShortcutsOptions } from "#shared/types/ui";
import type { MaybeRefOrGetter } from "vue";
import { useActiveElement, useDebounceFn, useEventListener, useTimeoutFn } from "@vueuse/core";
import { useKbd } from "./useKbd";

type Handler = (e?: KeyboardEvent) => void;

interface Shortcut {
	handler: Handler;
	enabled: boolean;
	chained: boolean;
	key: string;
	ctrlKey: boolean;
	metaKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
}

const chainedShortcutRegex = /^[^-]+.*-.*[^-]+$/;
const combinedShortcutRegex = /^[^_]+.*_.*[^_]+$/;
const shiftableKeys = new Set([
	"arrowleft",
	"arrowright",
	"arrowup",
	"arrowdown",
	"tab",
	"escape",
	"enter",
	"backspace",
]);

function convertKeyToCode(key: string): string {
	if (/^[a-z]$/i.test(key)) {
		return `Key${key.toUpperCase()}`;
	}
	if (/^\d$/.test(key)) {
		return `Digit${key}`;
	}
	if (/^f\d+$/i.test(key)) {
		return key.toUpperCase();
	}
	const specialKeys: Record<string, string> = {
		space: "Space",
		enter: "Enter",
		escape: "Escape",
		tab: "Tab",
		backspace: "Backspace",
		delete: "Delete",
		arrowup: "ArrowUp",
		arrowdown: "ArrowDown",
		arrowleft: "ArrowLeft",
		arrowright: "ArrowRight",
	};
	return specialKeys[key.toLowerCase()] || key;
}

type ShortcutMenuItem = {
	kbds?: string[];
	onSelect?: Handler;
	onClick?: Handler;
	children?: ShortcutMenuItem[] | ShortcutMenuItem[][];
	items?: ShortcutMenuItem[] | ShortcutMenuItem[][];
};

export function extractShortcuts(
	items: ShortcutMenuItem[] | ShortcutMenuItem[][],
	separator: "_" | "-" = "_",
) {
	const shortcuts: Record<string, Handler> = {};

	function traverse(list: ShortcutMenuItem[]) {
		for (const item of list) {
			if (item.kbds?.length && (item.onSelect || item.onClick)) {
				const shortcutKey = item.kbds.join(separator);
				const handler = item.onSelect || item.onClick;
				if (handler) {
					shortcuts[shortcutKey] = handler;
				}
			}
			if (item.children) {
				traverse(item.children.flat());
			}
			if (item.items) {
				traverse(item.items.flat());
			}
		}
	}

	traverse(items.flat());

	return shortcuts;
}

export function defineShortcuts(
	config: MaybeRefOrGetter<ShortcutsConfig>,
	options: ShortcutsOptions = {},
) {
	const chainDelay = options.chainDelay ?? 800;
	const chainedInputs = ref<string[]>([]);
	const clearChainedInput = () => {
		chainedInputs.value.splice(0, chainedInputs.value.length);
	};
	const debouncedClearChainedInput = useDebounceFn(clearChainedInput, chainDelay);

	// A standalone shortcut that is also the first key of a chained shortcut (e.g. `f` and `f-h`)
	// is held back until the chain either completes or the delay elapses, so pressing `f` doesn't
	// fire the standalone and swallow the chain (#5654). Its `preventDefault` already ran on keydown.
	let pendingShortcut: { shortcut: Shortcut; event: KeyboardEvent } | undefined;
	const cancelPendingShortcut = () => {
		pendingShortcut = undefined;
		pendingTimer.stop();
	};
	const runPendingShortcut = () => {
		const pending = pendingShortcut;
		cancelPendingShortcut();
		if (!pending) {
			return;
		}

		// Re-resolve instead of trusting the held snapshot: `enabled` may have changed in the
		// meantime (e.g. focus moved into an input), and the pending shortcut is always unmodified.
		const shortcut = standardShortcuts.value.find(
			(entry) =>
				entry.key === pending.shortcut.key &&
				!entry.metaKey &&
				!entry.ctrlKey &&
				!entry.altKey &&
				!entry.shiftKey,
		);
		if (shortcut?.enabled) {
			shortcut.handler(pending.event);
		}
	};
	const pendingTimer = useTimeoutFn(
		() => {
			runPendingShortcut();
			clearChainedInput();
		},
		chainDelay,
		{ immediate: false },
	);

	const { macOS } = useKbd();
	const activeElement = useActiveElement();
	const layoutIndependent = options.layoutIndependent ?? false;

	const shiftableCodes = new Set(Array.from(shiftableKeys, (key) => convertKeyToCode(key)));

	const onKeyDown = (e: KeyboardEvent) => {
		// Input autocomplete triggers a keydown event
		if (!e.key) {
			return;
		}

		const useCode = layoutIndependent || e.altKey;
		const alphabetKey = useCode ? /^Key[A-Z]$/i.test(e.code) : /^[a-z]{1}$/i.test(e.key);
		const shiftableKey = useCode
			? shiftableCodes.has(e.code)
			: shiftableKeys.has(e.key.toLowerCase());

		let chainedKey: string | undefined;
		chainedInputs.value.push(layoutIndependent ? e.code : e.key);
		if (chainedInputs.value.length >= 2) {
			chainedKey = chainedInputs.value.slice(-2).join("-");

			for (const shortcut of chainedShortcuts.value) {
				if (shortcut.key !== chainedKey) {
					continue;
				}

				if (shortcut.enabled) {
					cancelPendingShortcut();
					e.preventDefault();
					shortcut.handler(e);
				} else {
					runPendingShortcut();
				}
				clearChainedInput();
				return;
			}
		}

		runPendingShortcut();

		for (const shortcut of standardShortcuts.value) {
			if (layoutIndependent) {
				if (e.code !== shortcut.key) {
					continue;
				}
			} else if (shortcut.altKey && e.altKey) {
				// Alt/Option modifies e.key on macOS (e.g. Alt+K → "˚"), so compare via e.code
				if (e.code !== convertKeyToCode(shortcut.key)) {
					continue;
				}
			} else if (e.key.toLowerCase() !== shortcut.key) {
				continue;
			}

			if (e.metaKey !== shortcut.metaKey) {
				continue;
			}
			if (e.ctrlKey !== shortcut.ctrlKey) {
				continue;
			}
			if (e.altKey !== shortcut.altKey) {
				continue;
			}
			// Shift is checked for alphabet keys, shiftable keys, explicit shift shortcuts,
			// or when shift is pressed alongside meta/ctrl (where shift doesn't transform the key).
			if (
				(alphabetKey ||
					shiftableKey ||
					shortcut.shiftKey ||
					(e.shiftKey && (e.metaKey || e.ctrlKey))) &&
				e.shiftKey !== shortcut.shiftKey
			) {
				continue;
			}

			const isUnmodified =
				!shortcut.metaKey && !shortcut.ctrlKey && !shortcut.altKey && !shortcut.shiftKey;
			if (isUnmodified && chainPrefixes.value.has(shortcut.key)) {
				if (shortcut.enabled) {
					e.preventDefault();
				}
				pendingShortcut = { shortcut, event: e };
				pendingTimer.start();
				return;
			}

			if (shortcut.enabled) {
				e.preventDefault();
				shortcut.handler(e);
			}
			clearChainedInput();
			return;
		}

		debouncedClearChainedInput();
	};

	const usingInput = computed(() => {
		const tagName = activeElement.value?.tagName;
		const contentEditable = activeElement.value?.contentEditable;

		const isUsingInput = !!(
			tagName === "INPUT" ||
			tagName === "TEXTAREA" ||
			contentEditable === "true" ||
			contentEditable === "plaintext-only"
		);

		if (isUsingInput) {
			const name = (activeElement.value as HTMLInputElement | undefined)?.name;
			return name || true;
		}

		return false;
	});

	const shortcuts = computed<Shortcut[]>(() =>
		Object.entries(toValue(config))
			.map(([key, shortcutConfig]) => {
				if (!shortcutConfig) {
					return null;
				}

				let shortcut: Partial<Shortcut>;

				if (
					key.includes("-") &&
					key !== "-" &&
					!key.includes("_") &&
					!key.match(chainedShortcutRegex)?.length
				) {
					console.trace(`[Shortcut] Invalid key: "${key}"`);
				}

				if (key.includes("_") && key !== "_" && !key.match(combinedShortcutRegex)?.length) {
					console.trace(`[Shortcut] Invalid key: "${key}"`);
				}

				const chained = key.includes("-") && key !== "-" && !key.includes("_");
				if (chained) {
					if (layoutIndependent) {
						const parts = key.split("-").map((part) => convertKeyToCode(part));
						shortcut = {
							key: parts.join("-"),
							metaKey: false,
							ctrlKey: false,
							shiftKey: false,
							altKey: false,
						};
					} else {
						shortcut = {
							key: key.toLowerCase(),
							metaKey: false,
							ctrlKey: false,
							shiftKey: false,
							altKey: false,
						};
					}
				} else {
					const keySplit = key
						.toLowerCase()
						.split("_")
						.map((part) => part);
					let baseKey = keySplit
						.filter(
							(part) =>
								!["meta", "command", "ctrl", "shift", "alt", "option"].includes(
									part,
								),
						)
						.join("_");
					if (layoutIndependent) {
						baseKey = convertKeyToCode(baseKey);
					}
					shortcut = {
						key: baseKey,
						metaKey: keySplit.includes("meta") || keySplit.includes("command"),
						ctrlKey: keySplit.includes("ctrl"),
						shiftKey: keySplit.includes("shift"),
						altKey: keySplit.includes("alt") || keySplit.includes("option"),
					};
				}
				shortcut.chained = chained;

				// Convert Meta to Ctrl for non-MacOS
				if (!macOS.value && shortcut.metaKey && !shortcut.ctrlKey) {
					shortcut.metaKey = false;
					shortcut.ctrlKey = true;
				}

				if (typeof shortcutConfig === "function") {
					shortcut.handler = shortcutConfig;
				} else if (typeof shortcutConfig === "object") {
					shortcut = { ...shortcut, handler: shortcutConfig.handler };
				}

				if (!shortcut.handler) {
					console.trace("[Shortcut] Invalid value");
					return null;
				}

				let enabled = true;
				const usingInputOption =
					typeof shortcutConfig === "object" ? shortcutConfig.usingInput : undefined;
				if (!usingInputOption) {
					enabled = !usingInput.value;
				} else if (typeof usingInputOption === "string") {
					enabled = usingInput.value === usingInputOption;
				}
				shortcut.enabled = enabled;

				return shortcut as Shortcut;
			})
			.filter((entry): entry is Shortcut => entry !== null),
	);

	const chainedShortcuts = computed(() => shortcuts.value.filter((entry) => entry.chained));
	const standardShortcuts = computed(() => shortcuts.value.filter((entry) => !entry.chained));
	const chainPrefixes = computed(
		() =>
			new Set(
				chainedShortcuts.value
					.map((entry) => entry.key.split("-")[0])
					.filter((prefix): prefix is string => prefix !== undefined),
			),
	);

	return useEventListener("keydown", onKeyDown);
}
