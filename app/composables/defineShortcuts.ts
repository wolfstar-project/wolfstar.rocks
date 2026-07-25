import type { ShortcutsConfig, ShortcutHandler } from "#shared/types/ui";
import { useActiveElement, useDebounceFn, useEventListener } from "@vueuse/core";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

interface ParsedShortcut {
	key: string;
	chained: boolean;
	metaKey: boolean;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	handler: (e?: KeyboardEvent) => void;
	enabled: boolean;
}

const CHAIN_DELAY_MS = 800;
const SHIFTABLE_KEYS = new Set([
	"arrowleft",
	"arrowright",
	"arrowup",
	"arrowdown",
	"tab",
	"escape",
	"enter",
	"backspace",
]);

function resolveHandler(config: ShortcutHandler): ((e?: KeyboardEvent) => void) | null {
	if (!config) return null;
	if (typeof config === "function") return config;
	return config.handler;
}

function parseShortcutKey(key: string): Omit<ParsedShortcut, "handler" | "enabled"> {
	const chained = key.includes("-") && key !== "-" && !key.includes("_");
	if (chained) {
		return {
			key: key.toLowerCase(),
			chained: true,
			metaKey: false,
			ctrlKey: false,
			shiftKey: false,
			altKey: false,
		};
	}

	const parts = key.toLowerCase().split("_");
	const baseKey = parts
		.filter((part) => !["meta", "command", "ctrl", "shift", "alt", "option"].includes(part))
		.join("_");

	return {
		key: baseKey,
		chained: false,
		metaKey: parts.includes("meta") || parts.includes("command"),
		ctrlKey: parts.includes("ctrl"),
		shiftKey: parts.includes("shift"),
		altKey: parts.includes("alt") || parts.includes("option"),
	};
}

/**
 * Nuxt-UI-compatible keyboard shortcut helper.
 * Listens on window keydown, supports chords like `g-h`, and skips input fields.
 */
export function defineShortcuts(config: MaybeRefOrGetter<ShortcutsConfig>) {
	const chainedInputs = ref<string[]>([]);
	const activeElement = useActiveElement();

	const clearChainedInput = () => {
		chainedInputs.value.splice(0, chainedInputs.value.length);
	};
	const debouncedClearChainedInput = useDebounceFn(clearChainedInput, CHAIN_DELAY_MS);

	const usingInput = computed(() => {
		const el = activeElement.value;
		if (!el) return false;
		const tagName = el.tagName;
		const contentEditable = el.contentEditable;
		return (
			tagName === "INPUT" ||
			tagName === "TEXTAREA" ||
			contentEditable === "true" ||
			contentEditable === "plaintext-only"
		);
	});

	const shortcuts = computed<ParsedShortcut[]>(() =>
		Object.entries(toValue(config)).flatMap(([key, shortcutConfig]) => {
			const handler = resolveHandler(shortcutConfig);
			if (!handler) return [];
			return [
				{
					...parseShortcutKey(key),
					handler,
					// Skip when focus is in an editable field (select menus gate via empty config)
					enabled: !usingInput.value,
				},
			];
		}),
	);

	const onKeyDown = (event: KeyboardEvent) => {
		if (!event.key) return;

		const pressed = event.key.toLowerCase();
		const alphabetKey = /^[a-z]$/i.test(event.key);
		const shiftableKey = SHIFTABLE_KEYS.has(pressed);

		chainedInputs.value.push(event.key);
		if (chainedInputs.value.length >= 2) {
			const chainedKey = chainedInputs.value
				.slice(-2)
				.map((part) => part.toLowerCase())
				.join("-");
			for (const shortcut of shortcuts.value.filter((entry) => entry.chained)) {
				if (shortcut.key !== chainedKey || !shortcut.enabled) continue;
				event.preventDefault();
				shortcut.handler(event);
				clearChainedInput();
				return;
			}
		}

		for (const shortcut of shortcuts.value.filter((entry) => !entry.chained)) {
			if (pressed !== shortcut.key) continue;
			if (event.metaKey !== shortcut.metaKey) continue;
			if (event.ctrlKey !== shortcut.ctrlKey) continue;
			if (event.altKey !== shortcut.altKey) continue;
			if (
				(alphabetKey || shiftableKey || shortcut.shiftKey || (event.shiftKey && (event.metaKey || event.ctrlKey))) &&
				event.shiftKey !== shortcut.shiftKey
			) {
				continue;
			}
			if (!shortcut.enabled) continue;
			event.preventDefault();
			shortcut.handler(event);
			clearChainedInput();
			return;
		}

		debouncedClearChainedInput();
	};

	return useEventListener("keydown", onKeyDown);
}
