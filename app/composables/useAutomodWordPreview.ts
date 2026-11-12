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
	// Whether the worker has loaded, and whether it still owes an answer.
	let ready = false;
	let busy = false;

	function stopWorker() {
		worker?.terminate();
		worker = null;
		ready = false;
		busy = false;
	}

	// The bot's timeout is for the match alone: it is counted from when the
	// worker can run it, not from the load of the worker's code.
	function startTimeout(id: number) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (id !== lastId) return;
			// The bot gives up on the message too: it is not filtered.
			stopWorker();
			status.value = "timeout";
		}, AutomodWordMatchTimeout);
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
			(event: MessageEvent<{ id?: number; matches?: AutomodWordMatch[]; ready?: true }>) => {
				if (event.data.ready) {
					ready = true;
					if (busy) startTimeout(lastId);
					return;
				}
				busy = false;
				if (event.data.id !== lastId || !event.data.matches) return;
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
		matches.value = expression === null ? [] : findAutomodMessageMatches(expression, message);
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
		// A slow check still running would hold the new one behind it. An idle
		// worker is kept: starting one for each run would load its code again.
		if (busy) stopWorker();
		const active = startWorker();
		if (active === null) {
			runOnPage(list, message);
			return;
		}
		status.value = "running";
		busy = true;
		if (ready) startTimeout(id);
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
