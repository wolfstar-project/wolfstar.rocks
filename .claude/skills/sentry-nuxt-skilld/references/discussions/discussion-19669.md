---
number: 19669
title: "Seeking Assistance: Empty stack trace for \"Maximum call stack size exceeded\" on iOS (Self-hosted Sentry)"
category: "Q&A"
created: 2026-03-06
url: "https://github.com/getsentry/sentry-javascript/discussions/19669"
upvotes: 1
comments: 1
answered: false
---

# Seeking Assistance: Empty stack trace for "Maximum call stack size exceeded" on iOS (Self-hosted Sentry)

Hi Sentry Team,

I am encountering a critical issue with my self-hosted Sentry instance where a "Maximum call stack size exceeded" error is reported exclusively from iOS devices (Safari/Webkit), but the captured stack trace is completely empty or filled with undefined.

Environment:

Sentry Version: [25.11.1]

SDK Version: [sentry.javascript.vue 10.32.1]

Platform: iOS (various versions, mostly ios 26)

Browser: Safari / WKWebView

The Problem:
We’ve been seeing this error for about a month. While Chrome did not send any issue, iOS reports the error but with no stack trace information (frames: [{"filename": "undefined", "lineno": 31, "colno": 70}]).

When I attempt to debug this via Safari Remote Inspector, the entire browser tab freezes immediately upon the stack overflow...

---

## Top Comments

**@Lms24** [maintainer]:

Hey @codinglobster thanks for writing in! If you're able to reproduce this, please open an issue. 

> Empty Stack Trace: Is there a known limitation with how the Sentry SDK captures RangeError on Webkit/JSC engines when a hard stack overflow occurs?

As long as the broweser doesn't crash (or rather the tab), we should be able to capture errors. 

> How can we force Sentry to better associate these "near-death" reports with our uploaded Source Maps?

If we don't have a stack trace, we can't un-minify/symbolicate errors. If I understand correctly, we don't have a stack trace?