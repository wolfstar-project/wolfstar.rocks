---
number: 34653
title: Set custom headers for refresh function of useAsyncData/useFetch
category: Questions
created: 2026-03-20
url: "https://github.com/nuxt/nuxt/discussions/34653"
upvotes: 1
comments: 2
answered: true
---

# Set custom headers for refresh function of useAsyncData/useFetch

I currently have this composable:
```
import type { GroupTimelogs } from '~~/shared/types/graphql/GroupTimelogs'

export const useGroupTimelogs = async (groupId: unknown) => {
  const requestFetch = useRequestFetch()

  const { data: groupTimelogs, error: groupTimelogsError, pending: groupTimelogsPending, refresh: refreshGroupTimelogs } = await useLazyAsyncData<GroupTimelogs['students']>(`group-${groupId}-timelogs`, () => requestFetch(`/api/gitlab/groups/${groupId}/timelogs`))

  return {
    groupTimelogs,
    groupTimelogsError,
    groupTimelogsPending,
    refreshGroupTimelogs,
  }
}
```

I want to set a no-cache header for the refresh function to bypass my caching logic on my server route. Is there a easy way to do that?

---

## Accepted Answer

You can control the headers by making the fetch options reactive, or by wrapping the refresh call. Since `useLazyAsyncData` re-executes the fetcher function on `refresh()`, you just need to make the headers dynamic inside the fetcher.

Here's the cleanest approach:

```ts
import type { GroupTimelogs } from '~~/shared/types/graphql/GroupTimelogs'

export const useGroupTimelogs = async (groupId: unknown) => {
  const requestFetch = useRequestFetch()
  const skipCache = ref(false)

  const { data, error, pending, refresh: _refresh } = await useLazyAsyncData<GroupTimelogs['students']>(
    `group-${groupId}-timelogs`,
    () => requestFetch(`/api/gitlab/groups/${groupId}/timelogs`, {
      headers: skipCache.value
        ? { 'Cache-Control': 'no-cache' }
        : {},
    })
  )

  const refreshGroupTimelogs = async () => {
    skipCache.value = true
    await _refresh()
    skipCache.value = false
  }

...