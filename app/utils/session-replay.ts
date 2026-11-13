import * as Sentry from "@sentry/nuxt";
import { isMarketingPath } from "~/utils/marketing-routes";

/** Whether the visitor currently allows session replay; a pending load checks it again. */
let allowed = false;
/** Whether a withdrawal stopped the replay, as opposed to a session the sample left out. */
let stopped = false;
let pending: Promise<void> | undefined;

/**
 * Starts Sentry Session Replay once the visitor allowed it. Loaded from the
 * Sentry CDN (allowed by CSP) so its rrweb bundle stays out of the app bundle,
 * and never on marketing pages, where it would compete with first paint. Does
 * nothing while Sentry is not set up (no DSN).
 *
 * A replay stopped earlier in the visit, by a withdrawal, starts again. Its
 * `start()` skips the session sample rate, so a visitor who turns replay back
 * on is recorded for the rest of that visit. A session the sample left out
 * stays out: the function runs on every route change.
 */
export function startSessionReplay(pathname: string): void {
	allowed = true;
	if (!Sentry.getClient() || isMarketingPath(pathname)) return;

	const replay = Sentry.getReplay();
	if (replay) {
		if (stopped) {
			stopped = false;
			replay.start();
		}
		return;
	}

	pending ??= Sentry.lazyLoadIntegration("replayIntegration")
		.then((replayIntegration) => {
			// The visitor may have withdrawn consent while the bundle loaded.
			if (allowed) Sentry.addIntegration(replayIntegration());
		})
		.catch(() => {
			// A blocked CDN request leaves the page without a replay; a later choice retries.
		})
		.finally(() => {
			pending = undefined;
		});
}

/**
 * Stops the replay of this page when the visitor withdraws consent, and keeps
 * a load still in flight from adding it.
 */
export function stopSessionReplay(): void {
	allowed = false;
	const replay = Sentry.getReplay();
	if (!replay || stopped) return;
	stopped = true;
	void replay.stop();
}
