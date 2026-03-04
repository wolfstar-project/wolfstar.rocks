import * as process from "node:process";
import Git from "simple-git";
import { version as packageVersion } from "../package.json";
import { getNextVersion } from "../scripts/next-version";

export { packageVersion as version };

/**
 * Environment variable `PULL_REQUEST` provided by Netlify.
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#git-metadata}
 *
 * Whether triggered by a GitHub PR
 */
export const isPR = process.env.PULL_REQUEST === "true";

/**
 * Environment variable `REVIEW_ID` provided by Netlify.
 * @see {@link https://docs.netlify.com/configure-builds/environment-variables/#git-metadata}
 *
 * Pull request number (if in a PR environment)
 */
export const prNumber = process.env.REVIEW_ID || null;

/**
 * Environment variable `BRANCH` provided by Netlify.
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#git-metadata}
 *
 * Git branch
 */
export const gitBranch = process.env.BRANCH;

export const isCanary =
	(process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV === "preview" ||
		process.env.NODE_ENV === "canary") &&
	gitBranch === "main" &&
	!isPR;

/**
 * Environment variable `CONTEXT` provided by Netlify.
 * `dev`, `production`, `deploy-preview`, `branch-deploy`, `preview-server`, or a branch name
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#build-metadata}
 *
 * Whether this is some sort of preview environment.
 */
export const isPreview = isPR || (process.env.CONTEXT && process.env.CONTEXT !== "production");
export const isProduction = process.env.CONTEXT === "production";

/**
 * Environment variable `URL` provided by Netlify.
 * This is always the current deploy URL, regardless of env.
 * @see {@link https://docs.netlify.com/build/functions/environment-variables/#functions}
 *
 * Preview URL for the current deployment, only available in preview environments.
 */
export const getPreviewUrl = () =>
	isPreview ? (process.env.URL ? process.env.URL : undefined) : undefined;

/**
 * Environment variable `URL` provided by Netlify.
 * This is always the current deploy URL, regardless of env.
 * @see {@link https://docs.netlify.com/build/functions/environment-variables/#functions}
 *
 * Production URL for the current deployment, only available in production environments.
 */
export const getProductionUrl = () =>
	isProduction ? (process.env.URL ? process.env.URL : undefined) : undefined;

const git = Git();
export async function getGitInfo() {
	let branch;
	try {
		branch = gitBranch || (await git.revparse(["--abbrev-ref", "HEAD"]));
	} catch {
		branch = "unknown";
	}

	let commit;
	try {
		// Netlify: COMMIT_REF
		commit = process.env.COMMIT_REF || (await git.revparse(["HEAD"]));
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
export async function getVersion() {
	try {
		const { next } = await getNextVersion();
		return next;
	} catch {
		return packageVersion;
	}
}

export async function getEnv(isDevelopment: boolean) {
	const [{ commit, shortCommit, branch }, version] = await Promise.all([
		getGitInfo(),
		getVersion(),
	]);
	const env = isDevelopment ? "dev" : isCanary ? "canary" : isPreview ? "preview" : "release";
	const previewUrl = getPreviewUrl();
	const productionUrl = getProductionUrl();
	return {
		version,
		commit,
		shortCommit,
		branch,
		env,
		previewUrl,
		productionUrl,
		prNumber,
	} as const;
}
