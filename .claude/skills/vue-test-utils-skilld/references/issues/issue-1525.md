---
number: 1525
title: "Bug: ReferenceError: Vue is not defined for v2.0.0"
type: bug
state: closed
created: 2022-05-22
url: "https://github.com/vuejs/test-utils/issues/1525"
reactions: 7
comments: 13
labels: "[bug]"
---

# Bug: ReferenceError: Vue is not defined for v2.0.0




**Describe the bug**

In the latest version (v2.0.0), the introduction of `@vue/test-utils` will result in an error.

Minimal reproduction: https://github.com/pdsuwwz/vue-unit/pull/17/files

Related action: https://github.com/pdsuwwz/vue-unit/runs/6535330150?check_suite_focus=true

<img width="605" alt="image" src="https://user-images.githubusercontent.com/19891724/169705791-fdd51bee-89d4-4390-83dc-2dc64c10701f.png">


<img width="714" alt="image" src="https://user-images.githubusercontent.com/19891724/169705403-77d550ce-fa65-49b9-8b27-9ecf6f39a8fd.png">

<img width="1157" alt="image" src="https://user-images.githubusercontent.com/19891724/169705678-e8da08e4-8fe4-440d-a4bb-e4e6f762f56c.png">


**To Reproduce**


Upgrade the version of `@vue/test-utils` from `v2.0.0-rc.21` to `v2.0.0`
https://www.npmjs.com/package/@vue/test-utils/v/2.0.0

**Expected behavior**

Unit test passed.

**Related information:**
- `@vue/test-utils` version: v2.0.0
- `Vue` version: v3.2.35
- `node` version: v14.19.2
- `npm` (or `yarn`) version: v6.14.17

**Additional contex...

---

## Top Comments

**@freakzlike** [maintainer] (+4):

Now I faced the same issue in some of my projects which are using jest v28 with `jsdom`.
The solution from https://github.com/vuejs/test-utils/issues/234#issuecomment-1133672109 worked for me 
```
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [
      'node',
      'node-addons'
    ]
  },
```

When I manually remove the changes of #1484 from the `package.json` then it is working without `testEnvironmentOptions`. I'm not sure what is actually the correct way to fix this.

**@lmiller1990** [maintainer]:

Just normally runs in a Node.js environment (using CommonJS modules) so it should be using the `require` field. I am not sure why it's using the browser field, that's definitely incorrect, but I do not think this is an issue in Test Utils - we specify for `require` to use the `cjs` build:

https://github.com/vuejs/test-utils/blob/main/package.json#L14-L15

I don't think `browser` is an official one, it's not documented: https://nodejs.org/api/packages.html#subpath-exports. I think it's just a kind of pseudo standard, implemented by various tools. I'm not sure why it's getting consumed in y...

**@wxsms** [maintainer]:

same issue here