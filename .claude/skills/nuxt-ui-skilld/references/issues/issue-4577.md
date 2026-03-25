---
number: 4577
title: Auto-reload not working with Nuxt 4 + Nuxt UI on Node version above 22 
type: bug
state: closed
created: 2025-07-23
url: "https://github.com/nuxt/ui/issues/4577"
reactions: 8
comments: 16
labels: "[bug, v3, upstream]"
---

# Auto-reload not working with Nuxt 4 + Nuxt UI on Node version above 22 

### Environment

Auto-reload feature doesn't work when using Nuxt 4 with Nuxt UI. Changes require a manual page refresh to be visible.

------------------------------
- Operating System: Windows_NT
- Node Version:     v24.4.1
- Nuxt Version:     4.0.1
- CLI Version:      3.26.4
- Nitro Version:    2.12.4
- Package Manager:  npm@11.4.2
- Builder:          -
- User Config:      devtools, modules, css, compatibilityDate
- Runtime Modules:  @nuxt/ui@3.2.0, @nuxt/eslint@1.7.0
- Build Modules:    -
------------------------------

### Version

3.2.0

### Reproduction

StackBlitz doesn't support Node above 22 , so I couldn't create a link, but using the starter template from nuxt.new reproduces this issue consistently.

Steps to reproduce:
1. Use nuxt.new to setup a new nuxt project with Nuxt UI:
```
npm create nuxt@latest -- -t ui
```
2. Start the dev server
3. Edit any component or page
4. Observe that hot reload doesn't work without manually refreshing the page

Note: This only occurs on Node above 22 - works fine on other Node versions.

### Description

When using Nuxt 4 with Nuxt UI on Node 24 or 22, the auto-reload/hot reload feature doesn't work. Any changes made to components, pages, or other files require a manual browser refresh to be visible. This breaks the development experience as changes aren't automatically reflected.

The issue is specific to Node above 22  - the same setup works correctly on other Node versions.

### Additional context

...

---

## Top Comments

**@benjamincanac** [maintainer]:

I don't reproduce this with Node 24 so it might be related to Windows specifically 

Does this happen only when Nuxt UI is installed?

**@TheRubble**:

Windows 11
Nuxt 4
Node 22.17.1
Nitro 2.12.4

I'm seeing this issue on 22.17.1 using Nuxt 4 and Ui Pro. Before I install Nuxt UI Hot reload is working fine. Further to this the terminal mentions HR has been published.

<img width="572" height="44" alt="Image" src="https://github.com/user-attachments/assets/e16fbb59-1fd7-4bde-ab93-bafe8025a6c7" />

**@Hepi420**:

> I don't reproduce this with Node 24 so it might be related to Windows specifically 
> 
> Does this happen only when Nuxt UI is installed?

I tested only on windows 11.
The same blank project without Nuxt UI works fine. After installing Nuxt UI auto reload stops working.
I also dont see any errors.