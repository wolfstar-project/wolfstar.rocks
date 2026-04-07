---
number: 17439
title: "How To: Runtime exceptions in RemixJS actions and loaders?"
category: "Q&A"
created: 2025-08-21
url: "https://github.com/getsentry/sentry-javascript/discussions/17439"
upvotes: 1
comments: 1
answered: false
---

# How To: Runtime exceptions in RemixJS actions and loaders?

# How To: Runtime exceptions in RemixJS actions and loaders?

### RemixJS

* @remix-run/express 2.17.0
* @remix-run/node" 2.17.0
* @remix-run/react 2.17.0

### Sentry
* @sentry/remix 9.46.0
* @sentry/node 9.40.0

I've followed the instructions in the documentation Server-Side Performance Monitoring to use `withSentry()` to wrap the `App` component from the root loader.

## Scenario: Runtime exception is caught and sent to Sentry dashboard

### Expectation

Would like this to work with Sentry.

```ts
// 🚫  Does not send to Sentry dashboard
 
export const action = async ({ request }: ActionFunctionArgs) => {
    throw new Error('SentryExampleBackendError: error is raised on the backend.')
    return null
}
```...

---

## Top Comments

**@mydea** [maintainer]:

hey, you should not need to do any of that  
First of all, no need to install `@sentry/node`, just `@sentry/remix` should be enough. This instruments node too under the hood.

If you follow the whole manual setup here:
https://docs.sentry.io/platforms/javascript/guides/remix/manual-setup/

And basically remove other things you are doing, then this should just work out of the box. Express is automatically handled through the remix SDK, no need to do any node/express specific stuff - just follow the remix SDK docs :)