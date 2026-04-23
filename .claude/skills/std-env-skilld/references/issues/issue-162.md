---
number: 162
title: "`env` isn't working in Cloudflare worker"
type: bug
state: open
created: 2025-07-07
url: "https://github.com/unjs/std-env/issues/162"
reactions: 0
comments: 2
labels: "[bug]"
---

# `env` isn't working in Cloudflare worker

### Environment

I'm not getting environment variables via `std-env` in a new cloudflare worker.

`index.ts`

```typescript
import { env, runtimeInfo } from "std-env";
import { getEnv } from './env';

export default {
	async fetch(request, env_arg, ctx): Promise<Response> {
		console.log({ runtimeInfo, env, env_arg });
		const greeting = env['GREETING'] || getEnv('GREETING') || 'Hello';
		return new Response(`${greeting} World``

`env.ts`

```typescript
// See https://developers.cloudflare.com/workers/runtime-apis/bindings/#importing-env-as-a-global
import { env } from "cloudflare:workers";


...

---

## Top Comments

**@amadsen**:

A quick test with a dynamic import worked.

```
// See https://developers.cloudflare.com/workers/runtime-apis/bindings/#importing-env-as-a-global
// import { env } from "cloudflare:workers";

let env: Record<string, string | undefined>

export const getEnv = async (name: string): Promise<string | undefined> => {
  if (!env) {
    const cw = await import('cloudflare:workers');
    env = cw.env as unknown as Record<string, string | undefined>;
  }
  
  return (env && name in env && typeof env[name] === 'string') ? env[name] : undefined
};
```

**@amadsen**:

I don't know if either method of importing Cloudflare's `cloudflare:workers` module is reasonable for `std-env` because I would expect a static import to cause a import error in a non-Cloudflare environment and a dynamic import requires an async / await access pattern.