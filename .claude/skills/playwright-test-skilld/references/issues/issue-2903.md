---
number: 2903
title: "[Feature] Support for touch events/gestures"
type: other
state: closed
created: 2020-07-10
url: "https://github.com/microsoft/playwright/issues/2903"
reactions: 157
comments: 50
labels: "[P3-collecting-feedback]"
---

# [Feature] Support for touch events/gestures

**Note from maintainers**

At this time, we don’t plan to add native support for touch event emulation in Playwright. Clicks and other mouse actions already generate the corresponding `PointerEvents`, which is the modern and widely supported standard.

For projects that depend on legacy `TouchEvents`, we recommend using the approaches described in our [guide]( https://playwright.dev/docs/touch-events). These cover some scenarios where touch events are still required.

---

Web apps running on touch devices (e.g, mobile and Surface) rely on touch gestures like swiping and pinching to zoom. While `page.dispatchEvent` can manufacture synthetic touch points, having a simpler API would improve the dev experience.

Scenarios
1. Two-finger pinch to zoom in/out on a particular element (e.g., canvas in Azure ML designer)
2. Verify that two-finger left/right swipe is not leading to go back/forward

---

## Top Comments

**@olexandr13** (+35):

+swipe

**@blimmer** (+6):

I found this issue because I wanted to be able to drag an element using touch events as described in https://github.com/microsoft/playwright/issues/12599. It looks like I might be able to dispatch the events (see https://github.com/microsoft/playwright/issues/6072) but it'd be nice to just say "dragto" and have it do the proper `touchstart`, `touchmove` and `touchend` behaviors for me.

**@egreen0** (+9):

Having the ability to swipe, dragto, or even replicate the mouse class for touchscreen would be great. If I could use the touchscreen class to move, press down, move, and unpress, it would take care of a lot of issues that I'm currently having with dragging elements.