---
number: 3105
title: "TypeScript w/ esModuleInterop: `import Sentry from \"@sentry/{node|browser}\"` is not an error, but does not work."
type: other
state: open
created: 2020-12-07
url: "https://github.com/getsentry/sentry-javascript/issues/3105"
reactions: 25
comments: 18
---

# TypeScript w/ esModuleInterop: `import Sentry from "@sentry/{node|browser}"` is not an error, but does not work.




- [X] Review the documentation: https://docs.sentry.io/
- [X] Search for existing issues: https://github.com/getsentry/sentry-javascript/issues
- [X] Use the latest release: https://github.com/getsentry/sentry-javascript/releases
- N/A - Provide a link to the affected event from your Sentry account

Relates to PR https://github.com/getsentry/sentry-javascript/pull/3077

## Package + Version

- [X] `@sentry/browser`
- [X] `@sentry/node`
- [ ] `raven-js`
- [ ] `raven-node` _(raven for node)_
- [ ] other:

### Version:
```
5.29.0
```

## Description
Sentry must be imported using `import * as Sentry` instead of `import Sentry` in order to work.
With the esModuleInterop compiler option enabled, TypeScript does not complain about `import Sentry`.
(With the option off, TS recognizes that the module does not have a default import and forbids `import Sentry`)

This appears to be because the Sentry index.js module declares `__esModule: true` but does not actually have a value for the default export:

```js
 // import Sentry from "@sentry/node" - transpiled
 node_1 = tslib_1.__importDefault(node_1);

 //tslib
 __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
```

Can the library be updated so the default import works as TypeScript thinks it does? 
This is only an issue when the esModuleInterop setting is on, but it's a pretty valuable setting and a dangerous mistake
for the developer.
```
// Either 
// vv - Can this be added?
exports.default = exports;

// Or
// vv - Can this be removed?  Though it would make the `import *` less efficient. 
Object.defineProperty(exports, "__esModule", { value: true });
```

Thanks!