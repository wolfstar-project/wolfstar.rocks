---
number: 9693
title: Snapshot behavior on CI?
category: "Q&A"
created: 2026-02-18
url: "https://github.com/vitest-dev/vitest/discussions/9693"
upvotes: 1
comments: 1
answered: true
---

# Snapshot behavior on CI?

I'm trying to figure out how snapshots behave when running in CI.

This doesn't seem to be covered by https://vitest.dev/guide/snapshot.html
Is there another place this is documented?

I found https://github.com/vitest-dev/vitest/pull/7963 which seems to suggest that obsolete snapshot will causes failed tests when running in CI. Though I'm not exactly sure what obsolete means here :) But never the less this is good.

Where can I find out how the snapshots behave when running in CI?

---

## Accepted Answer

**@hi-ogawa** [maintainer]:

EDIT: created https://github.com/vitest-dev/vitest/issues/9694

It looks like we are missing docs. We detect `process.env.CI` variable and such, then automatically flip this `--update` flag to be `false` https://vitest.dev/config/update.html This should be documented in https://vitest.dev/guide/snapshot.html#updating-snapshots 

https://github.com/vitest-dev/vitest/blob/8169fbdd146717df474a4fa7c9cbe91b13f012a1/packages/vitest/src/node/config/resolveConfig.ts#L564-L575