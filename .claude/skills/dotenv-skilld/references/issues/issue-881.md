---
number: 881
title: "Setting `quiet: true` is ineffective because other libs use dotenv"
type: other
state: closed
created: 2025-07-04
url: "https://github.com/motdotla/dotenv/issues/881"
reactions: 3
comments: 4
---

# Setting `quiet: true` is ineffective because other libs use dotenv

> Creating a new issue since #876 is locked (very professional of you @motdotla).

It's not possible to disable the new ~dotenvx ad~ very helpful log message when `dotenv` dependency is reused in multiple libraries in the project.

Output of test run with `dotenv.config()` (note the double log):

```
...
 PASS  test/api/health-check.test.ts
  ● Console

    console.log
      [dotenv@17.0.1] injecting env (9) from .env – [tip] encrypt with dotenvx: https://dotenvx.com

      at _log (node_modules/dotenv/lib/main.js:102:11)

    console.log
      [dotenv@17.0.1] injecting env (0) from .env – [tip] encrypt with dotenvx: https://dotenvx.com

      at _log (node_modules/dotenv/lib/main.js:102:11)
          at async Promise.all (index 3)
          at async Promise.all (index 3)


...

---

## Top Comments

**@silverwind** (+2):

> I've already started migrating to util.parseEnv(content) instead

I can dearly recomment `util.parseEnv`, it obsoletes this module. If you can pass flags to your node command, you can also use [`--env-file`](https://nodejs.org/dist/latest/docs/api/cli.html#--env-fileconfig) alternatively.

**@motdotla** [maintainer]:

As mentioned there is `util.parseEnv` available, `-env-file`, other implementations of dotenv, and `quiet: true` 
at your disposal.

For other libraries that are pinning to breaking changes, I don't have control over that and it is generally recommended against - as any breaking changes to dotenv would cause that software to potentially break.

I think all else has been communicated already.

**@sefinek**:

I've already shared my thoughts in #876, so I won't go into detail here.

As the maintainer of a library with such a wide reach, you should be more aware of how your decisions impact the entire ecosystem. This scale comes with a certain level of responsibility and professionalism.

I just want to respond to:
> @motdotla please listen to the community and make quiet the default, the alternative will be people forking the project and just moving on.

...