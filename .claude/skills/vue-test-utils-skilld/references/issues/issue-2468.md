---
number: 2468
title: "Bug: setValue on nested v-model do not correctly update parent"
type: bug
state: open
created: 2024-07-09
url: "https://github.com/vuejs/test-utils/issues/2468"
reactions: 0
comments: 0
labels: "[bug]"
---

# Bug: setValue on nested v-model do not correctly update parent




**Describe the bug**
with nested v-model components, updating the child doesn't propagate changes to the parents, only the direct one.

**To Reproduce**
I setup a PR with a test triggering it. the normal vue behavior can be testing in [this playground](https://play.vuejs.org/#eNqNUk2L2zAU/CsPUUgCqZ3S9mKShXbZw/bQlnbpZVWKsV8SbWVJ6CMNGP/3PkmJN9uEUPDB0oxGM0/Tsw/GFLuArGJL11hh/A1XojPaeujB4hoGWFvdwYRIkxG63QrZHoCiTKuoQgSucJ8oLa7rIEmFK4C29nUF0xmsbmDag0Lnsa1ABSlhmM0jpdEkrVB5V9HN+YIhIZ0Oiuh0OmkBOPT3tGN3tZxmzQMA4LfCFVkeVsBZsmhqS7qcZdIwhze/FovFLC4HruhblmN2WnjsjKw90gpgmZ3sXne6RbniLItzBiXhy/KEzObMu0artdgUT04rmmnyxVnMJiTaL8YLrRxnFDGb4ayWUv/5lPa8DZgSpzNbbH5...