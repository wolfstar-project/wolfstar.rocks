---
total: 229
---

# Docs Index

- [Nuxt Docs](./README.md): This repository contains the documentation of Nuxt, hosted on https://nuxt.com/docs/4.x/getting-started/introduction

## 1.getting-started (18)

- [Introduction](./1.getting-started/01.introduction.md): Nuxt is a free and open-source framework with an intuitive and extendable way to create type-safe, performant and production-grade full-stack web a...
- [Installation](./1.getting-started/02.installation.md): If you just want to play around with Nuxt in your browser without setting up a project, you can use this online sandbox:
- [Configuration](./1.getting-started/03.configuration.md): By default, Nuxt is configured to cover most use cases. The nuxt.config.ts file can override or extend this default configuration.
- [Views](./1.getting-started/04.views.md): The app.vue file is the entry point of your application
- [Assets](./1.getting-started/05.assets.md): Nuxt uses two directories to handle assets like stylesheets, fonts or images.
- [Styling](./1.getting-started/06.styling.md): Nuxt is highly flexible when it comes to styling. Write your own styles, or reference local and external stylesheets.
You can use CSS preprocessors...
- [Routing](./1.getting-started/07.routing.md): One core feature of Nuxt is the file system router. Every Vue file inside the app/pages/ directory creates a corresponding URL (or route) that disp...
- [SEO and Meta](./1.getting-started/08.seo-meta.md): Nuxt head tag management is powered by Unhead. It provides sensible defaults, several powerful composables
and numerous configuration options to ma...
- [Transitions](./1.getting-started/09.transitions.md): ::note
Nuxt leverages Vue's <Transition> component to apply transitions between pages and layouts.
::
- [Data Fetching](./1.getting-started/10.data-fetching.md): Nuxt comes with two composables and a built-in library to perform data-fetching in browser or server environments: useFetch, useAsyncData and $fetch.
- [State Management](./1.getting-started/11.state-management.md): Nuxt provides the useState composable to create a reactive and SSR-friendly shared state across components.
- [Error Handling](./1.getting-started/12.error-handling.md): Nuxt is a full-stack framework, which means there are several sources of unpreventable user runtime errors that can happen in different contexts:
- [Server](./1.getting-started/13.server.md): :read-more{to="/docs/4.x/directory-structure/server"}
- [Layers](./1.getting-started/14.layers.md): One of the core features of Nuxt is the layers and extending support. You can extend a default Nuxt application to reuse components, utils, and con...
- [Prerendering](./1.getting-started/15.prerendering.md): Nuxt allows for select pages from your application to be rendered at build time. Nuxt will serve the prebuilt pages when requested instead of gener...
- [Deployment](./1.getting-started/16.deployment.md): A Nuxt application can be deployed on a Node.js server, pre-rendered for static hosting, or deployed to serverless or edge (CDN) environments.
- [Testing](./1.getting-started/17.testing.md): ::tip
If you are a module author, you can find more specific information in the Module Author's guide.
::
- [Upgrade Guide](./1.getting-started/18.upgrade.md): To upgrade Nuxt to the latest release, use the nuxt upgrade command.

## 2.directory-structure (17)

