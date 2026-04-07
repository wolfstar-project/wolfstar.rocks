---
number: 359
title: "feat: Support Tailwind 4 (without @nuxtjs/tailwindcss)"
type: feature
state: closed
created: 2025-04-12
url: "https://github.com/nuxt-modules/og-image/issues/359"
reactions: 7
comments: 5
labels: "[enhancement]"
---

# feat: Support Tailwind 4 (without @nuxtjs/tailwindcss)

###  Your use case

As of right now, there is no`@nuxtjs/tailwindcss` module for Tailwind 4 because Tailwind now has first class Vite support:

nuxt.config.ts:
```
vite: {
    plugins: [tailwindcss()],
  },
css: ['~/assets/css/main.css'],
```

Therefor when using Tailwind 4, the `og-image` module seems to not load the Tailwind config anymore, which actually doesnt exist, instead only a css file is loaded and used for configuration, e.g.:

assets/css/main.css:
```css
@import "tailwindcss";

@theme {
    --font-sans: 'Inter', sans-serif;
    --font-serif: 'Merriweather', sans-serif;
}
```

But how to tell `og-image` to load this css file, too?

###  The solution you'd like

- New prop in nuxt.config to tell to load a css file (that can contain Tailwind config)
- Update docs

###  Alternatives you've considered

_No response_

###  Additional info

It seems like currently og-image is even hardcoded using Tailwind 3 because it is using `@nuxtjs/tailwindcss`, doesnt it? So even tho I have Tailwind 4 installed, og-image is using Tailwind 3?

---

## Top Comments

**@harlan-zw** [maintainer]:

It will require some effort to redo this but it's on my radar.

It mostly comes down to a limitation in how Nuxt does server components and requirements for Satori, for example, we can't directly feed Satori generic tailwind classes, we need to process them to inline styles in most cases. The module uses UnoCSS for this currently (fed with tailwind config).

The solution likely looks like having Nuxt generate a .css file for the server component and extract it into inline styles then we get whatever CSS build tool is in use working out of the box.


**@silverbackdan**:

I have just discovered this limitation as well - my project using Tailwind 4 with the Vite plugin has no crossover with this og-image module. Could we do anything to help in making this a reality?

**@julbd**:

This is a major issue. Does anyone has a workaround before this is fixed ?