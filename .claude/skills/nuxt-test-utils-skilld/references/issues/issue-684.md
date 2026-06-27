---
number: 684
title: "mountSuspended fails: 'set' on proxy: trap returned falsish for property 'error'"
type: bug
state: closed
created: 2024-01-02
url: "https://github.com/nuxt/test-utils/issues/684"
reactions: 12
comments: 29
labels: "[bug]"
---

# mountSuspended fails: 'set' on proxy: trap returned falsish for property 'error'

### Environment

- Operating System: `Darwin`
- Node Version:     `v20.8.1`
- Nuxt Version:     `3.9.0`
- CLI Version:      `3.10.0`
- Nitro Version:    `2.8.1`
- Package Manager:  `yarn@1.22.19`
- Builder:          `-`
- User Config:      `devtools`, `modules`
- Runtime Modules:  `@nuxt/test-utils/module@3.9.0`
- Build Modules:    `-`


### Reproduction

https://stackblitz.com/edit/github-gee6qy?file=app.vue

### Describe the bug

Once I expose a variable called  `error` within the setup, the component fails to render.  
Since everything works within the dev server / build, I suspect this is something within `@nuxt/test-utils`

After renaming the `error` variable to something else, the component can be mounted within the tests again.

### Additional context

_No response_

### Logs

...

---

## Top Comments

**@cory-baker** (+6):

> It seems that this is happening whenever you  has a root variable named `error`.
> 
> Both of these will throw the error:
> 
> ```ts
> const { data, error } = useMyQuery()
> 
> const error = ref(false)
> ```

this was the issue for me. renaming my variable from `error` to `err` fixed it.

Definitely a bug though

**@gbyesiltas** (+6):

Hey guys, I can imagine people who are working on this package are very busy and I don't want to be annoying but I think the fact that your tests fail whenever you have a variable called `error` in your component is a pretty big issue and makes this package pretty much unusable for us :,(

**@tdebooij** (+4):

It seems that this is happening whenever you  has a root variable named `error`.

Both of these will throw the error:
```ts
const { data, error } = useMyQuery()

const error = ref(false)
```
