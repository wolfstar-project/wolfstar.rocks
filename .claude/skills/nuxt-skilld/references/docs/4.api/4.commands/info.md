---
title: "nuxt info"
description: The info command logs information about the current or specified Nuxt project.
links:
  - label: Source
    icon: i-simple-icons-github
    to: https://github.com/nuxt/cli/blob/main/packages/nuxi/src/commands/info.ts
    size: xs
---


```bash [Terminal]
npx nuxt info [ROOTDIR] [--cwd=<directory>]
```


The `info` command logs information about the current or specified Nuxt project.

## Arguments


| Argument      | Description                                    |
|---------------|------------------------------------------------|
| `ROOTDIR="."` | Specifies the working directory (default: `.`) |


## Options


| Option              | Default | Description                                                                      |
|---------------------|---------|----------------------------------------------------------------------------------|
| `--cwd=<directory>` |         | Specify the working directory, this takes precedence over ROOTDIR (default: `.`) |

