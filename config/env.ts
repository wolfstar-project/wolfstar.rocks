import * as process from "node:process";
import Git from "simple-git";
import { version as packageVersion } from "../package.json";
import { getNextVersion } from "../scripts/next-version";
import {
	getDeployContext,
	getPreviewUrlFromContext,
	getProductionUrlFromContext,
} from "./deploy-context";

const deployContext = getDeployContext();

const { isPR, prNumber, gitBranch } = deployContext;

export const isCanary =
	(process.env.NODE_ENV === "production" ||
		process.env.NODE_ENV === "preview" ||
		process.env.NODE_ENV === "canary") &&
	gitBranch === "main" &&
	!isPR;

export const getPreviewUrl = () => getPreviewUrlFromContext(deployContext);

export const getProductionUrl = () => getProductionUrlFromContext(deployContext);

const git = Git();
async function getGitInfo() {
	let branch;
	try {
		branch = gitBranch || (await git.revparse(["--abbrev-ref", "HEAD"]));
	} catch {
		branch = "unknown";
	}

	let commit;
	try {
		commit = deployContext.commitRef || (await git.revparse(["HEAD"]));
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
	const { isPreview } = deployContext;
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
