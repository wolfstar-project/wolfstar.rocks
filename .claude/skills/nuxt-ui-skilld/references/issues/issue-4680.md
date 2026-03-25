---
number: 4680
title: "Visual Bug when nesting \"UDashboardGroup\" (is it save to remove the \"fixed\" class?)"
type: question
state: open
created: 2025-08-07
url: "https://github.com/nuxt/ui/issues/4680"
reactions: 2
comments: 6
labels: "[question]"
---

# Visual Bug when nesting "UDashboardGroup" (is it save to remove the "fixed" class?)

### Description

We are currently in need of nesting DashboardGroups: We have 1 DashboardGroup inside our layout, and one DashboardGroup inside a page, with 3 DashboardPanels as its children, to split the content area in 3.

Now having these 2 DashboardGroups nested, leads to a visual bug, the first DashboardPanel of the page and the DashboardPanel of the layout overlap:

<img width="674" height="513" alt="Image" src="https://github.com/user-attachments/assets/fc9d1d30-f6a9-41a3-a236-2e717c40b57a" />

Now if we take a look at https://ui.nuxt.com/components/dashboard-group, we can see the "fixed" class being set on the dashboard groups. If we remove the "fixed" class on the dashboard groups, the output is as expected:

...