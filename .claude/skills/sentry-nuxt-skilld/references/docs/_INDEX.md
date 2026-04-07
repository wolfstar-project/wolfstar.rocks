---
total: 26
---

# Docs Index

- [Adding a New CDN Bundle](./adding-cdn-bundle.md): This guide explains how to create a new CDN bundle for the browser package that includes a specific combination of features.
- [Commit, Issue & PR guidelines](./commit-issue-pr-guidelines.md): For commit messages, we use the format:
- [Creating a new SDK](./creating-a-new-sdk.md): While each SDK (e.g. @sentry/react or @sentry/nextjs) is somewhat unique, we try to follow some general themes when
creating a new SDK.
- [Event processing & sending](./event-sending.md): This document gives an outline for how event sending works, and which which places it goes through.
- [Gitflow](./gitflow.md): We use Gitflow as a branching model.
- [New SDK Release Checklist](./new-sdk-release-checklist.md): This page serves as a checklist of what to do when releasing a new SDK for the first time.
- [PR reviews](./pr-reviews.md): Make sure to open PRs against develop branch.
- [Publishing a Release](./publishing-a-release.md): These steps are only relevant to Sentry employees when preparing and publishing a new SDK release.
- [How Trace Propagation Works in the JavaScript SDKs](./trace-propagation.md): Trace propagation describes how and when traceId & spanId are set and send for various types of events.
How this behaves varies a bit from Browser ...
- [Triaging](./triaging.md): The term triage originally comes from medicine and describes the process of quickly examining patients who are taken
to a hospital in order to deci...
- [Using yalc for Local SDK Testing](./using-yalc.md): Yalc is a simple local dependency repository which we can use to work with local
versions of our SDKs. This is a good alternative to npm|yarn link ...
- [Initializing the SDK in v8](./v8-initializing.md): In v8, manual initialization of the SDK will work as follows.
- [New Performance APIs in v8](./v8-new-performance-apis.md): In v8.0.0, we moved to new performance APIs. These APIs have been introduced in v7, so they can already be used there.
However, in v8 we have remov...
- [Using @sentry/node in v8](./v8-node.md): With v8, @sentry/node has been completely overhauled. It is now powered by OpenTelemetry
under the hood.

## changelog (5)

- [Changelog for Sentry SDK 4.x](./changelog/v4.md): Sentry SDK v4 is no longer supported. We recommend migrating to the latest version of the SDK. You can start by
migrating from v4 of the SDK to v5 ...
- [Changelog for Sentry SDK 5.x](./changelog/v5.md): Sentry SDK v5 is no longer supported. We recommend migrating to the latest version of the SDK. There was no breaking
changes introduced in v6 of th...
- [Changelog for Sentry SDK 6.x](./changelog/v6.md): Sentry SDK v6 is no longer supported. We recommend migrating to the latest version of the SDK. You can start by
migrating from v6 of the SDK to v7 ...
- [Changelog for Sentry SDK 7.x](./changelog/v7.md): Sentry SDK v7 is no longer supported. We recommend migrating to the latest version of the SDK. You can migrate
from v7 of the SDK to v8 by followin...
- [Changelog for Sentry SDK 8.x](./changelog/v8.md): Support for Sentry SDK v8 will be dropped soon. We recommend migrating to the latest version of the SDK. You can migrate
from v8 of the SDK to v9 b...

## migration (7)

- [Continuous Profiling API Changes](./migration/continuous-profiling.md): The continuous profiling API has been redesigned to give developers more explicit control over profiling sessions while maintaining ease of use. Th...
- [End of Feedback Beta](./migration/feedback.md): With the release of 8.0.0, Sentry Feedback is now out of Beta. This means that the usual stability guarantees apply.
- [End of Replay Beta](./migration/replay.md): Sentry Replay is now out of Beta. This means that the usual stability guarantees apply.
- [Upgrading from 4.x to 5.x/6.x](./migration/v4-to-v5_v6.md): We recommend upgrading from 4.x to 6.x directly. Migrating from 5.x to 6.x has no breaking changes to the SDK's
API.
- [Upgrading from 6.x to 7.x](./migration/v6-to-v7.md): The v7 version of the JavaScript SDK requires a self-hosted version of Sentry 20.6.0 or higher.
- [Upgrading from 7.x to 8.x](./migration/v7-to-v8.md): The main goal of version 8 is to improve our performance monitoring APIs, integrations API, and ESM support. This
version is breaking because we re...
- [Deprecations in 9.x](./migration/v8-to-v9.md): The internal SDK logger export from @sentry/core has been deprecated in favor of the debug export. debug only exposes log, warn, and error methods ...
