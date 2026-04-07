---
number: 434
title: "fix: og-image template that contains images fails in Cloudflare Workers"
type: bug
state: closed
created: 2026-01-19
url: "https://github.com/nuxt-modules/og-image/issues/434"
reactions: 4
comments: 4
labels: "[bug]"
---

# fix: og-image template that contains images fails in Cloudflare Workers

###  The bug

When I run the dev server locally, it renders the .PNG perfectly.
When I deploy to Cloudflare Workers, I get a 500 error when I try to access the og:image:
```
(warn) failed to asynchronously prepare wasm: CompileError: WebAssembly.instantiate(): Wasm code generation disallowed by embedder
(warn) Aborted(CompileError: WebAssembly.instantiate(): Wasm code generation disallowed by embedder)
```

###  To reproduce

https://stackblitz.com/edit/nuxt-starter-ywdhc6ex?file=components%2FOgImage%2FMyTemplate.vue

###  Expected behavior

I would expect the PNG to render on Cloudflare Workers as well as it does on my local dev server.

###  Additional context

_No response_

---

## Top Comments

**@harlan-zw** [maintainer]:

There are improvements around this in v6. If you can reproduce still, then I'll jump on this.

**@nathanchase**:

For you and others, I brute-forced a Nitro server route that essentially does the same thing (uses a template and renders out a PNG) and works fully in Cloudflare Workers:

...

**@MickL**:

Is this realistic to load a PNG from external URL without the use of a provider and Nuxt Img? If your image is hosted on Cloudflare Images you would use Nuxt Img with Cloudflare provider and this should have no issues. Or you load the wikipedia png with through Cloudflare Images Transformations... 