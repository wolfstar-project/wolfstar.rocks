import type { NuxtAppManifestMeta } from "#app";
import { isClientOutdatedResponse, resolveSkewCookie } from "#shared/utils/skew-protection";

/**
 * Makes `nuxt-skew-protection` behave correctly on this deployment.
 *
 * Three gaps are closed here, all of them consequences of running
 * `updateStrategy: "polling"` in front of prerendered, CDN-served pages:
 *
 * 1. **The version cookie never tracked the running build.** The server decides a
 *    client is outdated by comparing the `__nkpv` cookie against its own build id.
 *    That cookie is only written by the module's Nitro middleware on document
 *    responses, and by `createSkewConnection()` — a plugin that only ships with the
 *    `sse`/`ws`/adapter strategies. Marketing routes (`/`, `/wolfstar`, `/commands`,
 *    …) are prerendered and served statically, so neither writer runs for a visitor
 *    who enters through one. Their cookie keeps naming whatever build last rendered
 *    a document for them, and every `/api/**` call is rejected with the 409 from
 *    `defineWrappedResponseHandler` even though the browser is running the current
 *    build — a reload can't clear it, because the reload is served statically too.
 *    Pinning the cookie to the build actually loaded in the browser makes the
 *    server-side check report real skew only.
 *
 * 2. **Nothing tracked the app manifest.** `useSkewProtection().isAppOutdated` reads
 *    a shared `skew-manifest` state that is only written from inside an
 *    `onAppOutdated()` callback. The update prompt is lazy and deferred, so until it
 *    mounted, `app:manifest:update` was dropped and the prompt could never open.
 *
 * 3. **A genuine skew surfaced as a raw error.** A tab left open across a deploy hit
 *    the 409 with no client-side handling, so the user saw "Client version outdated"
 *    instead of the update prompt. Re-checking the manifest on that response flips
 *    `isAppOutdated`, which is what the prompt renders from.
 */
export default defineNuxtPlugin({
	name: "wolfstar:skew-protection",
	enforce: "pre",
	setup(nuxtApp) {
		const runtimeConfig = useRuntimeConfig();
		const buildId = runtimeConfig.app.buildId;

		const manifest = useState<NuxtAppManifestMeta | undefined>(
			"skew-manifest",
			() => undefined,
		);
		nuxtApp.hooks.hook("app:manifest:update", (meta) => {
			manifest.value = meta;
		});

		if (!buildId) return;

		const { name, options } = resolveSkewCookie(runtimeConfig.public.skewProtection?.cookie);
		const versionCookie = useCookie<string | null>(name, options);
		if (versionCookie.value !== buildId) versionCookie.value = buildId;

		const { checkForUpdates } = useSkewProtection({ lazy: true });

		let pendingCheck: Promise<void> | undefined;
		const checkNow = () => {
			pendingCheck ??= Promise.resolve(nuxtApp.runWithContext(checkForUpdates)).finally(
				() => {
					pendingCheck = undefined;
				},
			);
			return pendingCheck;
		};

		// `ofetch` resolves `globalThis.fetch` on every request, which makes it the only
		// seam that covers all call sites: Nuxt's auto-imported `$fetch` is a const
		// captured from `#build/fetch` before any plugin runs, so swapping
		// `globalThis.$fetch` would miss every module that already imported it.
		const nativeFetch = globalThis.fetch.bind(globalThis);
		globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
			const response = await nativeFetch(...args);
			if (isClientOutdatedResponse(response)) void checkNow();
			return response;
		};

		// The manifest poll Nuxt runs for `checkOutdatedBuildInterval` keeps ticking
		// while a tab is hidden, but a tab restored after a long sleep should not wait
		// out the remainder of the interval before it learns it is behind.
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") void checkNow();
		});
	},
});
