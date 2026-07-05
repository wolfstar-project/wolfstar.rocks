const GITHUB_REPO_URL = "https://github.com/wolfstar-project/wolfstar.rocks";
const DISCORD_INVITE_URL = "https://discord.gg/gqAnRyUXG8";
const TWITTER_URL = "https://twitter.com/WolfstarApp";

/**
 * Recreates the subdomain redirects that used to live in netlify.toml.
 * Nitro's routeRules only match on pathname, not on the Host header, so
 * repo./chat./social./blog.wolfstar.rocks (all CNAMEd to this app) have to be
 * redirected here instead.
 */
export default defineEventHandler((event) => {
	const host = getRequestHost(event, { xForwardedHost: true });
	const { pathname, search } = getRequestURL(event);

	switch (host) {
		case "repo.wolfstar.rocks":
			return sendRedirect(event, `${GITHUB_REPO_URL}${pathname}${search}`, 301);
		case "chat.wolfstar.rocks":
			return sendRedirect(event, DISCORD_INVITE_URL, 301);
		case "social.wolfstar.rocks":
			if (pathname === "/twitter") {
				return sendRedirect(event, TWITTER_URL, 301);
			}
			return;
		case "blog.wolfstar.rocks": {
			const blogPath = pathname === "/" ? "/blog" : `/blog${pathname}`;
			return sendRedirect(event, `https://wolfstar.rocks${blogPath}${search}`, 301);
		}
		default:
			return;
	}
});
