---
number: 459
title: "fix: Nuxt 4 - Image source is not provided."
type: bug
state: closed
created: 2025-07-17
url: "https://github.com/harlan-zw/nuxt-seo/issues/459"
reactions: 2
comments: 6
labels: "[bug]"
---

# fix: Nuxt 4 - Image source is not provided.

###  The bug

After upgrading to Nuxt 4 and adopting the new `app` directory structure, the OG image generation stopped working.

I now get the following error when trying to render the image:
`SatoriError: Image source is not provided.`

<img width="2876" height="1838" alt="Image" src="https://github.com/user-attachments/assets/b15d801f-373f-448d-8f5d-e5b62b5045d6" />

###  To reproduce

https://github.com/mtzrmzia/alfredom.dev

###  Expected behavior

The OG image should render correctly like it did before the upgrade.
It seems the image path is either not being resolved properly or the rendering engine is not picking up the image component as expected.

###  Additional context

...

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

Hm I think if you use the app dir you should add public dir to `app`, that's what i have tests covering and root public dir doesn't seem to work.

**@mjlehrke** (+2):

> Hm I think if you use the app dir you should add public dir to `app`, that's what i have tests covering and root public dir doesn't seem to work.

Doesn't that go against Nuxt 4 keeping the public directory at the root? Seems confusing to have both a root level public directory and an app/public/ directory. 

https://nuxt.com/docs/4.x/guide/directory-structure/public

**@ralacerda**:

I had a similar problem after updating to Nuxt 4. In my case, it was an issue with peer dependencies. I fixed it by deleting the `node_moduels` and running `pnpm i` again.