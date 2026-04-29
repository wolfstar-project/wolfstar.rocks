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
		pendingPopstate = true;
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

		// Skip any in-flight transition before starting a new one so that
		// startViewTransition does not throw when one is already active.
		if (document.activeViewTransition) {
			document.activeViewTransition.skipTransition();
		}

		const promise = new Promise<void>((resolve) => {
			finishTransition = resolve;
		});

		let changeRoute: () => void;
		const ready = new Promise<void>((resolve) => (changeRoute = resolve));

		if (document.activeViewTransition) {
			document.activeViewTransition.skipTransition();
		}

		try {
			transition = document.startViewTransition(() => {
				changeRoute!();
				return promise;
			});
		} catch {
			// If startViewTransition still throws, clean up and let navigation
			// proceed without a transition so the router does not hang.
			finishTransition?.();
			resetTransitionState();
			return;
		}

		if ("types" in transition && transition.types instanceof Set) {
			const typed = transition as ViewTransitionTyped;
			for (const type of types) typed.types.add(type);
		}

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
