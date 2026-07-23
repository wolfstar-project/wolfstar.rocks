---
title: "nuxt analyze"
description: "Analyze the production bundle or your Nuxt application."
links:
  - label: Source
    icon: i-simple-icons-github
    to: https://github.com/nuxt/cli/blob/main/packages/nuxi/src/commands/analyze.ts
    size: xs
---


```bash [Terminal]
npx nuxt analyze [ROOTDIR] [--cwd=<directory>] [--logLevel=<silent|info|verbose>] [--dotenv] [-e, --extends=<layer-name>] [--name=<name>] [--no-serve]
```


The `analyze` command builds Nuxt and analyzes the production bundle (experimental).

## Arguments


| Argument      | Description                                    |
|---------------|------------------------------------------------|
| `ROOTDIR="."` | Specifies the working directory (default: `.`) |


## Options


| Option                               | Default   | Description                                                                      |
|--------------------------------------|-----------|----------------------------------------------------------------------------------|
| `--cwd=<directory>`                  |           | Specify the working directory, this takes precedence over ROOTDIR (default: `.`) |
| `--logLevel=<silent\|info\|verbose>` |           | Specify build-time log level                                                     |
| `--dotenv`                           |           | Path to `.env` file to load, relative to the root directory                      |
| `-e, --extends=<layer-name>`         |           | Extend from a Nuxt layer                                                         |
| `--name=<name>`                      | `default` | Name of the analysis                                                             |
| `--no-serve`                         |           | Skip serving the analysis results                                                |


::note
This command sets `process.env.NODE_ENV` to `production`.
::
