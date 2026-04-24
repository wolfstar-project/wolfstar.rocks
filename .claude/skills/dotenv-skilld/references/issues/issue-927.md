---
number: 927
title: "Add warning to `README` that suggests people to use other packages"
type: other
state: closed
created: 2026-02-05
url: "https://github.com/motdotla/dotenv/issues/927"
reactions: 2
comments: 2
---

# Add warning to `README` that suggests people to use other packages

It’s been suggested that the maintainers of this module are in agreement with the warning added to it on npmx.dev:

<img width="1206" height="828" alt="Image" src="https://github.com/user-attachments/assets/8bfdfc66-8f3b-40e2-96e8-b328e520a17a" />

If that’s the case, may I suggest adding something like the following to the beginning of the `README` so that people who find this package through eg. GitHub or npm’s website will be equally informed:

```markdown
> [!WARNING]
> The [community](https://e18e.dev/docs/replacements/) has flagged this package as having more performant alternatives. [Learn more](https://github.com/es-tooling/module-replacements/blob/main/docs/modules/dotenv.md)
```