import * as process from "node:process";
import { simpleGit } from "simple-git";
import packageJson from "../package.json" with { type: "json" };
import { getNextVersion } from "../scripts/next-version.ts";

/**
 * Whether this is a build of a GitHub PR.
 * @see {@link https://docs.github.com/en/actions/reference/workflows-and-actions/variables}
 */
const isPR = process.env.GITHUB_EVENT_NAME === "pull_request";

/** Pull request number: GitHub names a PR's ref `<number>/merge`. */
const prNumber = isPR ? (process.env.GITHUB_REF_NAME?.split("/")[0] ?? null) : null;

/**
 * Git branch, from Workers Builds or from GitHub Actions.
 * @see {@link https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#environment-variables}
 */
const gitBranch =
	process.env.WORKERS_CI_BRANCH || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;

export const isCanary =
	(process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV === "preview" ||
		process.env.NODE_ENV === "canary") &&
	gitBranch === "main" &&
	!isPR;

/** Whether this is a build of a branch other than the ones that deploy to production or canary. */
const isPreview = isPR || (!!gitBranch && gitBranch !== "main" && gitBranch !== "release");

const git = simpleGit();

async function getGitInfo() {
	let branch;
	try {
		branch = gitBranch || (await git.revparse(["--abbrev-ref", "HEAD"]));
	} catch {
		branch = "unknown";
	}

	let commit;
	try {
		commit =
			process.env.WORKERS_CI_COMMIT_SHA ||
			process.env.GITHUB_SHA ||
			(await git.revparse(["HEAD"]));
	} catch {
		commit = "unknown";
	}

	let shortCommit;
	try {
		if (commit && commit !== "unknown") {
			shortCommit = commit.slice(0, 7);
		} else {
			shortCommit = await git.revparse(["--short=7", "HEAD"]);
		}
	} catch {
		shortCommit = "unknown";
	}

	return { branch, commit, shortCommit };
}

export async function getFileLastUpdated(path: string) {
	try {
		// Get ISO date of last commit for file
		const date = await git.log(["-1", "--format=%cI", "--", path]);
		return date.latest?.date || new Date().toISOString();
	} catch {
		return new Date().toISOString();
	}
}

/**
 * Resolves the **next** version by analysing conventional commits since the
 * last reachable `v*` tag.  Delegates to {@link getNextVersion} which is also
 * used by the `release-tag` and `release-pr` GitHub Actions workflows so the
 * version shown in the UI matches the tag that will be created *after* deploy.
 *
 * Falls back to `package.json` when git is unavailable (e.g. shallow clone).
 */
async function getVersion() {
	try {
		const { next } = await getNextVersion();
		return next;
	} catch {
		return packageJson.version;
	}
}

export async function getEnv(isDevelopment: boolean) {
	const [{ commit, shortCommit, branch }, version] = await Promise.all([
		getGitInfo(),
		getVersion(),
	]);
	const env = isDevelopment ? "dev" : isCanary ? "canary" : isPreview ? "preview" : "release";
	return {
		version,
		commit,
		shortCommit,
		branch,
		env,
		prNumber,
	} as const;
}
