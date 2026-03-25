---
number: 9270
title: "vitest 4 - Vue v-model can only be used on input, textarea and select elements with Web Components"
type: bug
state: closed
created: 2025-12-16
url: "https://github.com/vitest-dev/vitest/issues/9270"
reactions: 6
comments: 15
resolvedIn: 4.0.0
labels: "[feat: coverage, p3-minor-bug]"
---

# vitest 4 - Vue v-model can only be used on input, textarea and select elements with Web Components

### Describe the bug

When running Vitest with the --coverage option, a runtime error is thrown when using Vue v-model bindings on Web Components.

Expected behavior:
* Using v-model on Web Components should not throw an error when running tests with coverage enabled.


### Reproduction

This happens in a Vue project configured with the Vite Vue plugin, where custom elements are declared using compilerOptions.isCustomElement.
The issue occurs regardless of the coverage provider:

-  coverage.provider = "istanbul"
-  coverage.provider = "v8"


- vite configuration 
```
vue({
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('ux-'),
    },
  },
})
```

- console error :
```
SyntaxError: v-model can only be used on <input>, <textarea> and <select> elements.
38 |                <ux-XXX
39 |                  v-model="model"
   |                   ^
```

### System Info

...

---

## Top Comments

**@AriPerkkio** [maintainer]:

The file that throws that error is imported by Vitest's coverage as uncovered file, as it matches the `coverage.include`.

I guess Vue plugin or something is throwing that valid looking error? What should Vitest do in that case?

Note that this file is never executed, it's just transformed by Vite. So Vue's Vite plugin or compiler is throwing the error during transform.

You can always work-around by excluding all these erroneous files:

...

**@AriPerkkio** [maintainer]:

> Additionally, this behavior did not exist with Vitest 3: by downgrading the version in the reproduction example, we can confirm that the error disappears.

Sounds like different issue in that case.  

Would be good to try narrowing down the bug in specific Vitest v4 release, for example `4.0.0`, `4.0.0-beta.1`, `4.0.0-beta.2` or even `4.0.0-beta.16`.

**@AriPerkkio** [maintainer]:

So it breaks on `4.0.0-beta.3`? 