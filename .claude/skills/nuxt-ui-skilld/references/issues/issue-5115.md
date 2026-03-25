---
number: 5115
title: Nested form onSubmit handler type mismatch
type: question
state: open
created: 2025-10-01
url: "https://github.com/nuxt/ui/issues/5115"
reactions: 5
comments: 5
labels: "[question, v3]"
---

# Nested form onSubmit handler type mismatch

### Package

v3.x

### Description

I am trying to migrate from nuxt ui v2 to v3 and I experienced a problem with complex forms.
I started to re-implement everything with the new nested forms pattern but I finally have a problem with the defined type of the submit handler.

The defined type of the handler is the following:
`onSubmit?: ((event: FormSubmitEvent<FormData<S, T>>) => void | Promise<void>) | (() => void | Promise<void>);`

Where `S` is the schema passed to the form. With nested forms the data passed to the handler must be the combination of the main form with the addition of the data from the nested one.

Keeping the example in the documentation as reference the onSubmit handler must have as input parameter `event: FormSubmitEvent<Schema>` but `Schema` is a subpart of the total data received from the form.

The console.log print all data (also from nested forms) but is not type safe and to use that data to perform a mutation is necessary a cast (not so good in my opinion).

Do you have some suggestion?

Thanks,

Federico