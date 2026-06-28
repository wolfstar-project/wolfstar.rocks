# A New Website

> We are thrilled to release the new nuxt.com, powered by Nuxt UI and now open source.

Nuxt.com is the main entry point when you want to learn Nuxt. With **more than 300k visitors every month**, it was time to give it a new look and feel.

## New Design

We are back to the original colors of Nuxt, with a navy background (`#020420`) and its signature shiny green (`#00DC82`).

<nuxt-img alt="Nuxt Website Screenshot" className="rounded-lg,border,border-gray-700" height="497" src="/assets/blog/website/nuxt-website.png" width="832">



</nuxt-img>

<read-more to="/design-kit" icon="i-lucide-palette">

Discover the **Nuxt Design Kit** as well as our **Logo History**.

</read-more>

We wanted to achieve a consistent design across all our official documentations:

<div className="grid,sm:grid-cols-2,gap-4">
<nuxt-link className="hover:border-transparent" target="_blank" to="https://image.nuxt.com">
<nuxt-img alt="Nuxt Image" className="m-0,border,rounded-md,border-gray-700" height="255" src="/assets/blog/website/nuxt-image.png" width="408">



</nuxt-img>
</nuxt-link>

<nuxt-link className="hover:border-transparent" target="_blank" to="https://content.nuxt.com">
<nuxt-img alt="Nuxt Content" className="m-0,border,rounded-md,border-gray-700" height="255" src="/assets/blog/website/nuxt-content.png" width="408">



</nuxt-img>
</nuxt-link>

<nuxt-link className="hover:border-transparent" target="_blank" to="https://devtools.nuxt.com">
<nuxt-img alt="Nuxt DevTools" className="m-0,border,rounded-md,border-gray-700" height="255" src="/assets/blog/website/nuxt-devtools.png" width="408">



</nuxt-img>
</nuxt-link>

<nuxt-link className="hover:border-transparent" target="_blank" to="https://ui.nuxt.com">
<nuxt-img alt="Nuxt UI" className="m-0,border,rounded-md,border-gray-700" height="255" src="/assets/blog/website/nuxt-ui.png" width="408">



</nuxt-img>
</nuxt-link>
</div>

We really love this new design and hope you do too. **This is only the first step toward many improvements coming to the website.**

## Improved Navigation

From now on, you can easily jump between the five main documentation categories:

<video :controls="true" className="rounded,dark:border,dark:border-gray-700" poster="https://res.cloudinary.com/nuxt/video/upload/v1697548111/nuxt3/nuxt-website-docs-nav.jpg">
<source src="https://res.cloudinary.com/nuxt/video/upload/v1697548111/nuxt3/nuxt-website-docs-nav.webm" type="video/webm" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697548111/nuxt3/nuxt-website-docs-nav.mp4" type="video/mp4" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697548111/nuxt3/nuxt-website-docs-nav.ogg" type="video/ogg" />
</video>

On the right side, you can see the table of contents as well as community shortcuts: Edit this page, Chat on Discord, etc.

<video :controls="true" className="rounded,dark:border,dark:border-gray-700" poster="https://res.cloudinary.com/nuxt/video/upload/v1697549697/nuxt3/nuxt-website-docs-aside.jpg">
<source src="https://res.cloudinary.com/nuxt/video/upload/v1697549697/nuxt3/nuxt-website-docs-aside.webm" type="video/webm" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697549697/nuxt3/nuxt-website-docs-aside.mp4" type="video/mp4" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697549697/nuxt3/nuxt-website-docs-aside.ogg" type="video/ogg" />
</video>

## Source Code Buttons

When looking at Nuxt built-in [components](/docs/api/components), [composables](/docs/api/composables), [utils](/docs/api/utils), [commands](/docs/api/commands) and [kit utilities](/docs/api/kit), you can now jump to the source code by clicking on the <u-button color="gray" icon="i-simple-icons-github" size="xs">

Source

</u-button>

 button.

<nuxt-img alt="Nuxt Source Code Button" className="border,rounded,border-gray-700" height="343" src="/assets/blog/website/nuxt-website-source-button.png" width="818">



</nuxt-img>

<read-more to="/docs/api/components/nuxt-link">

Checkout an example on `<NuxtLink>` documentation page.

</read-more>

## Improved Search Feature

You may notice a new modal when hitting <kbd value="meta">



</kbd>

 <kbd value="K">



</kbd>

. We leverage the Nuxt UI `<CommandPalette>` components combined with Nuxt Content data (search & navigation) to provide a better search experience.

With the command palette, you can:

- Jump to a page
- Search in the documentation
- Search a module
- Switch the color mode

We plan to add more commands soon.

<video :controls="true" className="rounded,dark:border,dark:border-gray-700" poster="https://res.cloudinary.com/nuxt/video/upload/v1697550571/nuxt3/nuxt-website-search.jpg">
<source src="https://res.cloudinary.com/nuxt/video/upload/v1697550571/nuxt3/nuxt-website-search.webm" type="video/webm" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697550571/nuxt3/nuxt-website-search.mp4" type="video/mp4" />

<source src="https://res.cloudinary.com/nuxt/video/upload/v1697550571/nuxt3/nuxt-website-search.ogg" type="video/ogg" />
</video>

## Migration to Nuxt UI

The new website is powered by Nuxt UI, our UI library tailored made for Nuxt and built on top of Tailwind CSS & Headless UI.

The website also uses Nuxt UI Pro, a set of premium components built on top of Nuxt UI to create beautiful & responsive Nuxt applications in minutes.

It includes components such as `<UHeader>`, `<UFooter>`, `<ULandingHero>`, `<ULandingCard>` and more.

<note>

We plan to launch the full documentation of Nuxt UI Pro at the end of October. If you cannot wait and want early access, you can already purchase a license now and get access to our private repository on GitHub.

</note>

This migration was a great opportunity to improve Nuxt UI & UI Pro and fix some bugs, as well as a difference of <span className="text-primary">

+9,004

</span>

 / <span className="text-error">

-23,113

</span>

 lines of code changed.

<read-more to="https://ui.nuxt.com" icon="i-simple-icons-nuxtdotjs" target="_blank">

Read more about **Nuxt UI**.

</read-more>

## Open Graph Images

We are big fans of having a custom image when we share a link on social media. That's why we have added OG images on all our documentation pages.

Example of the [Installation page](/docs/getting-started/installation):

![Nuxt OG Image](/__og-image__/image/docs/getting-started/introduction/og.png)<read-more to="https://nuxtseo.com/og-image/getting-started/installation" target="_blank">

Discover the **Nuxt OG Image** module.

</read-more>

## Available on GitHub

We are proud to announce that the website is **now open source** and available on GitHub.

<read-more to="https://github.com/nuxt/nuxt.com" icon="i-simple-icons-github" target="_blank" color="gray">

Check out `nuxt/nuxt.com` on GitHub.

</read-more>

## What's next?

This new website is the beginning of upcoming changes we are planing, some of them are:

- Team & Contributors pages
- Integrations page to showcase all the possibilities with Nuxt: Hosting, CMS, Database, etc.
- Templates page (currently nuxt.new) to list official and community starters
- And more...

**We are looking forward to your feedback on Twitter, Discord or GitHub**.

Thank you for reading this blog post, and happy Nuxting 
