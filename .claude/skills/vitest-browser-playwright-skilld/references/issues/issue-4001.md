---
number: 4001
title: Utility to automock class instance
type: other
state: closed
created: 2023-08-22
url: "https://github.com/vitest-dev/vitest/issues/4001"
reactions: 19
comments: 11
labels: "[p2-nice-to-have]"
---

# Utility to automock class instance

### Clear and concise description of the problem

As a developer using vitest I want an easy way to create mock instances of a class. While I can us `vi.mock('module')` to automock the entire file I have to jump thru hoops to get a mock instance, mainly to avoid TypeScript errors

```
import { Class } from 'module'
vi.mock('module')
// @ts-ignore-error Ignore constructor argument errors
const mockInstance  = new Class()
```

`vi.mock` will mock the whole module, so if you wanted another exported value to use the real implementation you need a factory to import the real implementation.

### Suggested solution

```
import { Class } from 'module'
import { vi } from 'vitest'

const mock = vi.mockInstance(Class)
```

### Alternative

_No response_

### Additional context

_No response_

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@hi-ogawa** [maintainer] (+1):

I see. Your concern was the type error on construction. Then I'm not sure if it's really important features to just help silencing type errors.
Do you see more on this feature other than type errors?

EDIT: Well, I actually thought it would be a neat feature if we can expose `mockObject` utility for users to easily simulate automock without concerned with modules.

https://github.com/vitest-dev/vitest/blob/c84113f410d76e15fed3cebd83491f628396b5ab/packages/vitest/src/runtime/mocker.ts#L282

**@sheremet-va** [maintainer] (+1):

> Will #7761 provide this?

`mockObject` follows the same rules that module automocking does. It automocks everything.

**@hi-ogawa** [maintainer]:

Is this already possible with `vi.importMock`? This should return "automock"-ed module without actually setting up module mocking. I made a simple example here:

https://stackblitz.com/edit/vitest-dev-vitest-hnt4sl?file=src%2Fsome.test.ts

```ts
//
// some.test.ts
//
import { vi, test, expect } from 'vitest';

test('repro', async () => {
  const { SomeClass } = await vi.importMock<typeof import('./some-class')>('./some-class');

  const someInstance = new SomeClass();

  // type check works
  vi.mocked(someInstance.someMethod).mockReturnValue('hello');
  expect(someInstance.someMethod(1234)).toMatchInlineSnapshot(`"hello"`);
});


//
// some-class.ts
//
export class SomeClass {
  someMethod(x: number) {
    return String(x);
  }
}
```...