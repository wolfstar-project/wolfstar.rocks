---
number: 451
title: "fix: Persistent \"Could not load nuxt-seo-utils. Is it installed?\" error"
type: bug
state: closed
created: 2025-06-17
url: "https://github.com/harlan-zw/nuxt-seo/issues/451"
reactions: 3
comments: 9
labels: "[bug]"
---

# fix: Persistent "Could not load nuxt-seo-utils. Is it installed?" error

###  The bug

In the latest versions of @nuxtjs/seo and nuxt-seo-utils, installing it will throw an error for me: `Could not load nuxt-seo-utils. Is it installed?`. It doesn't matter if I try it with nuxi or manual installation, or adding the @nuxtjs/seo module to Nuxt config, or just the nuxt-seo-utils module. No matter what, it says `Could not load nuxt-seo-utils. Is it installed?`

###  To reproduce

Don't have one yet. Will try to reproduce.

###  Expected behavior

Latest `nuxt-seo-utils` is installable

###  Additional context

_No response_

---

## Top Comments

**@harlan-zw** [maintainer]:

If anyone is able to capture the actual exception being thrown, it would be really helpful.

If you search `Is it installed?` in your node_modules you'll find the file in `@nuxt/kit`. Add the log and lmk what it says.

```diff
  } catch (error) {
+    console.log(error)
    const code = error.code;
    if (code === "ERR_PACKAGE_PATH_NOT_EXPORTED" || code === "ERR_UNSUPPORTED_DIR_IMPORT" || code === "ENOTDIR") {
      throw new TypeError(`Could not load \`${nuxtModule}\`. Is it installed?`);
    }
    if (code === "MODULE_NOT_FOUND" || code === "ERR_MODULE_NOT_FOUND") {
      const module = MissingModuleMatcher.exec(error.message)?.[1];
      if (module && !module.includes(nuxtModule)) {
        throw new TypeError(`Error while importing module \`${nuxtModule}\`: ${error}`);
      }
    }
  }
  throw new TypeError(`Could not load \`${nuxtModule}\`. Is it installed?`);
```...

**@harlan-zw** [maintainer]:

The issue is that nuxt-seo-utils does not have an explicit dependency on Unhead v2 (as it's been the default in Nuxt since v3.16), if you're using an older version of Nuxt or you have another dependency pinning Unhead to the v1, then you'd run into this issue.

So the fix is either the above or checking for which dependency is requiring v1 and updating it (I know Nuxt I18n was doing this).

`npm why unhead` -> needs to say v2 for all sub deps

**@FutureExcited** (+1):

Hello, having the same exact issue. installing with npm works, but with bun it doesn't.

Here's the logs:

...