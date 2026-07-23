---
number: 882
title: E2E testing mocking an external API
category: "Q&A"
created: 2024-07-03
url: "https://github.com/nuxt/test-utils/discussions/882"
upvotes: 3
comments: 4
answered: false
---

# E2E testing mocking an external API

Im using e2e testing, but rather than use /server/api for my endpoints (called client side only), I use external apis.

How can i mock the responses from external apis?

Ive tried a few 3rd party tools, like miragejs, but im guessing its not being pulled into the nuxt test instance.

Does anyone have a solution to this? I know i could probably use runtime and component testing to apply mocks to the api calls, but I'd prefer to run tests e2e, but with mocked external apis.

Thanks

---

## Top Comments

**@dosubot** (+7):


Hey there, @GazEdge! I'm a bot designed to help you out with bugs, questions, and becoming a contributor. Feel free to ask me anything while waiting for a human maintainer to assist you.


To mock the responses from external APIs for end-to-end (E2E) testing in a Nuxt application, you can use the `@nuxt/test-utils` library, which provides various utilities for testing Nuxt applications. One of the utilities you can use is `registerEndpoint`, which allows you to mock API responses. Here is an example of how to use it:

...

**@lewnelson**:

I felt this pain. I've just created a tool that solves this problem https://docs.mockybalboa.com/. There's first class support for Nuxt as well as Playwright and Cypress.

It allows you to write your fixtures declaratively within your tests without having to modify any application logic. No proxy servers, no static fixtures, and it supports running tests in parallel. Fixtures are scoped to the client, which means no risk of leaking fixtures outside the tests they were written for.

...

**@GazEdge**:

@dosu your answer wont work, as registerEndpoint can only be used in runtime testing. Find a solution that works with @nuxt/test-utils/e2e