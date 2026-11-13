import type { StarylRelease } from "../shared/types/env.ts";
import * as v from "valibot";

const REPOSITORY = "wolfstar-project/staryl";
const MANIFEST_URL = `https://raw.githubusercontent.com/${REPOSITORY}/main/package.json`;
const LATEST_COMMIT_URL = `https://api.github.com/repos/${REPOSITORY}/commits/main`;
/** Each request gets this long before the build moves on without the release. */
const TIMEOUT_MS = 5000;

const ManifestSchema = v.object({ version: v.pipe(v.string(), v.nonEmpty()) });
const LatestCommitSchema = v.object({
	commit: v.object({ committer: v.object({ date: v.pipe(v.string(), v.isoTimestamp()) }) }),
});

async function getJson(url: string, headers?: Record<string, string>): Promise<unknown> {
	const response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
	if (!response.ok) throw new Error(`${url} answered ${response.status}`);
	return response.json();
}

/**
 * Staryl's version, as its `package.json` on `main` declares it, and the time
 * of the latest commit there, which production runs. Staryl publishes no
 * GitHub releases to read instead.
 *
 * `null` when GitHub cannot be reached or answers something else: the release
 * line is copy, and a build never fails over it. The token, when there is one,
 * only spares the build GitHub's limit on anonymous API requests.
 */
export async function fetchStarylRelease(
	options: { token?: string } = {},
): Promise<StarylRelease | null> {
	const apiHeaders: Record<string, string> = { Accept: "application/vnd.github+json" };
	if (options.token) apiHeaders.Authorization = `Bearer ${options.token}`;

	try {
		const [manifest, latestCommit] = await Promise.all([
			getJson(MANIFEST_URL),
			getJson(LATEST_COMMIT_URL, apiHeaders),
		]);
		const { version } = v.parse(ManifestSchema, manifest);
		const { date } = v.parse(LatestCommitSchema, latestCommit).commit.committer;
		return { version, time: Date.parse(date) };
	} catch {
		return null;
	}
}
