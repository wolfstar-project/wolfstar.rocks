---
number: 59
title: Support standard build envs for CI / Git integrations
type: other
state: open
created: 2023-07-17
url: "https://github.com/unjs/std-env/issues/59"
reactions: 1
comments: 2
labels: "[discussion]"
---

# Support standard build envs for CI / Git integrations

CI/CD pipelines often provide variables such as deployment URL, git hash, git branch, etc.  We might expose standard exports that can scan them.

Some providers:

## Vercel

https://vercel.com/docs/projects/environment-variables/system-environment-variables

`VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_GIT_PROVIDER`, `VERCEL_GIT_REPO_SLUG`, `VERCEL_GIT_REPO_OWNER`, `VERCEL_GIT_REPO_ID`, `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_MESSAGE`, `VERCEL_GIT_COMMIT_AUTHOR_LOGIN`, `VERCEL_GIT_COMMIT_AUTHOR_NAME`, `VERCEL_GIT_PREVIOUS_SHA`

## Netlify

https://docs.netlify.com/configure-builds/environment-variables/

`REPOSITORY_URL`, `BRANCH`, `HEAD`, `COMMIT_REF`, `CACHED_COMMIT_REF`, `CACHED_COMMIT_REF`, `PULL_REQUEST`, `REVIEW_ID`, `URL`, `DEPLOY_URL`, `DEPL...