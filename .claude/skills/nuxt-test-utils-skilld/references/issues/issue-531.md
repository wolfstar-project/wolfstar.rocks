---
number: 531
title: nuxt server environment support
type: feature
state: open
created: 2023-06-02
url: "https://github.com/nuxt/test-utils/issues/531"
reactions: 43
comments: 15
labels: "[enhancement, vitest-environment]"
---

# nuxt server environment support

We currently support running composables/components in a browser-type environment (with happy-dom, and soon jsdom). But there are use cases where it might be useful to support running tests in a hybrid server environment where things like h3 utilities and nuxt ssr utilities work.

This could definitely be classed as non-essential and experimental, but we can track it here.

---

## Top Comments

**@alexcroox** (+25):

Are there any plans to make this happen still? I was hoping for my full stack Nuxt framework that I'd be able to unit test the full stack but the confusion/limited support for unit testing the server side has resulted in weeks of lost time and confusion around the matter. Even a section in the testing docs warning people away from unit testing the server/api routes would help others here.

**@zoobzio** (+11):

For unit tests on Nuxt API endpoints this problem might also be solved w/ H3 test utils that are agnostic of the Nuxt runtime & instead allow for programmatic execution of event handlers 

I have been playing w/ an implementation that allows for me to:

- mock `h3` utils like `defineEventHandler` & automatically stub the global context 
- pass mocked `H3Event` data to a given handler function as a test cases 

Extending this workaround, we can define a function that registers `h3` mocks in the global context:

...

**@rubennaatje** (+6):

as a work around for my apicalls / nitro plugins i added all auto imported server stuff to my setup.ts as 

```ts
vitest.stubGlobal("defineEventHandler", (func: any) => func);
vitest.stubGlobal("defineNitroPlugin", (e: any) => e);
//etc
```
Which works absolutely fine for the time being, if anyone has a better idea/way i'd love to know!

I mock my own utilities the same way and then use them in unit tests like this
```ts
(getService as MockedFunction<typeof getService>).mockReturnValue(
  {mockedServiceCall: () => true}
);
```
