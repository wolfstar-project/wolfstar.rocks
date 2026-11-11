import type { AutomodWordExample } from "~/utils/automod-words";

/** How long the examples may take before they are dropped: a word that backtracks badly shows none. */
const EXAMPLES_TIMEOUT = 1000;

/**
 * The example messages of a word being written, each checked with the bot's expression. They run in a worker that is
 * ended after {@linkcode EXAMPLES_TIMEOUT}: a word such as thirty-one `a` and a `b` takes the expression through every
 * way to split its letters, which on the page would freeze the editor. Without workers they run on the page.
 */
export function useAutomodWordExamples(word: MaybeRefOrGetter<string>) {
	const examples = shallowRef<AutomodWordExample[]>([]);

	let worker: Worker | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastId = 0;
	// Whether the worker has loaded, and whether it still owes an answer.
	let ready = false;
	let busy = false;

	function stopWorker() {
		clearTimeout(timer);
		worker?.terminate();
		worker = null;
		ready = false;
		busy = false;
	}

	// Counted from when the worker can run the request, not from the load of
	// its code, as the preview counts its own.
	function startTimeout(id: number) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			if (id !== lastId) return;
			stopWorker();
			examples.value = [];
		}, EXAMPLES_TIMEOUT);
	}

	function start(): Worker | null {
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
			(
				event: MessageEvent<{ id?: number; examples?: AutomodWordExample[]; ready?: true }>,
			) => {
				if (event.data.ready) {
					ready = true;
					if (busy) startTimeout(lastId);
					return;
				}
				if (event.data.id === undefined) return;
				busy = false;
				if (event.data.id !== lastId || !event.data.examples) return;
				clearTimeout(timer);
				examples.value = event.data.examples;
			},
		);
		worker.addEventListener("error", stopWorker);
		return worker;
	}

	const run = useDebounceFn(() => {
		const candidate = toValue(word);
		const id = ++lastId;
		clearTimeout(timer);
		if (candidate.length === 0) {
			// A word still being checked would run on with nothing to stop it.
			if (busy) stopWorker();
			examples.value = [];
			return;
		}
		if (busy) stopWorker();
		const active = start();
		if (active === null) {
			examples.value = automodWordExamples(candidate);
			return;
		}
		busy = true;
		if (ready) startTimeout(id);
		active.postMessage({ id, kind: "examples", word: candidate });
	}, 150);

	watch(
		() => toValue(word),
		() => void run(),
		{ immediate: true },
	);

	onScopeDispose(stopWorker);

	return examples;
}
