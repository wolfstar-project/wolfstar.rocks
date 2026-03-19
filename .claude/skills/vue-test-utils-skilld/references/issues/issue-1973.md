---
number: 1973
title: "\"vue-tsc\" fails with \"error TS2769: No overload matches this call\" in \"strict\" mode"
type: bug
state: closed
created: 2023-02-11
url: "https://github.com/vuejs/test-utils/issues/1973"
reactions: 3
comments: 10
labels: "[bug]"
---

# "vue-tsc" fails with "error TS2769: No overload matches this call" in "strict" mode

**Describe the bug**
`vue-tsc` fails with "error TS2769: No overload matches this call" in when "strict" mode is configured in "tsconfig.json".

If the `defineEmits` part in the component is removed `vue-tsc` doesn't complain. Seems that this issue is somehow related with Vue version 3.2.46.

**To Reproduce**
https://stackblitz.com/edit/vitest-dev-vitest-nwzj9x?file=components%2FSlotComponent.vue,test%2FSlotComponent.test.ts,package.json&initialPath=__vitest

**Expected behavior**
`vue-tsc` does not fail for the example given.


---

## Top Comments

**@johnsoncodehk** [maintainer] (+4):

I will check it out next week.

**@cexbrayat** [maintainer] (+1):

Hi @tinobino and thanks for the repro

After looking at your repro, it does look like there is an issue, but I don't know if that should be fixed in Vue core, VTU or Volar.

The error goes away if:
- Vue v3.2.45 is used
- if `defineEmits` is removed
- More surprising, if `<slot />` is removed from the template

Let me ping @johnsoncodehk as he may have some idea of what's going on

**@cexbrayat** [maintainer] (+1):

@johnsoncodehk kindly offered (on another channel) to refactor the types when he has time, so this issue will get fixed, but we can't give you a timeline.

In the meantime, you can still upgrade to the latest vue version, by adding an explication cast `mount(SlotComponent as any, {...})`. We understand this is not ideal, but that should unblock you to update