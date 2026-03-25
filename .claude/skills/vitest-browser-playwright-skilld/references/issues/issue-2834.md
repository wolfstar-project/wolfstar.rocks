---
number: 2834
title: Tests are failing after updating to Vite 4.1.0
type: other
state: closed
created: 2023-02-08
url: "https://github.com/vitest-dev/vitest/issues/2834"
reactions: 20
comments: 33
labels: "[p2-edge-case]"
---

# Tests are failing after updating to Vite 4.1.0

### Describe the bug

I'm using SvelteKit with Vitest. I updated SvelteKit and Vitest to their latest versions - 1.5.0 and 0.28.4 respectfully. However, updating Vite from 4.0.4 to 4.1.0 caused 15% of my tests to fail (60/400). 

Most of the errors seem unreasonable. For example, removing a DOM element throws a `Failed to execute removeChild on Node` error. Or `Found multiple elements with the text: ...` where there's just a single element containing that exact copy; `Error: Unable to fire a "click" event - please provide a DOM element.`, `Error: unable to find element with text`, etc.

### Reproduction
Here's a simple StackBlitz example. 

1. Open the link
2. Wait for the installation to complete
3. Stop the execution in the terminal (Cmd + C)
4. Run `npm run test`
5. The test fails

<img width="824" alt="image" src="https://user-images.githubusercontent.com/6671521/217523388-75a35dbb-8f2d-4328-aead-c805a4db647d.png">

Then do the following:
1. Open `package.json`
2. Change the version of `vite` from `4.1.0` to `4.0.4`
3. Update the dependencies
4. Open the terminal again and run `npm run test`
5. The test succeeds

<img width="550" alt="image" src="https://user-images.githubusercontent.com/6671521/217523176-788b7da5-ff42-4217-ba3a-4756be1ca59c.png">

### The example explained
It's a simple component with an if statement:

```
<script lang="ts">
  import { onMount } from "svelte"

  let showMessage = false

  onMount(() => {
    showMessage = true
  })
</script>

{#if showMessage}
  <div>Hello</div>
{/if}
```...

---

## Top Comments

**@AriPerkkio** [maintainer] (+7):

Test passes with following:

```diff
<script lang="ts">
-	import { onMount } from "svelte"
+	import { onMount } from "svelte/internal"
```

```
 RERUN  src/lib/Hello.svelte x1

 ✓ src/lib/__test__/Hello.test.ts (1)

 Test Files  1 passed (1)
```

Maybe related to https://github.com/sveltejs/svelte/issues/5534?
I'm not sure why this passes when `vite` version is lowered though. 

**@AriPerkkio** [maintainer] (+4):

Started to rollback local `vite` commit by commit. Test works after reverting https://github.com/vitejs/vite/pull/11595 (:wave: @bluwy).

It seems that entrypoint for Svelte is resolved to `svelte/ssr.mjs` instead of `svelte/index.mjs`. In `vite@4.0.4` the decision was made based on `package.json`'s `module` field but in `vite@4.1.0` it's done based on `exports`.

```
vite@4.0.4:
/Users/x/y/vitest-example-project/node_modules/.pnpm/svelte@3.55.1/node_modules/svelte/index.mjs

vite@4.1.0:
/Users/x/y/vitest-example-project/node_modules/.pnpm/svelte@3.55.1/node_modules/svelte/ssr.mjs
```...

**@TorstenDittmann** (+5):

Just wanna leave a hack here that worked for us, without having to change all the imports.

Create or add this to your test setup file
```js
import * as svelteinternal from 'svelte/internal';
import { vi } from 'vitest';

beforeAll(() => {
    vi.mock('svelte', () => svelteinternal);
});
```