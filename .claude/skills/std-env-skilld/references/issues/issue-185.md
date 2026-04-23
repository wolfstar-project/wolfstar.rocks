---
number: 185
title: kiro agent detection is improperly detecting kiro ide
type: bug
state: open
created: 2026-04-02
url: "https://github.com/unjs/std-env/issues/185"
reactions: 0
comments: 3
labels: "[bug]"
---

# kiro agent detection is improperly detecting kiro ide

### Environment

Node: 24.8.0
std-env: 4.0.0

### Reproduction

Reproduction cannot be provided because it depends on the ide being used.

```
import { isAgent, agent, agentInfo } from "std-env";

console.log({ isAgent, agent, agentInfo });
```

### Describe the bug

When I manually run the code (shown in the reproduction section) in the integrated terminal I get the following results
- kiro ide
```
{ isAgent: true, agent: 'kiro', agentInfo: { name: 'kiro' } }
```
- vs code
```
{ isAgent: false, agent: undefined, agentInfo: {} }
```
- kiro cli
```
{ isAgent: true, agent: 'kiro', agentInfo: { name: 'kiro' } }
```

std-env is not accurately detecting the ide vs the cli

### Additional context

...

---

## Top Comments

**@pi0** [maintainer] (+1):

I guees re vitest issue, adding an additional test hastTTY might help to distinguish terminal of ide from agents.

**@pi0** [maintainer]:

Please clone repo and ask your agent (kiro-cli to run a self test if it can find a unique env var)

**@robokozo**:

I couldn't find anything unique between both. This rabbit hole stemmed from a vitest change that came in recently: https://github.com/vitest-dev/vitest/pull/9851#issuecomment-4181149068

I'll open an issue/feature request on their side. 

In the mean time, I don't know what this project should do.