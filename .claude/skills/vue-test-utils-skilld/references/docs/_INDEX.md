---
total: 53
---

# Docs Index

- [index](./index.md): layout: home

## api (1)

- [API Reference](./api/index.md): Creates a Wrapper that contains the mounted and rendered Vue component to test.
Note that when mocking dates/timers with Vitest, this must be calle...

## fr/api (1)

- [API](./fr/api/index.md): Crée un Wrapper qui contient le composant Vue monté et rendu pour le test.

## fr/guide/advanced (12)

- [Comportement asynchrone](./fr/guide/advanced/async-suspense.md): Vous avez sûrement remarqué que certaines parties de ce guide utilisent await lors de l'appel de certaines méthodes de wrapper, telles que trigger ...
- [Instance de Composant](./fr/guide/advanced/component-instance.md): mount renvoie un VueWrapper avec de nombreuses méthodes pratiques pour tester les composants Vue. Parfois, vous souhaiterez accéder à l'instance Vu...
- [Faire des requêtes HTTP](./fr/guide/advanced/http-requests.md): Les frameworks de tests modernes proposent déjà de nombreuses fonctionnalités pour les tests de requêtes HTTP. Par conséquent, Vue Test Utils ne di...
- [Réutilisabilité et Composition](./fr/guide/advanced/reusability-composition.md): Lorsque vous travaillez avec l'API de composition et que vous créez des composables, vous voulez parfois ne tester que le composable seul. Commenço...
- [Slots](./fr/guide/advanced/slots.md): Vue Test Utils offre des fonctionnalités utiles pour tester les composants qui utilisent des slots.
- [Tester le Rendu côté Serveur (SSR)](./fr/guide/advanced/ssr.md): Vue Test Utils fournit renderToString pour tester des applications Vue qui utilisent le rendu côté serveur (SSR).
- [Composants de Substitution (Stubs) et Montage Partiel](./fr/guide/advanced/stubs-shallow-mount.md): Vue Test Utils offre certaines fonctionnalités avancées pour substituer (stubbing) les composants et les directives. La substitution consiste à rem...
- [Tester Teleport](./fr/guide/advanced/teleport.md): Vue 3 offre un nouveau composant intégré : <Teleport>, qui permet aux composants de "téléporter" leur contenu très loin de leur propre <template>. ...
- [Transitions](./fr/guide/advanced/transitions.md): En général, vous voudriez tester le DOM affiché après une transition, c'est pourquoi Vue Test Utils simule par défaut <transition> et <transition-g...
- [Tester v-model](./fr/guide/advanced/v-model.md): Lors de l'écriture de composants qui dépendent de l'interaction v-model (évènement update:modelValue), vous devez gérer l'event et les props.
- [Tester Vue Router](./fr/guide/advanced/vue-router.md): Cet article présentera deux façons de tester une application en utilisant Vue Router :
- [Tester Vuex](./fr/guide/advanced/vuex.md): Vuex n'est qu'un détail d'implémentation ; aucun traitement spécial n'est nécessaire pour tester les composants en utilisant Vuex. Cependant, il ex...

## fr/guide/essentials (6)