- [.nuxt](./2.directory-structure/0.nuxt.md): ::important
This directory should be added to your .gitignore file to avoid pushing the dev build output to your repository.
::
- [.output](./2.directory-structure/0.output.md): ::important
This directory should be added to your .gitignore file to avoid pushing the build output to your repository.
::
- [content](./2.directory-structure/1.content.md): Nuxt Content reads the content/ directory in your project and parses .md, .yml, .csv and .json files to create a file-based CMS for your application.
- [layers](./2.directory-structure/1.layers.md): The layers/ directory allows you to organize and share reusable code, components, composables, and configurations across your Nuxt application. Any...
- [modules](./2.directory-structure/1.modules.md): It is a good place to place any local modules you develop while building your application.
- [node_modules](./2.directory-structure/1.node_modules.md): The package manager (npm or yarn or pnpm or bun or deno) creates this directory to store the dependencies of your project.
- [public](./2.directory-structure/1.public.md): Files contained within the public/ directory are served at the root and are not modified by the build process. This is suitable for files that have...
- [server](./2.directory-structure/1.server.md): Nuxt automatically scans files inside these directories to register API and server handlers with Hot Module Replacement (HMR) support.
- [shared](./2.directory-structure/1.shared.md): The shared/ directory allows you to share code that can be used in both the Vue app and the Nitro server.
- [.env](./2.directory-structure/2.env.md): ::important
This file should be added to your .gitignore file to avoid pushing secrets to your repository.
::
- [.gitignore](./2.directory-structure/2.gitignore.md): A .gitignore file specifies intentionally untracked files that git should ignore.
- [.nuxtignore](./2.directory-structure/2.nuxtignore.md): The .nuxtignore file tells Nuxt to ignore files in your project’s root directory (rootDir) during the build phase.
- [.nuxtrc](./2.directory-structure/2.nuxtrc.md): The .nuxtrc file can be used to configure Nuxt with a flat syntax. It is based on unjs/rc9.
- [nuxt.config.ts](./2.directory-structure/3.nuxt-config.md): The nuxt.config file extension can either be .js, .ts or .mjs.
- [package.json](./2.directory-structure/3.package.md): The minimal package.json of your Nuxt application should looks like:
- [tsconfig.json](./2.directory-structure/3.tsconfig.md): Nuxt automatically generates multiple TypeScript configuration files (.nuxt/tsconfig.app.json, .nuxt/tsconfig.server.json, .nuxt/tsconfig.node.json...
- [Nuxt Directory Structure](./2.directory-structure/index.md): Nuxt applications have a specific directory structure that is used to organize the code. This structure is designed to be easy to understand and to...

## 2.directory-structure/1.app (11)

- [assets](./2.directory-structure/1.app/1.assets.md): The directory usually contains the following types of files:
- [components](./2.directory-structure/1.app/1.components.md): Nuxt automatically imports any components in this directory (along with components that are registered by any modules you may be using).
- [composables](./2.directory-structure/1.app/1.composables.md): Method 1: Using named export
- [layouts](./2.directory-structure/1.app/1.layouts.md): ::tip{icon="i-lucide-rocket" }
For best performance, components placed in this directory will be automatically loaded via asynchronous import when ...
- [middleware](./2.directory-structure/1.app/1.middleware.md): Nuxt provides a customizable route middleware framework you can use throughout your application, ideal for extracting code that you want to run bef...
- [pages](./2.directory-structure/1.app/1.pages.md): ::note
To reduce your application's bundle size, this directory is optional, meaning that vue-router won't be included if you only use app.vue. To ...
- [plugins](./2.directory-structure/1.app/1.plugins.md): Nuxt automatically reads the files in the app/plugins/ directory and loads them at the creation of the Vue application.
- [utils](./2.directory-structure/1.app/1.utils.md): The main purpose of the app/utils/ directory is to allow a semantic distinction between your Vue composables and other auto-imported utility functi...
- [app.config.ts](./2.directory-structure/1.app/3.app-config.md): Nuxt provides an app/app.config.ts config file to expose reactive configuration within your application with the ability to update it at runtime wi...
- [app.vue](./2.directory-structure/1.app/3.app.md): ::tip
If you have a app/pages/ directory, the app.vue file is optional. Nuxt will automatically include a default app.vue, but you can still add yo...
- [error.vue](./2.directory-structure/1.app/3.error.md): During the lifespan of your application, some errors may appear unexpectedly at runtime. In such case, we can use the error.vue file to override th...

## 3.guide (1)

- [Nuxt Guide](./3.guide/0.index.md): ::card-group{class="sm:grid-cols-1"}
::card{icon="i-lucide-medal" title="Key Concepts" to="/docs/4.x/guide/concepts"}
Discover the main concepts be...

## 3.guide/1.concepts (9)

- [Rendering Modes](./3.guide/1.concepts/1.rendering.md): Nuxt supports different rendering modes, universal rendering, client-side rendering but also offers hybrid-rendering and the possibility to render ...
- [Vue.js Development](./3.guide/1.concepts/10.vuejs-development.md): Nuxt integrates Vue 3, the new major release of Vue that enables new patterns for Nuxt users.
- [Nuxt Lifecycle](./3.guide/1.concepts/2.nuxt-lifecycle.md): The goal of this chapter is to provide a high-level overview of the different parts of the framework, their execution order, and how they work toge...
- [Auto-imports](./3.guide/1.concepts/3.auto-imports.md): Nuxt auto-imports components, composables and Vue.js APIs to use across your application without explicitly importing them.
- [Server Engine](./3.guide/1.concepts/4.server-engine.md): While building Nuxt, we created a new server engine: Nitro.
- [Modules](./3.guide/1.concepts/5.modules.md): When developing production-grade applications with Nuxt you might find that the framework's core functionality is not enough. Nuxt can be extended ...
- [ES Modules](./3.guide/1.concepts/7.esm.md): This guide helps explain what ES Modules are and how to make a Nuxt app (or upstream library) compatible with ESM.
- [TypeScript](./3.guide/1.concepts/8.typescript.md): By default, Nuxt doesn't check types when you run nuxt dev or nuxt build, for performance reasons.
- [Code Style](./3.guide/1.concepts/9.code-style.md): The recommended approach for Nuxt is to enable ESLint support using the @nuxt/eslint module, that will setup project-aware ESLint configuration for...

## 3.guide/2.best-practices (3)

- [Nuxt and Hydration](./3.guide/2.best-practices/hydration.md): When developing, you may face hydration issues. Don't ignore those warnings.
- [Nuxt performance](./3.guide/2.best-practices/performance.md): Nuxt comes with built-in features designed to improve your application's performance and contribute to better Core Web Vitals. There are also multi...
- [Nuxt Plugins](./3.guide/2.best-practices/plugins.md): Plugins in Nuxt allow you to extend your application with additional functionality. However, improper use can lead to performance bottlenecks. This...

## 3.guide/3.ai (2)

- [Nuxt MCP Server](./3.guide/3.ai/1.mcp.md): MCP (Model Context Protocol) is a standardized protocol that enables AI assistants to access external data sources and tools. Nuxt provides an MCP ...
- [Nuxt LLMs.txt](./3.guide/3.ai/2.llms-txt.md): LLMs.txt is a structured documentation format specifically designed for large language models (LLMs). Nuxt provides LLMs.txt files that contain com...

## 3.guide/4.modules (9)

- [Create Your First Module](./3.guide/4.modules/1.getting-started.md): We recommend you get started with Nuxt modules using our starter template:
- [Understand Module Structure](./3.guide/4.modules/2.module-anatomy.md): There are two types of Nuxt modules:
- [Add Plugins, Components & More](./3.guide/4.modules/3.recipes-basics.md): Here are some common patterns used by module authors.
- [Module Dependencies](./3.guide/4.modules/4.module-dependencies.md): If your module depends on other modules, you can declare them using the moduleDependencies option. Nuxt then ensures those modules are installed in...
- [Use Hooks & Extend Types](./3.guide/4.modules/5.recipes-advanced.md): Here are some advanced patterns for authoring modules, including hooks, templates, and type augmentation.
- [Test Your Module](./3.guide/4.modules/6.testing.md): Testing helps ensure your module works as expected given various setups. Find in this section how to perform various kinds of tests against your mo...
- [Follow Best Practices](./3.guide/4.modules/7.best-practices.md): With great power comes great responsibility. While modules are powerful, here are some best practices to keep in mind while authoring modules to ke...
- [Publish & Share Your Module](./3.guide/4.modules/8.ecosystem.md): The Nuxt module ecosystem represents more than 35 million monthly NPM downloads and provides extended functionalities and integrations with all sor...
- [Module Author Guide](./3.guide/4.modules/index.md): Nuxt's configuration and hooks systems make it possible to customize every aspect of Nuxt and add any integration you might need (Vue plugins, CMS,...

## 3.guide/5.recipes (4)

- [Custom Routing](./3.guide/5.recipes/1.custom-routing.md): In Nuxt, your routing is defined by the structure of your files inside the app/pages directory. However, since it uses vue-router under the hood, N...
- [Using Vite Plugins in Nuxt](./3.guide/5.recipes/2.vite-plugin.md): While Nuxt modules offer extensive functionality, sometimes a specific Vite plugin might meet your needs more directly.
- [Custom useFetch in Nuxt](./3.guide/5.recipes/3.custom-usefetch.md): When working with Nuxt, you might be making the frontend and fetching an external API, and you might want to set some default options for fetching ...
- [Sessions and Authentication](./3.guide/5.recipes/4.sessions-and-authentication.md): In this recipe we'll be setting up authentication in a full-stack Nuxt app using Nuxt Auth Utils which provides convenient utilities for managing c...

## 3.guide/6.going-further (12)

- [Creating Custom Events](./3.guide/6.going-further/1.events.md): Using events is a great way to decouple your application and allow for more flexible and modular communication between different parts of your code...
- [Experimental Features](./3.guide/6.going-further/1.experimental-features.md): Nuxt includes experimental features that you can enable in your configuration file.
- [Features](./3.guide/6.going-further/1.features.md): Some features of Nuxt are available on an opt-in basis, or can be disabled based on your needs.
- [How Nuxt Works?](./3.guide/6.going-further/1.internals.md): This guide helps you better understand Nuxt internals to develop new solutions and module integrations on top of Nuxt.
- [Runtime Config](./3.guide/6.going-further/10.runtime-config.md): To expose config and environment variables to the rest of your app, you will need to define runtime configuration in your nuxt.config file, using t...
- [Nightly Release Channel](./3.guide/6.going-further/11.nightly-release-channel.md): Nuxt lands commits, improvements, and bug fixes every day. You can opt in to test them earlier before the next release.
- [Lifecycle Hooks](./3.guide/6.going-further/2.hooks.md): ::tip
The hooking system is powered by unjs/hookable.
::
- [Nuxt Kit](./3.guide/6.going-further/4.kit.md): Nuxt Kit provides composable utilities to make interacting with Nuxt Hooks, the Nuxt Interface and developing Nuxt modules super easy.
- [NuxtApp](./3.guide/6.going-further/6.nuxt-app.md): In Nuxt, you can access runtime app context within composables, components and plugins.
- [Authoring Nuxt Layers](./3.guide/6.going-further/7.layers.md): Nuxt layers are a powerful feature that you can use to share and reuse partial Nuxt applications within a monorepo, or from a git repository or npm...
- [Debugging](./3.guide/6.going-further/9.debugging.md): Sourcemaps are enabled for your server build by default, and for the client build in dev mode, but you can enable them more specifically in your co...
- [index](./3.guide/6.going-further/index.md)

## 4.api/1.components (16)

- [<ClientOnly>](./4.api/1.components/1.client-only.md): The <ClientOnly> component is used for purposely rendering a component only on client side.
- [<DevOnly>](./4.api/1.components/1.dev-only.md): Nuxt provides the <DevOnly> component to render a component only during development.
- [<NuxtClientFallback>](./4.api/1.components/1.nuxt-client-fallback.md): Nuxt provides the <NuxtClientFallback> component to render its content on the client if any of its children trigger an error in SSR.
- [<NuxtPicture>](./4.api/1.components/10.nuxt-picture.md): <NuxtPicture> is a drop-in replacement for the native <picture> tag.
- [<Teleport>](./4.api/1.components/11.teleports.md): ::warning
The to target of <Teleport> expects a CSS selector string or an actual DOM node. Nuxt currently has SSR support for teleports to #telepor...
- [<NuxtRouteAnnouncer>](./4.api/1.components/12.nuxt-route-announcer.md): ::important
This component is available in Nuxt v3.12+.
::
- [<NuxtTime>](./4.api/1.components/13.nuxt-time.md): ::important
This component is available in Nuxt v3.17+.
::
- [<NuxtAnnouncer>](./4.api/1.components/14.nuxt-announcer.md): ::important
This component is available in Nuxt v4.4.2+.
::
- [<NuxtPage>](./4.api/1.components/2.nuxt-page.md): <NuxtPage> is a built-in component that comes with Nuxt. It lets you display top-level or nested pages located in the app/pages/ directory.
- [<NuxtLayout>](./4.api/1.components/3.nuxt-layout.md): You can use <NuxtLayout /> component to activate the default layout on app.vue or error.vue.
- [<NuxtLink>](./4.api/1.components/4.nuxt-link.md): ::note
<NuxtLink> is a drop-in replacement for both Vue Router's <RouterLink> component and HTML's <a> tag. It intelligently determines whether the...
- [<NuxtLoadingIndicator>](./4.api/1.components/5.nuxt-loading-indicator.md): Add <NuxtLoadingIndicator/> in your app.vue or app/layouts/.
- [<NuxtErrorBoundary>](./4.api/1.components/6.nuxt-error-boundary.md): ::tip
The <NuxtErrorBoundary> uses Vue's onErrorCaptured hook under the hood.
::
- [<NuxtWelcome>](./4.api/1.components/7.nuxt-welcome.md): It includes links to the Nuxt documentation, source code, and social media accounts.
- [<NuxtIsland>](./4.api/1.components/8.nuxt-island.md): When rendering an island component, the content of the island component is static, thus no JS is downloaded client-side.
- [<NuxtImg>](./4.api/1.components/9.nuxt-img.md): <NuxtImg> is a drop-in replacement for the native <img> tag.

## 4.api/2.composables (32)

- [createUseAsyncData](./4.api/2.composables/create-use-async-data.md): createUseAsyncData creates a custom useAsyncData composable with pre-defined options. The resulting composable is fully typed and works exactly lik...
- [createUseFetch](./4.api/2.composables/create-use-fetch.md): createUseFetch creates a custom useFetch composable with pre-defined options. The resulting composable is fully typed and works exactly like useFet...
- [onPrehydrate](./4.api/2.composables/on-prehydrate.md): ::important
This composable is available in Nuxt v3.12+.
::
- [useAnnouncer](./4.api/2.composables/use-announcer.md): ::important
This composable is available in Nuxt v4.4.2+.
::
- [useAppConfig](./4.api/2.composables/use-app-config.md): :read-more{to="/docs/4.x/directory-structure/app/app-config"}
- [useAsyncData](./4.api/2.composables/use-async-data.md): Within your pages, components, and plugins you can use useAsyncData to get access to data that resolves asynchronously.
- [useCookie](./4.api/2.composables/use-cookie.md): Within your pages, components, and plugins, you can use useCookie to read and write cookies in an SSR-friendly way.
- [useError](./4.api/2.composables/use-error.md): The useError composable returns the global Nuxt error that is being handled and is available on both client and server. It provides a reactive, SSR...
- [useFetch](./4.api/2.composables/use-fetch.md): This composable provides a convenient wrapper around useAsyncData and $fetch.
It automatically generates a key based on URL and fetch options, prov...
- [useHeadSafe](./4.api/2.composables/use-head-safe.md): The useHeadSafe composable is a wrapper around the useHead composable that restricts the input to only allow safe values. This is the recommended w...
- [useHead](./4.api/2.composables/use-head.md): The useHead composable allows you to manage your head tags in a programmatic and reactive way, powered by Unhead. It lets you customize the meta ta...
- [useHydration](./4.api/2.composables/use-hydration.md): useHydration is a built-in composable that provides a way to set data on the server side every time a new HTTP request is made and receive that dat...
- [useLazyAsyncData](./4.api/2.composables/use-lazy-async-data.md): useLazyAsyncData provides a wrapper around useAsyncData that triggers navigation before the handler is resolved by setting the lazy option to true.
- [useLazyFetch](./4.api/2.composables/use-lazy-fetch.md): useLazyFetch provides a wrapper around useFetch that triggers navigation before the handler is resolved by setting the lazy option to true.
- [useLoadingIndicator](./4.api/2.composables/use-loading-indicator.md): A composable which returns the loading state of the page. Used by <NuxtLoadingIndicator> and controllable.
It hooks into page:loading:start and pag...
- [useNuxtApp](./4.api/2.composables/use-nuxt-app.md): useNuxtApp is a built-in composable that provides a way to access shared runtime context of Nuxt, also known as the Nuxt context, which is availabl...
- [useNuxtData](./4.api/2.composables/use-nuxt-data.md): ::note
useNuxtData gives you access to the current cached value of useAsyncData , useLazyAsyncData, useFetch and useLazyFetch with explicitly provi...
- [usePreviewMode](./4.api/2.composables/use-preview-mode.md): Preview mode allows you to see how your changes would be displayed on a live site without revealing them to users.
- [useRequestEvent](./4.api/2.composables/use-request-event.md): Within the Nuxt context you can use useRequestEvent to access the incoming request.
- [useRequestFetch](./4.api/2.composables/use-request-fetch.md): You can use useRequestFetch to forward the request context and headers when making server-side fetch requests.
- [useRequestHeader](./4.api/2.composables/use-request-header.md): You can use the built-in useRequestHeader composable to access any incoming request header within your pages, components, and plugins.
- [useRequestHeaders](./4.api/2.composables/use-request-headers.md): You can use built-in useRequestHeaders composable to access the incoming request headers within your pages, components, and plugins.
- [useRequestURL](./4.api/2.composables/use-request-url.md): useRequestURL is a helper function that returns an URL object working on both server-side and client-side.
- [useResponseHeader](./4.api/2.composables/use-response-header.md): ::important
This composable is available in Nuxt v3.14+.
::
- [useRouteAnnouncer](./4.api/2.composables/use-route-announcer.md): ::important
This composable is available in Nuxt v3.12+.
::
- [useRoute](./4.api/2.composables/use-route.md): ::note
Within the template of a Vue component, you can access the route using $route.
::
- [useRouter](./4.api/2.composables/use-router.md): If you only need the router instance within your template, use $router:
- [useRuntimeConfig](./4.api/2.composables/use-runtime-config.md): :read-more{to="/docs/4.x/guide/going-further/runtime-config"}
- [useRuntimeHook](./4.api/2.composables/use-runtime-hook.md): ::important
This composable is available in Nuxt v3.14+.
::
- [useSeoMeta](./4.api/2.composables/use-seo-meta.md): This helps you avoid common mistakes, such as using name instead of property, as well as typos - with over 100+ meta tags fully typed.
- [useServerSeoMeta](./4.api/2.composables/use-server-seo-meta.md): Just like useSeoMeta, useServerSeoMeta composable lets you define your site's SEO meta tags as a flat object with full TypeScript support.
- [useState](./4.api/2.composables/use-state.md): :read-more{to="/docs/4.x/getting-started/state-management"}

## 4.api/3.utils (29)

- [$fetch](./4.api/3.utils/$fetch.md): Nuxt uses ofetch to expose globally the $fetch helper for making HTTP requests within your Vue app or API routes.
- [abortNavigation](./4.api/3.utils/abort-navigation.md): ::warning
abortNavigation is only usable inside a route middleware handler.
::
- [addRouteMiddleware](./4.api/3.utils/add-route-middleware.md): ::note
Route middleware are navigation guards stored in the app/middleware/ directory of your Nuxt application (unless set otherwise).
::
- [callOnce](./4.api/3.utils/call-once.md): ::important
This utility is available since Nuxt v3.9.
::
- [clearError](./4.api/3.utils/clear-error.md): Within your pages, components, and plugins, you can use clearError to clear all errors and redirect the user.
- [clearNuxtData](./4.api/3.utils/clear-nuxt-data.md): ::note
This method is useful if you want to invalidate the data fetching for another page.
::
- [clearNuxtState](./4.api/3.utils/clear-nuxt-state.md): ::note
This method is useful if you want to invalidate the state of useState. You can also reset the state to its initial value by passing { reset:...
- [createError](./4.api/3.utils/create-error.md): You can use this function to create an error object with additional metadata. It is usable in both the Vue and Nitro portions of your app, and is m...
- [defineLazyHydrationComponent](./4.api/3.utils/define-lazy-hydration-component.md): defineLazyHydrationComponent is a compiler macro that helps you create a component with a specific lazy hydration strategy. Lazy hydration defers h...
- [defineNuxtComponent](./4.api/3.utils/define-nuxt-component.md): ::note
defineNuxtComponent() is a helper function for defining type safe Vue components using options API similar to defineComponent(). defineNuxtC...
- [defineNuxtPlugin](./4.api/3.utils/define-nuxt-plugin.md): defineNuxtPlugin is a helper function for creating Nuxt plugins with enhanced functionality and type safety. This utility normalizes different plug...
- [defineNuxtRouteMiddleware](./4.api/3.utils/define-nuxt-route-middleware.md): Route middleware are stored in the app/middleware/ of your Nuxt application (unless set otherwise).
- [definePageMeta](./4.api/3.utils/define-page-meta.md): definePageMeta is a compiler macro that you can use to set metadata for your page components located in the app/pages/ directory (unless set otherw...
- [defineRouteRules](./4.api/3.utils/define-route-rules.md): ::read-more{to="/docs/4.x/guide/going-further/experimental-features#inlinerouterules" icon="i-lucide-star"}
This feature is experimental and in ord...
- [navigateTo](./4.api/3.utils/navigate-to.md): navigateTo is available on both server side and client side. It can be used within the Nuxt context, or directly, to perform page navigation.
- [onBeforeRouteLeave](./4.api/3.utils/on-before-route-leave.md): :read-more{icon="i-simple-icons-vuedotjs" to="https://router.vuejs.org/api/functions/onbeforerouteleave" title="Vue Router Docs" target="blank"}
- [onBeforeRouteUpdate](./4.api/3.utils/on-before-route-update.md): :read-more{icon="i-simple-icons-vuedotjs" to="https://router.vuejs.org/api/functions/onbeforerouteupdate" title="Vue Router Docs" target="blank"}
- [onNuxtReady](./4.api/3.utils/on-nuxt-ready.md): ::important
onNuxtReady only runs on the client-side. :br
It is ideal for running code that should not block the initial rendering of your app.
::
- [prefetchComponents](./4.api/3.utils/prefetch-components.md): Prefetching component downloads the code in the background, this is based on the assumption that the component will likely be used for rendering, e...
- [preloadComponents](./4.api/3.utils/preload-components.md): Preloading components loads components that your page will need very soon, which you want to start loading early in rendering lifecycle. This ensur...
- [preloadRouteComponents](./4.api/3.utils/preload-route-components.md): Preloading routes loads the components of a given route that the user might navigate to in future. This ensures that the components are available e...
- [prerenderRoutes](./4.api/3.utils/prerender-routes.md): When prerendering, you can hint to Nitro to prerender additional paths, even if their URLs do not show up in the HTML of the generated page.
- [refreshCookie](./4.api/3.utils/refresh-cookie.md): ::important
This utility is available since Nuxt v3.10.
::
- [refreshNuxtData](./4.api/3.utils/refresh-nuxt-data.md): refreshNuxtData is used to refetch all or specific asyncData instances, including those from useAsyncData, useLazyAsyncData, useFetch, and useLazyF...
- [reloadNuxtApp](./4.api/3.utils/reload-nuxt-app.md): ::note
reloadNuxtApp will perform a hard reload of your app, re-requesting a page and its dependencies from the server.
::
- [setPageLayout](./4.api/3.utils/set-page-layout.md): ::important
setPageLayout allows you to dynamically change the layout of a page. It relies on access to the Nuxt context and therefore can only be ...
- [setResponseStatus](./4.api/3.utils/set-response-status.md): Nuxt provides composables and utilities for first-class server-side-rendering support.
- [showError](./4.api/3.utils/show-error.md): Within the Nuxt context you can use showError to show an error.
- [updateAppConfig](./4.api/3.utils/update-app-config.md): ::note
Updates the app.config using deep assignment. Existing (nested) properties will be preserved.
::

## 4.api/4.commands (16)

- [nuxt add](./4.api/4.commands/add.md): | Argument   | Description                                                                                                                         ...
- [nuxt analyze](./4.api/4.commands/analyze.md): The analyze command builds Nuxt and analyzes the production bundle (experimental).
- [nuxt build-module](./4.api/4.commands/build-module.md): The build-module command runs @nuxt/module-builder to generate dist directory within your rootDir that contains the full build for your nuxt-module.
- [nuxt build](./4.api/4.commands/build.md): The build command creates a .output directory with all your application, server and dependencies ready for production.
- [nuxt cleanup](./4.api/4.commands/cleanup.md): The cleanup command removes common generated Nuxt files and caches, including:
- [nuxt dev](./4.api/4.commands/dev.md): The dev command starts a development server with hot module replacement at http://localhost:3000
- [nuxt devtools](./4.api/4.commands/devtools.md): Running nuxt devtools enable will install the Nuxt DevTools globally, and also enable it within the particular project you are using. It is saved a...
- [nuxt generate](./4.api/4.commands/generate.md): The generate command pre-renders every route of your application and stores the result in plain HTML files that you can deploy on any static hostin...
- [nuxt info](./4.api/4.commands/info.md): The info command logs information about the current or specified Nuxt project.
- [create nuxt](./4.api/4.commands/init.md): The create-nuxt command initializes a fresh Nuxt project using unjs/giget.
- [nuxt module](./4.api/4.commands/module.md): Nuxt provides a few utilities to work with Nuxt modules seamlessly.
- [nuxt prepare](./4.api/4.commands/prepare.md): The prepare command creates a .nuxt directory in your application and generates types. This can be useful in a CI environment or as a postinstall c...
- [nuxt preview](./4.api/4.commands/preview.md): The preview command starts a server to preview your Nuxt application after running the build command. The start command is an alias for preview. Wh...
- [nuxt test](./4.api/4.commands/test.md): The test command runs tests using @nuxt/test-utils. This command sets process.env.NODEENV to test if not already set.
- [nuxt typecheck](./4.api/4.commands/typecheck.md): The typecheck command runs vue-tsc to check types throughout your app.
- [nuxt upgrade](./4.api/4.commands/upgrade.md): The upgrade command upgrades Nuxt to the latest version.

## 4.api/5.kit (18)

- [Modules](./4.api/5.kit/1.modules.md): Modules are the building blocks of Nuxt. Kit provides a set of utilities to help you create and use modules. You can use these utilities to create ...
- [Runtime Config](./4.api/5.kit/10.runtime-config.md): At build-time, it is possible to access the resolved Nuxt runtime config.
- [Templates](./4.api/5.kit/10.templates.md): Templates allow you to generate extra files during development and build time. These files will be available in virtual filesystem and can be used ...
- [Nitro](./4.api/5.kit/11.nitro.md): Nitro is an open source TypeScript framework to build ultra-fast web servers. Nuxt uses Nitro as its server engine. You can use useNitro to access ...
- [Resolving](./4.api/5.kit/12.resolving.md): Sometimes you need to resolve a path relative to the current module without knowing the name or extension. For example, you may want to add a plugi...
- [Logging](./4.api/5.kit/13.logging.md): Nuxt provides a logger instance that you can use to log messages with extra features. useLogger allows you to get a logger instance.
- [Builder](./4.api/5.kit/14.builder.md): Nuxt have builders based on Vite and webpack. You can extend the config passed to each one using extendViteConfig and extendWebpackConfig functions...
- [Examples](./4.api/5.kit/15.examples.md): If you are building an integration that needs access to the runtime Vite or webpack config that Nuxt uses, it is possible to extract this using Kit...
- [Layers](./4.api/5.kit/16.layers.md): Nuxt layers provide a powerful way to share and extend functionality across projects. When working with layers in modules, you often need to access...
- [Programmatic Usage](./4.api/5.kit/2.programmatic.md): Programmatic usage can be helpful when you want to use Nuxt programmatically, for example, when building a CLI tool or test utils.
- [Compatibility](./4.api/5.kit/3.compatibility.md): Nuxt Kit utilities can be used in Nuxt 3, Nuxt 2 with Bridge and even Nuxt 2 without Bridge. To make sure your module is compatible with all versio...
- [Auto-imports](./4.api/5.kit/4.autoimports.md): Nuxt auto-imports helper functions, composables and Vue APIs to use across your application without explicitly importing them. Based on the directo...
- [Components](./4.api/5.kit/5.components.md): Components are the building blocks of your Nuxt application. They are reusable Vue instances that can be used to create a user interface. In Nuxt, ...
- [Context](./4.api/5.kit/6.context.md): Nuxt modules allow you to enhance Nuxt's capabilities. They offer a structured way to keep your code organized and modular. If you're looking to br...
- [Pages](./4.api/5.kit/7.pages.md): In Nuxt, routes are automatically generated based on the structure of the files in the app/pages directory. However, there may be scenarios where y...
- [Layout](./4.api/5.kit/8.layout.md): Layouts is used to be a wrapper around your pages. It can be used to wrap your pages with common components, for example, a header and a footer. La...
- [Head](./4.api/5.kit/9.head.md): Sets global head configuration for your Nuxt application. This utility allows modules to programmatically configure meta tags, links, scripts, and ...
- [Plugins](./4.api/5.kit/9.plugins.md): Plugins are self-contained code that usually add app-level functionality to Vue. In Nuxt, plugins are automatically imported from the app/plugins/ ...

## 4.api/6.advanced (2)

- [Lifecycle Hooks](./4.api/6.advanced/1.hooks.md): :read-more{to="/docs/4.x/guide/going-further/hooks"}
- [Import meta](./4.api/6.advanced/2.import-meta.md): With ES modules you can obtain some metadata from the code that imports or compiles your ES-module.
This is done through import.meta, which is an o...

## 4.api (2)

- [Nuxt Configuration](./4.api/6.nuxt-config.md): You can improve your DX by defining additional aliases to access custom directories within your JavaScript and CSS.
- [Nuxt API Reference](./4.api/index.md): ::card-group
::card{icon="i-lucide-box" title="Components" to="/docs/4.x/api/components/client-only"}
Explore Nuxt built-in components for pages, l...

## 5.community (6)

- [Getting Help](./5.community/2.getting-help.md): At some point, you may find that there's an issue you need some help with.
- [Reporting Bugs](./5.community/3.reporting-bugs.md): Try as we might, we will never completely eliminate bugs.
- [Contribution](./5.community/4.contribution.md): There is a range of different ways you might be able to contribute to the Nuxt ecosystem.
- [Framework](./5.community/5.framework-contribution.md): Once you've read the general contribution guide, here are some specific points to make about contributions to the nuxt/nuxt repository.
- [Roadmap](./5.community/6.roadmap.md): ::read-more{to="/blog"}
See our blog for the latest framework and ecosystem announcements.
::
- [Releases](./5.community/7.changelog.md): Nuxt UI releases.
::
::

## 6.bridge (10)

- [Overview](./6.bridge/1.overview.md): ::note
If you're starting a fresh Nuxt 3 project, please skip this section and go to Nuxt 3 Installation.
::
- [Configuration](./6.bridge/10.configuration.md): You can optionally disable some features from bridge or opt-in to less stable ones. In normal circumstances, it is always best to stick with defaults!
- [TypeScript](./6.bridge/2.typescript.md): If you are using TypeScript, you can edit your tsconfig.json to benefit from auto-generated Nuxt types:
- [Legacy Composition API](./6.bridge/3.bridge-composition-api.md): Nuxt Bridge provides access to Composition API syntax. It is specifically designed to be aligned with Nuxt 3. Because of this, there are a few extr...
- [Plugins and Middleware](./6.bridge/4.plugins-and-middleware.md): You can now migrate to the Nuxt 3 plugins API, which is slightly different in format from Nuxt 2.
- [New Composition API](./6.bridge/5.nuxt3-compatible-api.md): By migrating from @nuxtjs/composition-api to the Nuxt 3 compatible API, there will be less rewriting when migrating to Nuxt 3.
- [Meta Tags](./6.bridge/6.meta.md): If you need to access the component state with head, you should migrate to using useHead .
- [Runtime Config](./6.bridge/7.runtime-config.md): ::warning
When using runtimeConfig option, nitro must have been configured.
::
- [Nitro](./6.bridge/8.nitro.md): You will also need to update your scripts within your package.json to reflect the fact that Nuxt will now produce a Nitro server as build output.
- [Vite](./6.bridge/9.vite.md): ::warning
When using vite, nitro must have been configured.
::

## 7.migration (11)

- [Overview](./7.migration/1.overview.md): There are significant changes when migrating a Nuxt 2 app to Nuxt 3, although you can expect migration to become more straightforward as we move to...
- [Build Tooling](./7.migration/10.bundling.md): We use the following build tools by default:
- [Server](./7.migration/11.server.md): In a built Nuxt 3 application, there is no runtime Nuxt dependency. That means your site will be highly performant, and ultra-slim. But it also mea...
- [Configuration](./7.migration/2.configuration.md): The starting point for your Nuxt app remains your nuxt.config file.
- [Modules](./7.migration/20.module-authors.md): Nuxt 3 has a basic backward compatibility layer for Nuxt 2 modules using @nuxt/kit auto wrappers. But there are usually steps to follow to make mod...
- [Auto Imports](./7.migration/3.auto-imports.md): ::note
In the rest of the migration documentation, you will notice that key Nuxt and Vue utilities do not have explicit imports. This is not a typo...
- [Meta Tags](./7.migration/4.meta.md): Nuxt 3 provides several different ways to manage your meta tags:
- [Plugins and Middleware](./7.migration/5.plugins-and-middleware.md): Plugins now have a different format, and take only one argument (nuxtApp).
- [Pages and Layouts](./7.migration/6.pages-and-layouts.md): Nuxt 3 provides a central entry point to your app via /app.vue.
- [Component Options](./7.migration/7.component-options.md): Nuxt 3 provides new options for fetching data from an API.
- [Runtime Config](./7.migration/8.runtime-config.md): If you wish to reference environment variables within your Nuxt 3 app, you will need to use runtime config.
