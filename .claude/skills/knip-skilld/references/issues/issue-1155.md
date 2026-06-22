---
number: 1155
title: Exports plugin shows false positive if exports are only used by dynamic imports
type: bug
state: closed
created: 2025-06-27
url: "https://github.com/webpro-nl/knip/issues/1155"
reactions: 3
comments: 6
resolvedIn: 5.64.0
labels: "[bug]"
---

# Exports plugin shows false positive if exports are only used by dynamic imports

### Prerequisites

- [x] I'm using the latest version
- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've checked the list of known issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://codesandbox.io/p/devbox/lucid-wildflower-fqgds3?workspaceId=ws_7qhyiyp3r7j2XayJK1C2jx

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Description of the issue

If you only use an export with dynamic imports, the exports plugin wrongly marks the export as unused.

See reproducer for details. Example:

```
// index.ts
async function useModuleConst() {
  const module = await import("./module");
  console.log(module.FOO);
}

useModuleConst().then(() => console.log("complete"));

// module.ts
export const FOO = "bar";

...

---

## Top Comments

**@webpro** [maintainer]:

This is expected behavior when using ESM: `module.ts` does not have a default export, but a named export `FOO`. Import like so:

```ts
const { FOO } = await import("./module");
```

It might end up working in your situation because it's compiled/bundled away.

**@webpro** [maintainer] (+1):

The previous "standard" CommonJS allowed this. There's a whole section here about the topic: https://knip.dev/guides/working-with-commonjs. Bundlers are generally more forgiving when "mixing syntax", but what you're showing me is ESM and Knip detects the issue.

**@webpro** [maintainer] (+1):

@fregante is entirely correct here, things should be patched up a bit now