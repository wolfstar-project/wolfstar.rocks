---
number: 139
title: defuFn return wrong expected value while there have multiple default
type: bug
state: open
created: 2024-12-13
url: "https://github.com/unjs/defu/issues/139"
reactions: 0
comments: 1
labels: "[bug]"
---

# defuFn return wrong expected value while there have multiple default

### Environment

node -v            
v22.11.0

### Reproduction

See Describe the bug

### Describe the bug

```ts
import { defuFn } from 'defu'

const filterDist = (val: string[]) => val.filter(i => i !== 'dist')
const addTwenty = (val: number) => val + 20
const addTen = (val: number) => val + 10

const res = defuFn(
  {
    count: addTwenty,
    num: addTen,
    items: filterDist,
  },
  {
    count: 10,
    num: 5,
    items: ['node_modules', 'test'],
  },
  {
    count: 5,
    num: 3,
    items: ['temp', 'dist'],
  },
)

console.dir({ res }, { depth: 5 })

// expected: 
/*
{
  res: {
    count: 30,
    num: 15,
    items: [ "node_modules", "test", "temp"]
  }
}
*/

// received: 
/*
{
  res: {
    count: 30,
    num: 15,
    items: [ "node_modules", "test", "temp", "dist" ]
  }
}
*/

```...

---

## Top Comments

**@byronogis**:

Maybe this is a idea.

```ts
// createDefu
_defu(
  arguments_[0],
  arguments_.slice(1).reduce((p, c) => _defu(p, c, "", merger), {} as any),
    "",
  merger,
)
```