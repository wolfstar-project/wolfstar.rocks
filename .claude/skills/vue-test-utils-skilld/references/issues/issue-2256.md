---
number: 2256
title: "Bug: Optional props are typed as `| undefined`"
type: bug
state: open
created: 2023-11-23
url: "https://github.com/vuejs/test-utils/issues/2256"
reactions: 0
comments: 2
labels: "[bug]"
---

# Bug: Optional props are typed as `| undefined`

**Describe the bug**
When using the `.props()` method on a VueWrapper for a prop which is not required but has a default value the returned type includes `undefined`.

**To Reproduce**
https://github.com/DesselBane/test-utils-reproduction/blob/master/src/components/foo.spec.ts

**Expected behavior**
I would argue that the type should not include `undefined` since it has a default value and this default value is returned at runtime.

**Related information:**
This happened on an update from v2.4.1 to v2.4.2, most likely somewhere in this PR: https://github.com/vuejs/test-utils/pull/2137 (but I'm not sure)
