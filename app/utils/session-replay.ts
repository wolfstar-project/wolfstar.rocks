import * as Sentry from "@sentry/nuxt";
import { isMarketingPath } from "~/utils/marketing-routes";

let pending: Promise<void> | undefined;

/**
 * Starts Sentry Session Replay once the visitor allowed it. Loaded from the
 * Sentry CDN (allowed by CSP) so its rrweb bundle stays out of the app bundle,
 * and never on marketing pages, where it would compete with first paint. Does
 * nothing while Sentry is not set up (no DSN) or the replay is already loaded.
 */
export function startSessionReplay(pathname: string): void {
	if (!Sentry.getClient() || isMarketingPath(pathname) || Sentry.getReplay()) return;
	pending ??= Sentry.lazyLoadIntegration("replayIntegration")
		.then((replayIntegration) => {
			Sentry.addIntegration(replayIntegration());
		})
		.catch(() => {
			// A blocked CDN request leaves the page without a replay; a later choice retries.
			pending = undefined;
		});
}

/**
 * Stops the replay of this page when the visitor withdraws consent. The
 * integration stays loaded but idle; the next page load leaves it out.
 */
export function stopSessionReplay(): void {
	void Sentry.getReplay()?.stop();
}
