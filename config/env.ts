import Git from "simple-git";
import { isDevelopment } from "std-env";
import { Env } from "../shared/types/index";

export { version } from "../package.json";

export async function getGitInfo() {
  const git = Git();
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

  let env: Env;
  if (isDevelopment) {
    env = Env.Dev;
  }
  else {
    switch (branch) {
      case "main":
        env = Env.Prod;
        break;
      case "refactor/":
        env = Env.Canary;
        break;
      default:
        env = Env.Dev;
    }
  }
  return { commit, shortCommit, branch, env } as const;
}
