import Git from "simple-git";
import { isDevelopment } from "std-env";
import { Env } from "../shared/types/index";

export { version } from "../package.json";

const git = Git();
export async function getGitInfo() {
  let branch;
  try {
    if (process.env.CF_PAGES_BRANCH) {
      branch = process.env.CF_PAGES_BRANCH;
    }
    else {
      branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    }
  }
  catch {
    branch = "unknown";
  }

  let commit;

  try {
    if (process.env.CF_PAGES_COMMIT_SHA) {
      commit = process.env.CF_PAGES_COMMIT_SHA;
    }
    else {
      commit = await git.revparse(["HEAD"]);
    }
  }
  catch {
    commit = "unknown";
  }

  let shortCommit;

  try {
    if (process.env.CF_PAGES_COMMIT_SHA) {
      shortCommit = process.env.CF_PAGES_COMMIT_SHA.slice(0, 7);
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

export async function getEnv() {
  const { commit, shortCommit, branch } = await getGitInfo();

  const env = isDevelopment ? Env.Dev : branch === "main" ? Env.Prod : branch;
  return { commit, shortCommit, branch, env } as const;
}
