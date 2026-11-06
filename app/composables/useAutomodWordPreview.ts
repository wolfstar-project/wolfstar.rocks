import {
	AutomodWordMatchTimeout,
	compileAutomodWords,
	findAutomodWordMatches,
	MaximumAutomodWordPreviewLength,
	type AutomodWordMatch,
} from "#shared/utils/automod-word-pattern";

export type AutomodWordPreviewStatus = "idle" | "running" | "done" | "timeout" | "error";

/**
 * Matches a test message with the words of a rule, as the bot would, in a worker it ends after the bot's own timeout.
 *
 * @remarks The text is cut at {@linkcode MaximumAutomodWordPreviewLength}. Without workers (tests, old browsers) the
 * match runs on the page.
 */
export function useAutomodWordPreview(
	words: MaybeRefOrGetter<readonly string[]>,
	text: MaybeRefOrGetter<string>,
) {
	const status = ref<AutomodWordPreviewStatus>("idle");
	const matches = shallowRef<AutomodWordMatch[]>([]);

	let worker: Worker | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastId = 0;

	function stopWorker() {
		worker?.terminate();
		worker = null;
	}

	function startWorker(): Worker | null {
		if (worker) return worker;
		if (typeof Worker === "undefined") return null;
		try {
			worker = new Worker(new URL("../workers/automod-word-preview.ts", import.meta.url), {
				type: "module",
			});
		} catch {
			return null;
		}
		worker.addEventListener(
			"message",
			(event: MessageEvent<{ id: number; matches: AutomodWordMatch[] }>) => {
				if (event.data.id !== lastId) return;
				clearTimeout(timer);
				matches.value = event.data.matches;
				status.value = "done";
			},
		);
		worker.addEventListener("error", () => {
			clearTimeout(timer);
			stopWorker();
			status.value = "error";
		});
		return worker;
	}

	function runOnPage(list: string[], message: string) {
		const expression = compileAutomodWords(list);
		matches.value = expression === null ? [] : findAutomodWordMatches(expression, message);
		status.value = "done";
	}

	const run = useDebounceFn(() => {
		const list = [...toValue(words)];
		const message = toValue(text).slice(0, MaximumAutomodWordPreviewLength);
		clearTimeout(timer);
		matches.value = [];
		if (list.length === 0 || message.length === 0) {
			status.value = "idle";
			return;
		}

		const id = ++lastId;
		const active = startWorker();
		if (active === null) {
			runOnPage(list, message);
			return;
		}
		status.value = "running";
		timer = setTimeout(() => {
			if (id !== lastId) return;
			// The bot gives up on the message too: it is not filtered.
			stopWorker();
			status.value = "timeout";
		}, AutomodWordMatchTimeout);
		active.postMessage({ id, kind: "matches", words: list, text: message });
	}, 150);

	watch(
		() => [toValue(words), toValue(text)] as const,
		() => {
			// The offsets of the last message do not fit the new one: drop them now,
			// not when the debounced run starts.
			matches.value = [];
			lastId++;
			status.value = "running";
			void run();
		},
		{
			immediate: true,
			deep: true,
		},
	);

	onScopeDispose(() => {
		clearTimeout(timer);
		stopWorker();
	});

	return { status, matches };
}
