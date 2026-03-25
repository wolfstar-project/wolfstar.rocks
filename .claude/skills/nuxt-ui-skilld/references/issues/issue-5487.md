---
number: 5487
title: "Compatibility Issue: Cannot resolve Nuxt UI's #build/ui.css alias"
type: bug
state: closed
created: 2025-11-19
url: "https://github.com/nuxt/ui/issues/5487"
reactions: 7
comments: 17
labels: "[bug, v4, p2-medium]"
---

# Compatibility Issue: Cannot resolve Nuxt UI's #build/ui.css alias

## Problem

When using `prettier-plugin-tailwindcss` with Nuxt UI 4.2.0, Prettier fails with the following error:

```
Error: Can't resolve '#build/ui.css' in '.../node_modules/@nuxt/ui/dist/runtime'
```

## Environment

- `@nuxt/ui`: ^4.2.0
- `prettier-plugin-tailwindcss`: ^0.7.1
- `prettier`: ^3.6.2
- `nuxt`: ^4.2.1

## Workaround

Remove `tailwindStylesheet` from `.prettierrc.json`. The plugin will still work using its default Tailwind discovery mechanism.


### Is this bug related to Nuxt or Vue?

Nuxt

### Package

v4.x

### Version

4.2.0

### Reproduction

1. Create a CSS file with `@import '@nuxt/ui';`
2. Configure `.prettierrc.json` with `tailwindStylesheet` pointing to that CSS file
3. Run `prettier --write .`
4. Error occurs

### Description

.

### Additional context

_No response_

### Logs

```shell-script
[error] app/components/home/Card.vue: Error: Can't resolve '#build/ui.css' in '/Users/xlsama/w/store-health-web/node_modules/.pnpm/@nuxt+ui@4.2.0_@babel+parser@7.28.5_async-validator@4.2.5_change-case@5.4.4_db0@0.3.4_e_66a90f6365abf4cefd0d434e2d3f0e4e/node_modules/@nuxt/ui/dist/runtime'
[error]     at h (file:///Users/xlsama/w/store-health-web/node_modules/.pnpm/prettier-plugin-tailwindcss@0.7.1_@prettier+plugin-oxc@0.0.5_prettier@3.6.2/node_modules/prettier-plugin-tailwindcss/dist/index.mjs:231:4669)
app/components/home/Compliance.vue
[error] app/components/home/Compliance.vue: Error: Can't resolve '#build/ui.css' in '/Users/xlsama/w/store-health-web/node_modules/.pnpm/@nuxt+ui@4.2.0_@babel+parser@7.28.5_async-validator@4.2.5_change-case@5.4.4_db0@0.3.4_e_66a90f6365abf4cefd0d434e2d3f0e4e/node_modules/@nuxt/ui/dist/runtime'
```...

---

## Top Comments

**@xlsama** (+5):

**The `tailwindStylesheet` configuration is necessary for proper Tailwind CSS class recognition.**

The `tailwindStylesheet` option in `.prettierrc.json` is required for `prettier-plugin-tailwindcss` to correctly identify Tailwind classes. For example, when hovering over `text-primary` in the IDE, it should display:

```css
.text-primary {
  color: var(--ui-primary);
}
```

**Correct configuration:**
```json
{
  "tailwindStylesheet": "app/assets/css/main.css"
}
```

Where `main.css` imports Nuxt UI and defines the CSS variables:

```css
@import 'tailwindcss';
@import '@nuxt/ui';

...

**@benjamincanac** [maintainer]:

This is a regression of https://github.com/nuxt/ui/pull/5355, we removed the `#build/ui.css` import defined in `package.json` to use real theme templates in Vite. First, did you update your `tsconfig.node.json`?

```diff
{
  "compilerOptions": {
    "paths": {
      "#build/ui": [
-       "./node_modules/@nuxt/ui/.nuxt/ui"
+       "./node_modules/.nuxt-ui/ui"
      ]
    }
  }
}
```

I'm not familiar with this prettier plugin but it might be worth trying to add `"#build/ui.css": ["./node_modules/.nuxt-ui/ui.css"]` in there too.

**@benjamincanac** [maintainer] (+1):

Wait, my answer is probably wrong since you're using Nuxt and not Vite. I'll have to try this plugin myself to provide a better answer.