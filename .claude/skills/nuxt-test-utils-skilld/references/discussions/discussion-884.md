---
number: 884
title: "Testing `import.meta.client` and/or `import.meta.server`"
category: "Q&A"
created: 2024-07-05
url: "https://github.com/nuxt/test-utils/discussions/884"
upvotes: 5
comments: 3
answered: true
---

# Testing `import.meta.client` and/or `import.meta.server`

In one of my modules I have changed occurrences of `process.server` and `process.client` to `import.meta.server` and `import.meta.client`. Previously I was able to write unit tests for both cases (e.g. when a component behaves differently on the client than on the server) by setting `process.server = true` in my test case. However, using `import.meta`, this does not work anymore. E.g. `import.meta.server = true`, which kind of makes sense.

I have searched discussions and issues and wasn't able to find anyone having the same issue, so I'm starting to wonder if maybe I'm approaching this the wrong way anyway? If not, the question would be how I could unit test a component (or any code, really) for different client and server behaviour.

---

## Accepted Answer

In the meantime I found a solution that works for me. Instead of using `import.meta.server` or `import.meta.client` directly, I instead assign them to consts in a file, e.g. `~/helpers/importMeta.ts`:

```ts
export const importMetaServer = import.meta.server
```

And then use it in the code I want to test:

```ts
import { importMetaServer } from '~/helpers/importMeta'

export function useFoobar() {
  if (importMetaServer) {
    return 'server'
  }
  return 'client'
}
```

Then it's possible to mock `importMetaServer` in tests:

```ts
import { useFoobar } from '~/composables/useFoobar'

const metaMock = vi.hoisted(() => ({
  importMetaServer: true,
}))

vi.mock('~/helpers/importMeta', () => metaMock)

function client() {
  metaMock.importMetaServer = false
}

function server() {
  metaMock.importMetaServer = true
}

describe('The composable', () => {
  beforeEach(() => {
    server()
  })

  it('works on server', () => {
    expect(useFoobar()).toEqual('server')
  })

  it('works on client differently', () => {
    client()
    expect(useFoobar()).toEqual('client')
  })
})
```...