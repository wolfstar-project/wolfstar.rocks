---
number: 342
title: Isolation conflict
type: other
state: open
created: 2023-07-14
url: "https://github.com/nuxt/test-utils/issues/342"
reactions: 0
comments: 0
labels: "[v0]"
---

# Isolation conflict

There's a complex problem with a not-rare case.

When you start your Nuxt app, Nuxt fills process.env with .env file content during Nuxt.config loading stage.
Process.env is available on the server, including code in the server bundle. So, many apps rely on this behavior for their private env vars.

Unfortunately, when you run Nuxt from inside your Jest test it behaves unexpectedly differently:
Nuxt still fills process.env, and it's even available inside the Jest test, but when it comes to the bundled server code there's a different copy of process.env that doesn't contain previously filled .env values.

The reason is doubled [VM isolation](h...