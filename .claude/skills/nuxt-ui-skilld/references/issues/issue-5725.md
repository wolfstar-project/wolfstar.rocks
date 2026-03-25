---
number: 5725
title: Form component perform like native HTML form with action attr
type: question
state: open
created: 2025-12-20
url: "https://github.com/nuxt/ui/issues/5725"
reactions: 3
comments: 4
labels: "[question, v4]"
---

# Form component perform like native HTML form with action attr

### Package

v4.x

### Description

Is there any ways I can use form component like native form? So far when I click on submit button, it take no action. But when I put `@submit` with event handler it trigger. Below is my snippet code. I work on MVC with Adonis JS.

```vue
<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        action="/login"
        method="POST"
      />
    </UPageCard>
  </div>
</template>
```