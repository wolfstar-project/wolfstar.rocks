---
number: 1122
title: "[Feature] Run Playwright tests on real mobile device browsers?"
type: other
state: open
created: 2020-02-26
url: "https://github.com/microsoft/playwright/issues/1122"
reactions: 590
comments: 75
labels: "[P3-collecting-feedback]"
---

# [Feature] Run Playwright tests on real mobile device browsers?

Is there any way to connect to a device, start a browser (e.g. chromium instance on Android) and run the tests?

If not, what is missing at this point to be able to use it on both Android and iOS?

___
### **Note from maintainers:**

Please refer to the https://playwright.dev/docs/next/api/class-android for
instructions on how to use Playwright with Chrome for Android, Android
WebViews and Android itself
___

---

## Top Comments

**@Filipoliko** (+58):

Since Playwright is trying to be more testing-friendly, it would be really great to have real mobile device support. More and more users are coming to our websites from mobile devices, it is nearly 50:50 for us. Most of our bugs on mobile devices are not discoverable via simple mobile emulation. It is really important for us to be able to test on real mobile devices, or at least on emulated Android/iOS systems.

**@pavelfeldman** [maintainer] (+13):

There is no way to attach to Chromium on Android or MobileSafari on iOS. Playwright aims at running on your desktop and in your CI/CD, targeting device farms is outside its scope.

We will emulate device metrics, geolocation, orientation, etc on Chromium on Android and MobileSafari though. Could you share more about your use case?

**@Kradirhamik** (+20):

Hi, 

I would like to also give support for this idea. Our use cases requires our Angular site to get input from other apps (e.g. BankID for authentication). So the real flow can only be properly tested on a real device.