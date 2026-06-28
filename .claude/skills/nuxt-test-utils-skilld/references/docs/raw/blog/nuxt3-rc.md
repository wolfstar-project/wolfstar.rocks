# Announcing Nuxt 3 Release Candidate

> Nuxt 3 beta was announced on October 12, 2021 after 16 months of work, introducing a new foundation based on Vue 3, Vite and Nitro. Six months later, we are happy to announce the first release candidate of Nuxt 3, code named “Mount Hope“ 

We are excited to open source Nuxt 3 after more than a year of intense development. The repository is available on GitHub on nuxt/nuxt under the MIT license.

<tip>

The documentation is available on https://nuxt.com.

</tip>

## A new foundation

On top of supporting Vue 3 or Vite, Nuxt 3 contains a new server engine, unlocking new full-stack capabilities to Nuxt server and beyond. It's the first JavaScript application server that is portable across a variety of modern cloud hosting providers.

In production, it builds your Vue application and server into one universal `.output` directory. This output is light: minified and without any other Node.js dependencies (except polyfills). You can deploy this output on any system supporting JavaScript, whether Node.js, Serverless, Workers, Edge-side rendering or purely static.

**Bonus:** this server engine can be used on existing Nuxt 2 projects with Nuxt Bridge 

Head over the Nuxt 3 homepage to learn more about Nuxt Nitro and Nuxt Bridge.

## Important notes

Nuxt 3 is currently in beta, so expect things to break (and be fixed quickly). We have plenty of work left but we want to open it publicly to gather feedback and contributions from the community 

**Do not use it for production until we reach the first release candidate.**

During the beta, almost every commit will trigger a new npm release; you may want to look at the merged pull requests until we begin generating automated changelogs in the documentation.

We are working every day to improve the documentation, explaining as much as possible all the concepts, features and usage of Nuxt 3.

Check out the community section of the Nuxt 3 website for getting help, reporting bugs or contributing to the framework.

## Timeline

Here some major milestones we've achieved on the way to Nuxt 3:

- **Jul 2, 2020**: Nuxt 3 first commit with full TypeScript rewrite
- **Aug 7, 2020**: Webpack 5 support
- **Sep 15, 2020**: `pages/` support
- **Oct 29, 2020**: Vue 3 support with bundle-renderer
- **Nov 2, 2020**: Nuxt Nitro initial work
- **Jan 22, 2021**: Initial Vite support
- **Feb 4, 2021**: Nuxt can deploy on major serverless platforms
- **Mar 6, 2021**: UnJS organisation created on GitHub
- **Mar 28, 2021**: Init Nuxt Kit and Nuxt CLI (nuxi)
- **May 20, 2021**: `app.vue` support (`pages/` becomes optional)
- **Jun 30, 2021**: `layouts/` support
- **Jul 15, 2021**: Native ESM support
- **Aug 10, 2021**: Auto import of composables and components
- **Sep 5, 2021**: Init Nuxt Bridge for improving Nuxt 2 experience
- **Sep 7, 2021**: Support Vite build for production
- **Oct 11, 2021**: Add `useState` and `useFetch` composables

So far, we've merged 385 pull requests, closed 229 issues and made 925+ commits.

We are excited to hear your thoughts and we thank you for your patience.

Now you can go over the Nuxt 3 documentation 

Don't forget to follow us on Twitter to get the latest news about Nuxt!
