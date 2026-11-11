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
	let busy = false;

	function stopWorker() {
		clearTimeout(timer);
		worker?.terminate();
		worker = null;
		busy = false;
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
			(event: MessageEvent<{ id?: number; examples?: AutomodWordExample[] }>) => {
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
		timer = setTimeout(() => {
			if (id !== lastId) return;
			stopWorker();
			examples.value = [];
		}, EXAMPLES_TIMEOUT);
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
