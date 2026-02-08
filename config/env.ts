import * as process from "node:process";
import Git from "simple-git";

export { version } from "../package.json";

/**
 * Environment variable `PULL_REQUEST` provided by Netlify.
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#git-metadata}
 *
 * Environment variable `VERCEL_GIT_PULL_REQUEST_ID` provided by Vercel.
 * @see {@link https://vercel.com/docs/environment-variables/system-environment-variables#VERCEL_GIT_PULL_REQUEST_ID}
 *
 * Whether triggered by a GitHub PR
 */
export const isPR = process.env.PULL_REQUEST === "true";

/**
 * Environment variable `BRANCH` provided by Netlify.
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#git-metadata}
 *
 * Git branch
 */
export const gitBranch = process.env.BRANCH;

/**
 * Environment variable `CONTEXT` provided by Netlify.
 * `dev`, `production`, `deploy-preview`, `branch-deploy`, `preview-server`, or a branch name
 * @see {@link https://docs.netlify.com/build/configure-builds/environment-variables/#build-metadata}
 *
 * Whether this is some sort of preview environment.
 */
export const isPreview
  = isPR
    || (process.env.CONTEXT && process.env.CONTEXT !== "production");
export const isProduction
  = process.env.CONTEXT === "production";

/**
 * Environment variable `URL` provided by Netlify.
 * This is always the current deploy URL, regardless of env.
 * @see {@link https://docs.netlify.com/build/functions/environment-variables/#functions}
 *
 * Preview URL for the current deployment, only available in preview environments.
 */
export const getPreviewUrl = () =>
  isPreview
    ? process.env.URL
    : undefined;

/**
 * Environment variable `URL` provided by Netlify.
 * This is always the current deploy URL, regardless of env.
 * @see {@link https://docs.netlify.com/build/functions/environment-variables/#functions}
 *
 * Production URL for the current deployment, only available in production environments.
 */
export const getProductionUrl = () =>
  isProduction
    ? process.env.URL
    : undefined;

const git = Git();
export async function getGitInfo() {
  let branch;
  try {
    branch = gitBranch || (await git.revparse(["--abbrev-ref", "HEAD"]));
  }
  catch {
    branch = "unknown";
  }

  let commit;
  try {
    // Netlify: COMMIT_REF
    commit
      = process.env.COMMIT_REF || (await git.revparse(["HEAD"]));
  }
  catch {
    commit = "unknown";
  }

  let shortCommit;
  try {
    if (commit && commit !== "unknown") {
      shortCommit = commit.slice(0, 7);
    }
    else {
      shortCommit = await git.revparse(["--short=7", "HEAD"]);
    }
  }
  catch {
    shortCommit = "unknown";
  }

  return { branch, commit, shortCommit };
}

export async function getFileLastUpdated(path: string) {
  try {
    // Get ISO date of last commit for file
    const date = await git.log(["-1", "--format=%cI", "--", path]);
    return date.latest?.date || new Date().toISOString();
  }
  catch {
    return new Date().toISOString();
  }
}

export async function getEnv(isDevelopment: boolean) {
  const { commit, shortCommit, branch } = await getGitInfo();
  const env = isDevelopment
    ? "dev"
    : isPreview
      ? "preview"
      : branch === "main"
        ? "canary"
        : "release";
  const previewUrl = getPreviewUrl();
  const productionUrl = getProductionUrl();
  return {
    commit,
    shortCommit,
    branch,
    env,
    previewUrl,
    productionUrl,
  } as const;
}
