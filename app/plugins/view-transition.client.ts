import type { ClassifyInput } from "~/utils/view-transition-classifier";
import { classifyNavigation } from "~/utils/view-transition-classifier";

interface ViewTransitionTyped extends ViewTransition {
	readonly types: Set<string>;
}

type PopStateEventExtended = PopStateEvent & { hasUAVisualTransition?: boolean };

/**
 * Router-driven View Transitions plugin.
 *
 * Manually wraps Nuxt navigations in document.startViewTransition, classifies
 * each navigation with direction and route-family types for CSS targeting, and
 * respects both system and user-level reduced-motion preferences.
 */
export default defineNuxtPlugin((nuxtApp) => {
	if (!document.startViewTransition) return;

	const router = useRouter();
	const { effectiveReduceMotion } = useReduceMotion();

	let currentTransition: ViewTransition | undefined;
	let finishTransition: (() => void) | undefined;
	let pendingPopstate = false;
	let pendingUAVisual = false;

	const resetTransitionState = () => {
		currentTransition = undefined;
		finishTransition = undefined;
	};

	window.addEventListener("popstate", (event: PopStateEventExtended) => {
		pendingPopstate = true;
		pendingUAVisual = event.hasUAVisualTransition ?? false;
		if (pendingUAVisual) currentTransition?.skipTransition();
	});

	router.beforeResolve(async (to, from) => {
		// Capture and reset per-navigation flags before any early return so they never leak.
		const isPopstate = pendingPopstate;
		const hasUAVisual = pendingUAVisual;
		pendingPopstate = false;
		pendingUAVisual = false;

		if (to.matched.length === 0) return;
		if (to.meta.viewTransition === false) return;
		if (hasUAVisual) return;
		if (effectiveReduceMotion.value) return;

		const input: ClassifyInput = { toPath: to.path, fromPath: from.path, isPopstate };
		const types = classifyNavigation(input);
		if (types.length === 0) return;

		const promise = new Promise<void>((resolve) => {
			finishTransition = resolve;
		});
		let changeRoute!: () => void;
		const ready = new Promise<void>((resolve) => {
			changeRoute = resolve;
		});

		const vt = document.startViewTransition(() => {
			changeRoute();
			return promise;
		});
		currentTransition = vt;

		const typed = vt as unknown as ViewTransitionTyped;
		for (const type of types) typed.types.add(type);

		vt.finished.then(resetTransitionState);

		return ready;
	});

	const abortTransition = () => {
		currentTransition?.skipTransition();
		finishTransition?.();
		resetTransitionState();
	};
	router.onError(abortTransition);
	nuxtApp.hook("app:error", abortTransition);
	nuxtApp.hook("vue:error", abortTransition);
	nuxtApp.hook("page:finish", () => {
		finishTransition?.();
		resetTransitionState();
	});
});
