---
number: 2135
title: "Bug: Within mounted component Vue warns about slot outside render function"
type: bug
state: open
created: 2023-07-21
url: "https://github.com/vuejs/test-utils/issues/2135"
reactions: 2
comments: 0
labels: "[bug]"
---

# Bug: Within mounted component Vue warns about slot outside render function




**Describe the bug**


When calling slot content within an `onBeforeUpdate` hook, Vue will incorrectly warn `[Vue warn]: Slot "X" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead. `

This does not happen outside of VTU tests.
https://play.vuejs.org/#eNqtVdGO0zoQ/ZXZINGuaJPlstK9N2wXAQIJhACxwAvhIZs4rRfHtmynFFX9d2ZsJ03LLrywD1t75ng8c854sk2eap2uO5bkyYWtDNcOLHOdviwkb7UyDrZgWAM7aIxqYYLQyeB6rlod7WlGG4p06D4/8J9HQCEvsnAb3oMbx1otSsdwB3DhkX6Jm94F98rKcSXtoki2UJeuhF2RRFQ8NOwOzjVKjRz0xyVIZh2rwQrlctj2AXejANlBUsE0uuTIH3yU9YEjmSV0RXpjkeCBUG4/v1U...