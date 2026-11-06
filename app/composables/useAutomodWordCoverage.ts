import { findCoveredAutomodWords } from "~/utils/automod-words";

/** How long the check may run before it is dropped, so a word that backtracks badly cannot freeze the page. */
const COVERAGE_TIMEOUT = 2000;

/**
 * For each word of a list, another word that already catches it. It runs in a worker that is ended after
 * {@linkcode COVERAGE_TIMEOUT}, and the list then shows no warnings; without workers it runs on the page.
 */
export function useAutomodWordCoverage(words: MaybeRefOrGetter<readonly string[]>) {
	const covered = shallowRef<ReadonlyMap<string, string>>(new Map());

	let worker: Worker | null = null;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let lastId = 0;

	function stopWorker() {
		clearTimeout(timer);
		worker?.terminate();
		worker = null;
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
			(event: MessageEvent<{ id: number; covered?: [string, string][] }>) => {
				if (event.data.id !== lastId || !event.data.covered) return;
				clearTimeout(timer);
				covered.value = new Map(event.data.covered);
			},
		);
		worker.addEventListener("error", stopWorker);
		return worker;
	}

	const run = useDebounceFn(() => {
		const list = [...toValue(words)];
		const id = ++lastId;
		clearTimeout(timer);
		if (list.length < 2) {
			covered.value = new Map();
			return;
		}
		stopWorker();
		const active = start();
		if (active === null) {
			covered.value = findCoveredAutomodWords(list);
			return;
		}
		timer = setTimeout(() => {
			if (id !== lastId) return;
			stopWorker();
			covered.value = new Map();
		}, COVERAGE_TIMEOUT);
		active.postMessage({ id, kind: "covered", words: list });
	}, 250);

	watch(
		() => [...toValue(words)],
		() => void run(),
		{ immediate: true },
	);

	onScopeDispose(stopWorker);

	return covered;
}
