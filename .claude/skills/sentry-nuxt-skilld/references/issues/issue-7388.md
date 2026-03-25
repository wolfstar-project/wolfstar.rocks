---
number: 7388
title: "Capture outgoing HTTP request & response bodies with Node SDK"
type: other
state: open
created: 2023-03-09
url: "https://github.com/getsentry/sentry-javascript/issues/7388"
reactions: 8
comments: 3
labels: "[Improvement, Spans, Node.js]"
---

# Capture outgoing HTTP request & response bodies with Node SDK

### Problem Statement

Allow for outgoing HTTP request & response bodies to be added to breadcrumbs/spans.

Similar to work done in https://github.com/getsentry/sentry-javascript/pull/7287

### Solution Brainstorm

**NOT THE DEFAULT** due to PII reasons

Should be gated by `sendDefaultPii`