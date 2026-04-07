---
number: 16574
title: "Support async configuration for `SentryModule`"
category: "Q&A"
created: 2025-06-12
url: "https://github.com/getsentry/sentry-javascript/discussions/16574"
upvotes: 1
comments: 2
answered: true
---

# Support async configuration for `SentryModule`

### Problem Statement

Is it possible to document whether it is feasible to initialize Sentry with dynamic configuration ? My configuration depends on environment variable and dynamically fetched configurations from remote sources.

I understand the `instrument.ts` file is meant to be called as early as possible to log application initialization errors, but I have healthchecks on my container that will tell me if the app started or not.

### Solution Brainstorm

I would expect something similar to this
```ts
@Global()
@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: SENTRY_CLIENT,
      useFactory: (envService: EnvService, supabaseClient: SupabaseClient): SentryClient => {
        return Sentry.init({
          // usage of envService and supabase client
        }}
      },
      inject: [EnvService, SupabaseClient],
    },
  ],
  exports: [SENTRY_CLIENT],
})
export class SentryModule {}
```...

---

## Accepted Answer

Thanks @Lms24 for your suggestions, I managed to run Sentry with Nest with the late init method as follows:

1. Update `package.json` scripts to require the `@sentry/node/preload.js`
```diff
-    "start": "nest start",
-    "start:dev": "nest start --watch",
-    "start:debug": "nest start --debug --watch",
-    "start:prod": "node dist/main",
+    "start": "nest start -e \"node --import @sentry/node/preload\"",
+    "start:dev": "nest start --watch -e \"node --import @sentry/node/preload\"",
+    "start:debug": "nest start --debug --watch -e \"node --import @sentry/node/preload\"",
+    "start:prod": "node --import @sentry/node/preload dist/main",
```
2. Create my own `SentryModule`

```ts
import { Global, Module } from '@nestjs/common';
import { SentryGlobalFilter, SentryModule as SentryNestModule } from '@sentry/nestjs/setup';
import { SentryService } from './sentry.service';
import { APP_FILTER } from '@nestjs/core';
import { SentryExceptionFilter } from '../filters/http-exception.filter';

@Global()
@Module({
  imports: [SentryNestModule.forRoot()],
  providers: [
    SentryService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
  ],
  exports: [SentryService],
})
export class SentryModule {}
```...