import * as process from "node:process";
import { simpleGit } from "simple-git";
import packageJson from "../package.json" with { type: "json" };
import { getNextVersion } from "../scripts/next-version.ts";

/**
 * The branch of a Workers Build.
 * @see {@link https://developers.cloudflare.com/workers/ci-cd/builds/configuration/#environment-variables}
 */
const gitBranch = process.env.WORKERS_CI_BRANCH;

export const isCanary =
	(process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV === "preview" ||
		process.env.NODE_ENV === "canary") &&
	gitBranch === "main";

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
	const env = isDevelopment ? "dev" : isCanary ? "canary" : "release";
	return {
		version,
		commit,
		shortCommit,
		branch,
		env,
	} as const;
}
