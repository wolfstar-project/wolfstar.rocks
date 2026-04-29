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
	const { effectiveReduceMotion } = useReduceMotion();

	let transition: ViewTransition | undefined;
	let finishTransition: (() => void) | undefined;
	let hasUAVisualTransition = false;
	let pendingPopstate = false;

	const resetTransitionState = () => {
		transition = undefined;
		finishTransition = undefined;
		hasUAVisualTransition = false;
	};

	// Respect browser-initiated visual transitions (e.g. swipe-back)
	window.addEventListener("popstate", (event) => {
		hasUAVisualTransition = (event as PopStateEventExtended).hasUAVisualTransition ?? false;
		if (hasUAVisualTransition) {
			transition?.skipTransition();
		}
	});

	const router = useRouter();

	router.beforeResolve(async (to, from) => {
		if (to.matched.length === 0) return;
		// Capture and reset per-navigation flags before any early return so they never leak.
		const isPopstate = pendingPopstate;
		pendingPopstate = false;

		const toPath = to.path;
		const fromPath = from.path;

		//  Respect if vieTransition is disabled on the page
		if (to.meta.viewTransition === false) return;

		// Respect prefers-reduced-motion
		if (effectiveReduceMotion.value) return;

		// Skip if browser already handled the visual transition
		if (hasUAVisualTransition) return;

		const input: ClassifyInput = { toPath, fromPath, isPopstate };
		const types = classifyNavigation(input);
		if (types.length === 0) return;

		const promise = new Promise<void>((resolve) => {
			finishTransition = resolve;
		});

		let changeRoute: () => void;
		const ready = new Promise<void>((resolve) => (changeRoute = resolve));

		transition = document.startViewTransition(() => {
			changeRoute!();
			return promise;
		});

		const typed = transition as unknown as ViewTransitionTyped;
		for (const type of types) typed.types.add(type);

		transition.finished.then(resetTransitionState);

		return ready;
	});

	// Abort on errors
	router.onError(() => {
		finishTransition?.();
		resetTransitionState();
	});
	nuxtApp.hook("app:error", () => {
		finishTransition?.();
		resetTransitionState();
	});
	nuxtApp.hook("vue:error", () => {
		finishTransition?.();
		resetTransitionState();
	});

	nuxtApp.hook("page:finish", () => {
		finishTransition?.();
		resetTransitionState();
	});
});
