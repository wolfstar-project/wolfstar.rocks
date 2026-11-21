export default defineNitroPlugin((nitroApp) => {
	if (import.meta.prerender) {
		nitroApp.hooks.hook("render:html", (html, { event }) => {
			if (event.path === "/200.html") {
				html.bodyAppend.push(`
					<noscript>
						<main id="maincontent" tabindex="-1">
							<h1>JavaScript is required for this page</h1>
							<p>This page needs JavaScript to load the requested content.</p>
							<p><a href="/">Go to the home page</a></p>
						</main>
					</noscript>
				`);
			}
		});
	}
});
