---
number: 81
title: "Support new runtime `isJiti` and `isTsx`?"
type: feature
state: open
created: 2023-09-27
url: "https://github.com/unjs/std-env/issues/81"
reactions: 5
comments: 2
labels: "[enhancement]"
---

# Support new runtime `isJiti` and `isTsx`?

### Describe the feature

I'm developing a vite plugin using unbuild, if it's in `stub` mode(jiti), inject a package for main.ts using a relative path, otherwise use the package name.

### Additional information

- [ ] Would you be willing to help implement this feature?

---

## Top Comments

**@pi0** [maintainer] (+1):

I think we might need to expose such env/static flag from jiti itself to allow detection.



**@KeJunMao**:

If run directly as a command, I can use `process.mainModule.filename` to confirm the runtime.

If I use programming to load modules (like the stub mode of unbuild), I don't know how to determine the current runtime.

Currently, I am using the `build: done` hook of unbouild to output `process.env.JITI=true'`.

```ts
  hooks: {
    'build:done': (ctx) => {
      if (ctx.options.stub) {
        writeFileSync('dist/index.mjs', `process.env.JITI = true;\n${readFileSync('dist/index.mjs', 'utf-8')}`)
      }
    },
  },
```