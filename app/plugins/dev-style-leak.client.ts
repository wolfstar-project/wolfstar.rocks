/**
 * Development only: keeps the auth devtools page's stylesheet out of the app.
 *
 * `@nuxtjs/better-auth` ships a devtools page whose styles are not scoped
 * (`button:hover { background }`, `input { padding }`, `h2`, `article`, …). The
 * dev server injects them into every document, where they outrank component
 * styles: search icons end up under their placeholder and plain buttons gain a
 * second hover. Production never loads that page, so nothing here ships.
 */
export default defineNuxtPlugin(() => {
	if (!import.meta.dev) return;

	const DEVTOOLS_PATH = "/__better-auth-devtools";
	const isDevtoolsStyle = (node: Node): node is HTMLStyleElement | HTMLLinkElement => {
		if (node instanceof HTMLLinkElement) return node.href.includes("__better-auth-devtools");
		if (!(node instanceof HTMLStyleElement)) return false;
		return (
			(node.dataset["viteDevId"] ?? "").includes("better-auth-devtools") ||
			(node.textContent ?? "").includes("--ba-bg")
		);
	};

	const router = useRouter();
	const apply = () => {
		const onDevtoolsPage = router.currentRoute.value.path.startsWith(DEVTOOLS_PATH);
		for (const node of document.querySelectorAll("style, link[rel=stylesheet]")) {
			if (isDevtoolsStyle(node)) node.disabled = !onDevtoolsPage;
		}
	};

	// Vite adds the style tag whenever the module is first evaluated.
	new MutationObserver(apply).observe(document.head, { childList: true });
	router.afterEach(apply);
	apply();
});
