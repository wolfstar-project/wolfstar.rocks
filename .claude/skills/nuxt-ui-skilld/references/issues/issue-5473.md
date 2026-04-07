---
number: 5473
title: v5
type: other
state: open
created: 2025-11-17
url: "https://github.com/nuxt/ui/issues/5473"
reactions: 0
comments: 19
labels: "[release]"
---

# v5

There is no v5 release planned at the moment, I'm just opening this issue to write and remember some breaking changes that we should consider in the future:

- Simplify NavigationMenu to only support horizontal orientation
- Create another NavigationMenu for vertical orientation and merge with ContentNavigation (maybe `NavigationAccordion`?)
- DropdownMenu & ContextMenu item `label` type should have the same size as other components (we might need to introduce a new type)
- Split components that contains multiple UI components like Header and DashboardSidebar mobile menus, it's hard to proxy every prop and events this way
- Rework Dashboard components to use a single root div when resizable + rework provider context
- Uniformize props that extends `ButtonsProps` like `links`, `actions`, et...