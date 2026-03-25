---
number: 9070
title: vi.mock not called on GitLab CI but does on local machine
category: "Q&A"
created: 2025-11-21
url: "https://github.com/vitest-dev/vitest/discussions/9070"
upvotes: 2
comments: 3
answered: true
---

# vi.mock not called on GitLab CI but does on local machine

Hi everyone,
I'm migrating my unit tests from jasmine/karma to vitest (as part of angular v21 upgrade). Everything works just fine on my local machine (tried on macOS and Windows) but when I run my tests on GitLab CI, it seems that `vi.mock('...')` is never called and cause failures. I'm absolutly lost on this one ><.

My point is to mock/spy specific npm packages such like `eventsource`. Here is one of my services and it tests : 

...

---

## Accepted Answer

Ugh, finally figured out why my Vitest tests were flaky in GitLab CI! Turns out the default runner was stuck on a single core, and Vitest’s parallel tests were just choking on it—mocks would randomly fail, and everything was a mess. Switched to the gitlab-org-medium runner with more cores, and boom, tests are stable again.