- [Cours rapide](./fr/guide/essentials/a-crash-course.md): Rentrons dans le vif du sujet ! Apprenons à utiliser Vue Test Utils (VTU) en construisant une simple application de tâches à réaliser (une Todo lis...
- [Rendu conditionnel](./fr/guide/essentials/conditional-rendering.md): Vue Test Utils offre un bouquet de fonctionnalités pour monter et faire des vérifications sur l'état d'un composant, dans le but de vérifier qu'il ...
- [Écrire des composants faciles à tester](./fr/guide/essentials/easy-to-test.md): Vue Test Utils vous aide à écrire des tests pour des composants Vue. Néanmoins, VTU ne peut pas tout faire.
- [Tester les évènements émis](./fr/guide/essentials/event-handling.md): Les composants Vue interagissent les uns avec les autres à travers des props et en émettant des événements en appelant $emit. Dans ce guide, nous e...
- [Tester les formulaires](./fr/guide/essentials/forms.md): Les formulaires dans Vue peuvent être aussi simples que des formulaires HTML classiques ou à l'inverse des arborescences complexes d'éléments de fo...
- [Passer des données aux Composants](./fr/guide/essentials/passing-data.md): Vue Test Utils fournit plusieurs moyens de passer des données et des propriétés à un composant pour vous permettre de tester complètement son compo...

## fr/guide/extending-vtu (2)

- [Communauté et Apprentissage](./fr/guide/extending-vtu/community-learning.md)
- [Plugins](./fr/guide/extending-vtu/plugins.md): Les plugins ajoutent des fonctionnalités au niveau global à l'API de Vue Test Utils. C'est la méthode officielle pour étendre l'API de Vue Test Uti...

## fr/guide/faq (1)

- [FAQ](./fr/guide/faq/index.md): [[toc]]

## fr/guide (1)

- [Commencer](./fr/guide/index.md): Bienvenue sur Vue Test Utils, la librairie de tests officielle pour Vue.js !

## fr (2)

- [index](./fr/index.md): layout: home
- [Vue Test Utils](./fr/README.md): Utilitaire de Test de Composants pour Vue 3.

## fr/installation (1)

- [Installation](./fr/installation/index.md): Vue Test Utils est un outil indépendant de tout framework - vous pouvez l'utiliser avec le gestionnaire de tests de votre choix. La manière la plus...

## fr/migration (1)

- [Migrer depuis Vue Test Utils v1](./fr/migration/index.md): Voici une liste des modifications de VTU v1 à VTU v2 et quelques extraits de code pour montrer les modifications nécessaires à la migration. Si vou...

## guide/advanced (12)

- [Asynchronous Behavior](./guide/advanced/async-suspense.md): You may have noticed some other parts of the guide using await when calling some methods on wrapper, such as trigger and setValue. What's that all ...
- [Component Instance](./guide/advanced/component-instance.md): mount returns a VueWrapper with lots of convenient methods for testing Vue components. Sometimes you might want access to the underlying Vue instan...
- [Making HTTP requests](./guide/advanced/http-requests.md): Modern test runners already provide lots of great features when it comes to test HTTP requests. Thus, Vue Test Utils doesn't feature any unique too...
- [Reusability & Composition](./guide/advanced/reusability-composition.md): Mostly:
- [Slots](./guide/advanced/slots.md): Vue Test Utils provides some useful features for testing components using slots.
- [Testing Server-side Rendering](./guide/advanced/ssr.md): Vue Test Utils provides renderToString to test Vue applications that use server-side rendering (SSR).
This guide will walk you through the process ...
- [Stubs and Shallow Mount](./guide/advanced/stubs-shallow-mount.md): Vue Test Utils provides some advanced features for stubbing components and directives. A stub is where you replace an existing implementation of a ...
- [Testing Teleport](./guide/advanced/teleport.md): Vue 3 comes with a new built-in component: <Teleport>, which allows components to "teleport" their content far outside of their own <template>. Mos...
- [Transitions](./guide/advanced/transitions.md): In general, you may want to test the resulting DOM after a transition, and this is why Vue Test Utils mocks <transition> and <transition-group> by ...
- [Testing v-model](./guide/advanced/v-model.md): When writing components that rely on v-model interaction (update:modelValue event), you need to handle the event and props.
- [Testing Vue Router](./guide/advanced/vue-router.md): This article will present two ways to test an application using Vue Router:
- [Testing Vuex](./guide/advanced/vuex.md): Vuex is just an implementation detail; no special treatment is required for testing components using Vuex. That said, there are some techniques tha...

## guide/essentials (6)

- [A Crash Course](./guide/essentials/a-crash-course.md): Let's jump right into it! Let's learn Vue Test Utils (VTU) by building a simple Todo app and writing tests as we go. This
guide will cover how to:
- [Conditional Rendering](./guide/essentials/conditional-rendering.md): Vue Test Utils has a range of features for rendering and making assertions about the state of a component, with the goal of verifying it is behavin...
- [Write components that are easy to test](./guide/essentials/easy-to-test.md): Vue Test Utils helps you write tests for Vue components. However, there's only so much VTU can do.
- [Event Handling](./guide/essentials/event-handling.md): Vue components interact with each other via props and by emitting events by calling $emit. In this guide, we look at how to verify events are corre...
- [Form Handling](./guide/essentials/forms.md): Forms in Vue can be as simple as plain HTML forms to complicated nested trees of custom Vue component form elements.
We will gradually go through t...
- [Passing Data to Components](./guide/essentials/passing-data.md): Vue Test Utils provides several ways to set data and props on a component, to allow you to fully test the component's behavior in different scenarios.

## guide/extending-vtu (2)

- [Community and Learning](./guide/extending-vtu/community-learning.md)
- [Plugins](./guide/extending-vtu/plugins.md): Plugins add global-level functionality to Vue Test Utils' API. This is the
official way to extend Vue Test Utils' API with custom logic, methods, o...

## guide/faq (1)

- [FAQ](./guide/faq/index.md): [[toc]]

## guide (1)

- [Getting Started](./guide/index.md): Welcome to Vue Test Utils, the official testing utility library for Vue.js!

## installation (1)

- [Installation](./installation/index.md): Vue Test Utils is framework agnostic - you can use it with whichever test runner you like. The easiest way to try it out is using Jest, a popular t...

## migration (1)

- [Migrating from Vue Test Utils v1](./migration/index.md): A review of changes VTU v1 -> VTU v2, and some code snippets to showcase required modifications. If you encounter a bug or difference in behavior n...
