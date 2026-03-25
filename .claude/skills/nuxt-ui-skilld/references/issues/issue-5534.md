---
number: 5534
title: min-w-fit not working with virtualization in USelectMenu
type: bug
state: open
created: 2025-11-26
url: "https://github.com/nuxt/ui/issues/5534"
reactions: 5
comments: 5
labels: "[bug, v4, p2-medium]"
---

# min-w-fit not working with virtualization in USelectMenu

### Environment

- Operating System: Linux
- Node Version:     v22.16.0
- Nuxt Version:     4.2.1
- CLI Version:      3.30.0
- Nitro Version:    2.12.9
- Package Manager:  npm@10.9.2
- Builder:          -
- User Config:      -
- Runtime Modules:  -
- Build Modules:    -

### Is this bug related to Nuxt or Vue?

Nuxt

### Package

v4.x

### Version

v4.1.0

### Reproduction

https://stackblitz.com/edit/uselectmenu-error

### Description

When using the **USelectMenu** component with the **virtualize** option enabled, the **min-w-fit** class applied via the ui.content property does not behave correctly. The dropdown content does not resize to fit the longest item.
Without **virtualization**, the same configuration works as expected, the dropdown expands to show the **full content width**.

### Additional context

Expected behavior:

<img width="463" height="379" alt="Image" src="https://github.com/user-attachments/assets/b5aef095-5bba-484d-93b6-c54a6f9c0410" />


Unexpected behavior:

<img width="284" height="396" alt="Image" src="https://github.com/user-attachments/assets/3df050bb-1757-48bd-9ad3-2f79b9582f4f" />

### Logs

```shell-script

```