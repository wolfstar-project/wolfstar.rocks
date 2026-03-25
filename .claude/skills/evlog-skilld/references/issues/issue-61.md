---
number: 61
title: "[bug] `H3 createError custom properties (data, statusCode) not captured in wide event`"
type: bug
state: closed
created: 2026-02-10
url: "https://github.com/HugoRCD/evlog/issues/61"
reactions: 0
comments: 0
labels: "[bug]"
---

# [bug] `H3 createError custom properties (data, statusCode) not captured in wide event`

### Description

First of all, huge congratulations on this library!  

evlog is absolutely brilliant – the "wide event" approach with accumulated context throughout a request is exactly how logging should have always been done. It makes debugging so much easier and cleaner. The DX is fantastic, and the integration with Nuxt/Nitro is seamless. Thank you for building this!

---

### Problem

When throwing an error using H3's `createError` with custom `data` properties, these properties are not captured in the wide event's `error` field.

### Reproduction

...