// `nextTick` is imported rather than auto-imported so this module also runs
// under the plain-node unit test project, which has no Nuxt auto-imports.
import { nextTick } from "vue";

interface DocumentWithActiveViewTransition extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

export interface ViewTransitionOptions {
	/** Applies the update without a transition, for `useReduceMotion()` callers. */
	reduceMotion?: boolean;
	/**
	 * What to do when another view transition is already running. `"skip"` ends
	 * it and starts a fresh one; `"bypass"` applies the update with no
	 * transition of its own, which is what an update landing mid-navigation
	 * wants, since the navigation owns the screen.
	 */
	whenActive?: "bypass" | "skip";
}

/**
 * Applies a state change inside a View Transition, so the browser animates the
 * before/after snapshots instead of the app hand-rolling enter/leave classes.
 *
 * Falls back to applying the update directly wherever a transition cannot or
 * should not run: on the server, without browser support, and under reduced
 * motion. The update is awaited to the next tick inside the transition so Vue
 * has committed the DOM before the browser takes its "after" snapshot.
 */
export function startViewTransition(update: () => void, options: ViewTransitionOptions = {}): void {
	const { reduceMotion = false, whenActive = "skip" } = options;

	if (typeof document === "undefined" || !document.startViewTransition || reduceMotion) {
		update();
		return;
	}

	const active = (document as DocumentWithActiveViewTransition).activeViewTransition;
	if (active) {
		if (whenActive === "bypass") {
			update();
			return;
		}
		active.skipTransition();
	}

	document.startViewTransition(async () => {
		update();
		await nextTick();
	});
}
