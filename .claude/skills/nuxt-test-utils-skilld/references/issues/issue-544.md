---
number: 544
title: mocking plugins used within nuxt
type: docs
state: open
created: 2023-05-22
url: "https://github.com/nuxt/test-utils/issues/544"
reactions: 2
comments: 9
labels: "[documentation, enhancement, vitest-environment]"
---

# mocking plugins used within nuxt

Hey, firstly thank you for making this plugin, it looks very useful :)

Running this module seems to run the whole nuxt environment, including the plugins, and we have a plugin that makes a api call. We normally just mock the module where we import the api function but it doesn't seem to work in this case. For example:
```
// somePlugin.ts
import { fetchProducts } from "~/service/products";

export default defineNuxtPlugin(async () => {
    const products = fetchProducts();
    // do something with the products
});
```

```
// SomeComponent.nuxt.spec.js
import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import SomeComponent from "../SomeComponent.vue";

// trying to mock the products service so that the real api doesn't get called during the plugins
vi.mock("~/service/products");

describe("SomeComponent", async () => {
  it("Is a Vue instance", () => {
    const wrapper = shallowMount(SomeComponent);
    expect(wrapper.vm).toBeTruthy();
  });
});
```...