/**
 * Fills in a post's authors from their GitHub accounts, when the site is built.
 * An author with a `username` gets the name, the avatar and the profile link of
 * that account, unless the frontmatter sets them itself. `docs/blog.md` lists
 * the fields.
 */

/** GitHub's rules for a login: letters, digits and single hyphens, at most 39. */
const GITHUB_LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export interface GitHubUser {
	name?: string;
	avatar?: string;
}

export interface FrontmatterAuthor {
	name?: string;
	username?: string;
	to?: string;
	avatar?: { src: string; alt?: string };
	[field: string]: unknown;
}

/** Reads one account from ungh.cc, the GitHub proxy that needs no token. */
async function fetchGitHubUser(username: string): Promise<GitHubUser | undefined> {
	try {
		const response = await fetch(`https://ungh.cc/users/${encodeURIComponent(username)}`, {
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return undefined;
		const body = (await response.json()) as { user?: { name?: unknown; avatar?: unknown } };
		return {
			avatar: typeof body.user?.avatar === "string" ? body.user.avatar : undefined,
			name:
				typeof body.user?.name === "string" && body.user.name ? body.user.name : undefined,
		};
	} catch {
		return undefined;
	}
}

export function isGitHubLogin(value: unknown): value is string {
	return typeof value === "string" && GITHUB_LOGIN.test(value);
}

/**
 * An author as the pages draw it. What the frontmatter sets wins; the account
 * fills the rest. Without an answer from ungh, the avatar is the one GitHub
 * serves at `github.com/<username>.png` and the name is the username.
 */
export async function resolveAuthor(
	author: FrontmatterAuthor,
	fetchUser: (username: string) => Promise<GitHubUser | undefined> = fetchGitHubUser,
): Promise<FrontmatterAuthor> {
	if (!isGitHubLogin(author.username)) return author;

	const username = author.username;
	const needsAccount = !author.name || !author.avatar?.src;
	const user = needsAccount ? await fetchUser(username) : undefined;

	return {
		...author,
		avatar: author.avatar?.src
			? author.avatar
			: { src: user?.avatar ?? `https://github.com/${username}.png` },
		name: author.name || user?.name || username,
		to: author.to ?? `https://github.com/${username}`,
	};
}

/** Resolves a list of authors, asking ungh once per account. */
export function createAuthorResolver(
	fetchUser: (username: string) => Promise<GitHubUser | undefined> = fetchGitHubUser,
) {
	const accounts = new Map<string, Promise<GitHubUser | undefined>>();
	const cachedFetch = (username: string) => {
		const key = username.toLowerCase();
		let account = accounts.get(key);
		if (!account) {
			account = fetchUser(username);
			accounts.set(key, account);
		}
		return account;
	};

	return (authors: FrontmatterAuthor[]) =>
		Promise.all(authors.map((author) => resolveAuthor(author, cachedFetch)));
}
