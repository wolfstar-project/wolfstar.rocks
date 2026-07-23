---
number: 1021
title: How to test Nuxt server routes that uses Cloudflare d1 and OAuth2?
category: "Q&A"
created: 2024-12-01
url: "https://github.com/nuxt/test-utils/discussions/1021"
upvotes: 2
comments: 0
answered: false
---

# How to test Nuxt server routes that uses Cloudflare d1 and OAuth2?

I've been working on a Nuxt project that integrates SQLite with Cloudflare D1 as the backend database, following the testing guidelines from the Nuxt Testing and Nuxthub documentation. 

I've managed to run the tests successfully, but only when using `setup({ dev: true })`. This configuration forces the test environment to use the local development database stored in the `.data/` directory (which is created by NuxtHub). This isn't the behavior I'm looking for. Furthermore, I'm encountering significant challenges:

- mocking server API routes is not working at all (eg, `registerEndpoint`)
- can't run tests from scratch by using an SQLite database created from scratch and running migrations on ...