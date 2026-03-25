---
number: 17748
title: Bundle size increases when using Sentry.ErrorBoundary
category: "Q&A"
created: 2025-09-23
url: "https://github.com/getsentry/sentry-javascript/discussions/17748"
upvotes: 1
comments: 2
answered: true
---

# Bundle size increases when using Sentry.ErrorBoundary

My project is using `"@sentry/react": "^9.12.0",`

I noticed drastic change in the bundle size if I use Sentry.ErrorBoundary - from 70k to 350k. See the below pictures:

**without ErrorBoundary**
<img width="1451" height="683" alt="Sentry no ErrorBoundary" src="https://github.com/user-attachments/assets/e4fd309a-0f99-4e1a-a0e3-350fd7d32703" />

**with ErrorBoundary**
<img width="1456" height="731" alt="Sentry ErrorBoundary" src="https://github.com/user-attachments/assets/d76a9f01-b434-4d63-9d5a-1ede25ea93f7" />


The project doesn't need and is not using features like tracing and replay. I even try to include nothing in `integrations` when `init`. I also tried adding this to `webpack` config but still can't reduce the size.
```
      new webpack.DefinePlugin({
        __SENTRY_DEBUG__: false,
        __SENTRY_TRACING__: false,
        __RRWEB_EXCLUDE_IFRAME__: true,
        __RRWEB_EXCLUDE_SHADOW_DOM__: true,
        __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
      }),
```...

---

## Accepted Answer

avoid `export default Sentry` everywhere