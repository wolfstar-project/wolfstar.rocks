import Git from "simple-git";
import { isDevelopment } from "std-env";
import { Env } from "../shared/types";

export { version } from "../package.json";

/**
 * Environment variable `PULL_REQUEST` provided by Netlify.
 * @see {@link https://docs.netlify.com/configure-builds/environment-variables/#git-metadata}
 *
 * Whether triggered by a GitHub PR
 */
export const isPR = process.env.PULL_REQUEST === "true";

/**
 * Environment variable `BRANCH` provided by Netlify.
 * @see {@link https://docs.netlify.com/configure-builds/environment-variables/#git-metadata}
 *
 * Git branch
 */
export const gitBranch = process.env.BRANCH;

/**
 * Environment variable `CONTEXT` provided by Netlify.
 * @see {@link https://docs.netlify.com/configure-builds/environment-variables/#build-metadata}
 *
 * Whether triggered by PR, `deploy-preview` or `dev`.
 */
export const isPreview = isPR || process.env.CONTEXT === "deploy-preview" || process.env.CONTEXT === "dev";

export async function getGitInfo() {
  const git = Git();
  let branch;
  try {
    branch = gitBranch || await git.revparse(["--abbrev-ref", "HEAD"]);
  }
  catch {
    branch = "unknown";
  }

  let commit;
  try {
    commit = await git.revparse(["HEAD"]);
  }
  catch {
    commit = "unknown";
  }

  let shortCommit;
  try {
    shortCommit = await git.revparse(["--short=7", "HEAD"]);
  }
  catch {
    shortCommit = "unknown";
  }

  return { branch, commit, shortCommit };
}

export async function getEnv() {
  const { commit, shortCommit, branch } = await getGitInfo();
  const env = isDevelopment
    ? Env.Dev
    : isPreview
      ? Env.Preview
      : branch === "main"
        ? Env.Canary
        : Env.Release;
  return { commit, shortCommit, branch, env } as const;
}
