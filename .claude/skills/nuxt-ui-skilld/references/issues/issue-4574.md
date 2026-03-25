---
number: 4574
title: How to use a UBanner with a layout based on UDashboardGroup?
type: bug
state: open
created: 2025-07-22
url: "https://github.com/nuxt/ui/issues/4574"
reactions: 5
comments: 8
labels: "[bug, v3, p2-medium]"
---

# How to use a UBanner with a layout based on UDashboardGroup?

### Description

Hi  First of all, thank you for your awesome library — it's been a pleasure to use so far!

I'm trying to use a UBanner in a layout based on UDashboardGroup, which itself contains a UDashboardSidebar and a UDashboardPanel with a UDashboardNavbar.

The issue I'm running into is that the UBanner floats above the layout instead of pushing the UDashboardGroup down. Its height isn't accounted for, so it overlaps with the rest of the layout.

Is there a recommended way to make the layout adapt to the presence of a UBanner, so it pushes the dashboard content accordingly?

Thanks again for your great work!