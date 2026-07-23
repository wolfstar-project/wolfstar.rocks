# Introducing Smart Prefetching

> Starting from Nuxt v2.4.0, Nuxt will automagically prefetch the code-splitted pages linked with a nuxt-link when visible in the viewport by default.

## Introducing Smart prefetching 

Starting from Nuxt v2.4.0, Nuxt will automagically prefetch the code-splitted pages linked with `<nuxt-link>` when visible in the viewport **by default**. This hugely improves the end user performances, inspired by quicklink.

![nuxt-prefetch-comparison](/assets/blog/nuxt-prefetch-comparison.gif)

Demos are online and we recommend you to try it out to feel the difference:

- No prefetching (v2.3): https://nuxt-no-prefetch.surge.sh
- With prefetching (v2.4): https://nuxt-prefetch.surge.sh

You can learn more about this feature in the `<nuxt-link>` section of the documentation.
