import Git from "simple-git";
import { isDevelopment } from "std-env";
import { Env } from "~~/shared/types/index";

export { version } from "../package.json";

const git = Git();
export async function getGitInfo() {
  let branch;
  try {
    branch = await git.revparse(["--abbrev-ref", "HEAD"]);
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

  const env = isDevelopment ? Env.Dev : process.env.CF_PAGES_BRANCH === "main" ? Env.Prod : (process.env.CF_PAGES_BRANCH ?? "unknown");
  return { commit, shortCommit, branch, env } as const;
}
