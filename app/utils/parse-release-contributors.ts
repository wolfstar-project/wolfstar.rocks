export interface ReleaseContributor {
	name: string;
	username: string;
}

export interface ChangelogContributorItem {
	name: string;
	username: string;
	commits: number;
	hasContributed: boolean;
	avatarSrc: string;
}

export interface ParseReleaseContributorsResult {
	bodyMarkdown: string;
	contributors: ReleaseContributor[];
}

/** Matches `### ❤️ Contributors` / `### Contributors` (optional emoji). */
const CONTRIBUTORS_HEADING_RE = /^### (?:\u2764\uFE0F? )?Contributors$/m;

/** Trailing ` (@username)` on a contributor list item. */
const CONTRIBUTOR_HANDLE_RE = / \(@([A-Z0-9](?:[A-Z0-9-]{0,37}[A-Z0-9])?)\)$/i;

function parseContributorLine(line: string): ReleaseContributor | null {
	const trimmed = line.trim();
	if (!trimmed.startsWith("- ")) return null;

	const handleMatch = CONTRIBUTOR_HANDLE_RE.exec(trimmed);
	if (!handleMatch || handleMatch.index === undefined) return null;

	const username = handleMatch[1];
	const name = trimmed.slice(2, handleMatch.index).trim();
	if (!name || !username) return null;

	return { name, username };
}

/**
 * Splits release-notes markdown into the body (without the Contributors section)
 * and a structured list of contributors parsed from `- Name (@username)` lines.
 */
export function parseReleaseContributors(markdown: string): ParseReleaseContributorsResult {
	const headingMatch = CONTRIBUTORS_HEADING_RE.exec(markdown);
	if (!headingMatch || headingMatch.index === undefined) {
		return { bodyMarkdown: markdown, contributors: [] };
	}

	const sectionStart = headingMatch.index;
	const afterHeading = markdown.slice(sectionStart + headingMatch[0].length);
	const nextHeadingOffset = afterHeading.search(/^#{1,6} /m);
	const sectionBody =
		nextHeadingOffset === -1 ? afterHeading : afterHeading.slice(0, nextHeadingOffset);
	const sectionEnd =
		nextHeadingOffset === -1
			? markdown.length
			: sectionStart + headingMatch[0].length + nextHeadingOffset;

	const contributors: ReleaseContributor[] = [];
	const seenUsernames = new Set<string>();

	for (const line of sectionBody.split("\n")) {
		const parsed = parseContributorLine(line);
		if (!parsed || seenUsernames.has(parsed.username.toLowerCase())) continue;

		seenUsernames.add(parsed.username.toLowerCase());
		contributors.push(parsed);
	}

	const before = markdown.slice(0, sectionStart).trimEnd();
	const after = markdown.slice(sectionEnd).trimStart();
	const bodyMarkdown = [before, after].filter(Boolean).join("\n\n");

	return { bodyMarkdown, contributors };
}
