# AI SDK Integration

> Capture token usage, tool calls, model info, and streaming metrics from the Vercel AI SDK into wide events. Wrap your model and get full AI observability.

`evlog/ai` gives you full AI observability by wrapping your model with middleware and an optional telemetry integration. Token usage, tool calls, tool execution timing, streaming performance, cache hits, reasoning tokens, cost estimation — all captured into the wide event automatically.

<code-collapse>

```txt [Prompt]
Add AI observability to my app with evlog.

- Install the AI SDK: pnpm add ai
- Import createAILogger and createEvlogIntegration from 'evlog/ai'
- Create an AI logger with createAILogger(log) where log is your request logger
- Wrap your model with ai.wrap('anthropic/claude-sonnet-4.6') and pass it to generateText, streamText, etc.
- Token usage, tool calls, streaming metrics, and errors are captured automatically into the wide event
- For deeper observability (tool execution timing, total generation wall time), add createEvlogIntegration(ai) to experimental_telemetry.integrations
- For embedding calls, use ai.captureEmbed({ usage, model, dimensions, count }) after embed() or embedMany()
- For cost estimation, pass a cost map: createAILogger(log, { cost: { 'claude-sonnet-4.6': { input: 3, output: 15 } } })
- Works with all frameworks: Nuxt, Express, Hono, Fastify, NestJS, Elysia, standalone

Docs: https://www.evlog.dev/logging/ai-sdk
Adapters: https://www.evlog.dev/adapters
```

</code-collapse>

## Install

Add the AI SDK as a dependency:

<code-group>

```bash [npm]
npm install ai
```

```bash [bun]
bun add ai
```

```bash [pnpm]
pnpm add ai
```

</code-group>

## Quick Start

Two lines to add, one param to change:

<code-group>

```typescript [Before]
export default defineEventHandler(async (event) => {
  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    messages,
  })
  return result.toTextStreamResponse()
})
```

```typescript [After]
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log)

  const result = streamText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    messages,
  })
  return result.toTextStreamResponse()
})
```

</code-group>

Your wide event now includes:

```json [Wide Event]
{
  "method": "POST",
  "path": "/api/chat",
  "status": 200,
  "duration": "4.5s",
  "ai": {
    "calls": 1,
    "model": "claude-sonnet-4.6",
    "provider": "anthropic",
    "inputTokens": 3312,
    "outputTokens": 814,
    "totalTokens": 4126,
    "reasoningTokens": 225,
    "finishReason": "stop",
    "msToFirstChunk": 234,
    "msToFinish": 4500,
    "tokensPerSecond": 180
  }
}
```

## How It Works

`createAILogger(log, options?)` returns an `AILogger` with the following methods:

<table>
<thead>
  <tr>
    <th>
      Method
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        wrap(model)
      </code>
    </td>
    
    <td>
      Wraps a language model with middleware. Accepts a model string (e.g. <code>
        'anthropic/claude-sonnet-4.6'
      </code>
      
      ) or a <code>
        LanguageModelV3
      </code>
      
       object. Works with <code>
        generateText
      </code>
      
      , <code>
        streamText
      </code>
      
      , and <code>
        ToolLoopAgent
      </code>
      
      . Also works with pre-wrapped models (e.g. from supermemory).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        captureEmbed(result)
      </code>
    </td>
    
    <td>
      Manually captures token usage, model info, and dimensions from <code>
        embed()
      </code>
      
       or <code>
        embedMany()
      </code>
      
       results (embedding models use a different type).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getMetadata()
      </code>
    </td>
    
    <td>
      Returns a snapshot of the current execution metadata (<code>
        AIMetadata
      </code>
      
      ) — same shape as the <code>
        ai
      </code>
      
       field on the wide event. Safe to call inside <code>
        onFinish
      </code>
      
      , after <code>
        await generateText()
      </code>
      
      , or while a stream is in progress.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getEstimatedCost()
      </code>
    </td>
    
    <td>
      Returns the current estimated cost in dollars, or <code>
        undefined
      </code>
      
       if no <code>
        cost
      </code>
      
       map was provided. Convenience for <code>
        getMetadata().estimatedCost
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        onUpdate(callback)
      </code>
    </td>
    
    <td>
      Subscribes to metadata updates. Fires on every step, every <code>
        captureEmbed
      </code>
      
       call, on errors, and on <code>
        createEvlogIntegration
      </code>
      
      's <code>
        onFinish
      </code>
      
      . Returns an unsubscribe function.
    </td>
  </tr>
</tbody>
</table>

The middleware intercepts calls at the provider level. It does not touch your callbacks, prompts, or responses. Captured data flows through the normal evlog pipeline (sampling, enrichers, drains) and ends up in Axiom, Better Stack, or wherever you drain to.

### Options

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        toolInputs
      </code>
    </td>
    
    <td>
      <code>
        boolean | ToolInputsOptions
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      When enabled, <code>
        toolCalls
      </code>
      
       contains <code>
        { name, input }
      </code>
      
       objects instead of plain strings. Opt-in because inputs can be large and may contain sensitive data.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cost
      </code>
    </td>
    
    <td>
      <code>
        Record<string, ModelCost>
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Pricing map for cost estimation. Keys are model IDs, values are <code>
        { input, output }
      </code>
      
       in dollars per 1M tokens.
    </td>
  </tr>
</tbody>
</table>

Pass `true` to capture all inputs as-is, or an options object for fine-grained control:

<table>
<thead>
  <tr>
    <th>
      Sub-option
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        maxLength
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      Truncate stringified inputs exceeding this character length (appends <code>
        …
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transform
      </code>
    </td>
    
    <td>
      <code>
        (input, toolName) => unknown
      </code>
    </td>
    
    <td>
      Custom transform applied before <code>
        maxLength
      </code>
      
      . Use to redact fields or reshape data.
    </td>
  </tr>
</tbody>
</table>

```typescript [server/api/chat.post.ts]
// Capture everything
const ai = createAILogger(log, { toolInputs: true })

// Truncate long inputs (e.g. SQL queries)
const ai = createAILogger(log, { toolInputs: { maxLength: 200 } })

// Redact sensitive tool inputs
const ai = createAILogger(log, {
  toolInputs: {
    maxLength: 500,
    transform: (input, toolName) => {
      if (toolName === 'queryDB') return { sql: '***' }
      return input
    },
  },
})

// Cost estimation
const ai = createAILogger(log, {
  cost: {
    'claude-sonnet-4.6': { input: 3, output: 15 },
    'gpt-4o': { input: 2.5, output: 10 },
  },
})
```

## Usage Patterns

### streamText

The most common pattern, streaming chat with full observability:

```typescript [server/api/chat.post.ts]
import { streamText } from 'ai'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log)
  const { messages } = await readBody(event)

  log.set({ action: 'chat', messagesCount: messages.length })

  const result = streamText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    messages,
    onFinish: ({ text }) => {
      // Your code, no conflict with evlog
      saveConversation(text)
    },
  })

  return result.toTextStreamResponse()
})
```

### generateText

Synchronous generation, the middleware captures the result automatically:

```typescript [server/api/summarize.post.ts]
import { generateText } from 'ai'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log)

  const result = await generateText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    prompt: 'Summarize this document',
  })

  return { text: result.text }
})
```

### Multi-step agents

The middleware fires for each step automatically. Steps, tool calls, and tokens are all accumulated across the agent loop:

```typescript [server/api/agent.post.ts]
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs } from 'ai'
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const { messages } = await readBody(event)
  const ai = createAILogger(log, {
    toolInputs: { maxLength: 500 },
  })

  const agent = new ToolLoopAgent({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    tools: { searchWeb, queryDatabase },
    stopWhen: stepCountIs(5),
  })

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  })
})
```

Wide event after a 3-step agent run:

```json [Wide Event]
{
  "ai": {
    "calls": 3,
    "steps": 3,
    "model": "claude-sonnet-4.6",
    "provider": "anthropic",
    "inputTokens": 4500,
    "outputTokens": 1200,
    "totalTokens": 5700,
    "finishReason": "stop",
    "toolCalls": [
      { "name": "searchWeb", "input": { "query": "TypeScript 6.0 features" } },
      { "name": "queryDatabase", "input": { "sql": "SELECT * FROM docs WHERE topic = 'typescript'" } },
      { "name": "searchWeb", "input": { "query": "TypeScript 6.0 release date" } }
    ],
    "responseId": "msg_01XFDUDYJgAACzvnptvVoYEL",
    "stepsUsage": [
      { "model": "claude-sonnet-4.6", "inputTokens": 1200, "outputTokens": 300, "toolCalls": ["searchWeb"] },
      { "model": "claude-sonnet-4.6", "inputTokens": 1500, "outputTokens": 400, "toolCalls": ["queryDatabase", "searchWeb"] },
      { "model": "claude-sonnet-4.6", "inputTokens": 1800, "outputTokens": 500 }
    ],
    "msToFirstChunk": 312,
    "msToFinish": 8200,
    "tokensPerSecond": 146
  }
}
```

### RAG (embed + generate)

Use `captureEmbed` for embedding calls. They use a different model type that cannot be wrapped with middleware:

```typescript [server/api/rag.post.ts]
import { embed, generateText } from 'ai'
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log)

  const { embedding, usage } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  })
  ai.captureEmbed({
    usage,
    model: 'text-embedding-3-small',
    dimensions: 1536,
  })

  const docs = await findSimilar(embedding)

  const result = await generateText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    prompt: buildPrompt(docs),
  })

  return { text: result.text }
})
```

For `embedMany`, pass the batch count:

```typescript
const { embeddings, usage } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: documents,
})
ai.captureEmbed({ usage, model: 'text-embedding-3-small', count: documents.length })
```

### Multiple models

Wrap each model separately, they share the same accumulator. When multiple models are used, the wide event includes both `model` (last model) and `models` (all unique models):

<code-group>

```typescript [server/api/chat.post.ts]
const ai = createAILogger(log)

const fast = ai.wrap('anthropic/claude-haiku-4.5')
const smart = ai.wrap('anthropic/claude-sonnet-4.6')

const classification = await generateText({ model: fast, prompt: classifyPrompt })
const response = await generateText({ model: smart, prompt: detailedPrompt })
```

```json [Wide Event]
{
  "ai": {
    "calls": 2,
    "model": "claude-sonnet-4.6",
    "models": ["claude-haiku-4.5", "claude-sonnet-4.6"],
    "provider": "anthropic",
    "inputTokens": 450,
    "outputTokens": 300,
    "totalTokens": 750
  }
}
```

</code-group>

### Model object support

`wrap()` also accepts model objects from provider SDKs if you prefer explicit imports:

```typescript [server/api/chat.post.ts]
import { anthropic } from '@ai-sdk/anthropic'

const model = ai.wrap(anthropic('claude-sonnet-4.6'))
```

## Accessing Metadata in Your Code

The wide event already contains the full metadata object, but you often want the same data inside your handler — to persist it, surface it to end-users, bill against it, or stream incremental progress to the client.

`AILogger` exposes three methods for that, with no need to touch internal state:

### `getMetadata()` — final snapshot

Returns a structured `AIMetadata` object that mirrors the `ai` field on the wide event. Safe to call at any point, including after the run completes or inside the AI SDK's `onFinish`:

```typescript [server/api/chat.post.ts]
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'
import { generateText } from 'ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log, {
    cost: { 'claude-sonnet-4.6': { input: 3, output: 15 } },
  })

  await generateText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    prompt: 'Summarize this document',
  })

  const metadata = ai.getMetadata()

  await db.aiRuns.insert({
    userId: event.context.userId,
    model: metadata.model,
    inputTokens: metadata.inputTokens,
    outputTokens: metadata.outputTokens,
    estimatedCost: metadata.estimatedCost,
    finishReason: metadata.finishReason,
    responseId: metadata.responseId,
  })

  return { ok: true }
})
```

The snapshot is a fresh copy: mutating it never affects the underlying state or subsequent calls.

### `getEstimatedCost()` — quick cost check

Convenience for `getMetadata().estimatedCost`. Returns the cost in dollars, or `undefined` if no `cost` map was provided or the model is not in the map.

```typescript
const ai = createAILogger(log, {
  cost: { 'claude-sonnet-4.6': { input: 3, output: 15 } },
})

await generateText({ model: ai.wrap('anthropic/claude-sonnet-4.6'), prompt })

const cost = ai.getEstimatedCost()
console.log(`This call cost $${cost?.toFixed(4)}`)
```

### `onUpdate(callback)` — incremental updates

Subscribe to metadata updates. The callback fires every time the underlying state flushes:

- Once per step in multi-step agent runs
- Once per `captureEmbed` call
- On model errors
- On `createEvlogIntegration`'s `onFinish`

Each invocation receives a fresh snapshot. Returns an unsubscribe function. Subscriber errors are isolated and never break the AI flow.

```typescript [server/api/agent.post.ts]
import { ToolLoopAgent, createAgentUIStreamResponse, stepCountIs } from 'ai'
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const { messages } = await readBody(event)
  const ai = createAILogger(log)

  ai.onUpdate((metadata) => {
    pushToClient(event, {
      type: 'ai-progress',
      step: metadata.steps,
      tokens: metadata.totalTokens,
      cost: metadata.estimatedCost,
    })
  })

  const agent = new ToolLoopAgent({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    tools: { searchWeb, queryDatabase },
    stopWhen: stepCountIs(5),
  })

  return createAgentUIStreamResponse({ agent, uiMessages: messages })
})
```

For one-off cleanup:

```typescript
const off = ai.onUpdate((metadata) => { /* ... */ })
// later
off()
```

### `AIMetadata` shape

`AIMetadata` is a public type alias for the snapshot returned by `getMetadata()` and passed to `onUpdate` listeners. It has the same shape as the `ai` field on the wide event — see [Captured Data](#captured-data) for the full field reference.

```typescript
import type { AIMetadata, AIMetadataListener } from 'evlog/ai'

function handleProgress(metadata: AIMetadata) {
  console.log(`${metadata.calls} calls, $${metadata.estimatedCost ?? 0}`)
}

const listener: AIMetadataListener = handleProgress
ai.onUpdate(listener)
```

## Telemetry Integration

For deeper observability — tool execution timing, success/failure tracking, and total generation wall time — use `createEvlogIntegration()`. It implements the AI SDK's `TelemetryIntegration` interface and captures data that middleware alone cannot see.

### Combined with middleware (recommended)

When passed an `AILogger`, the integration shares its accumulator. Both paths write to the same `ai.*` field:

```typescript [server/api/agent.post.ts]
import { generateText } from 'ai'
import { createAILogger, createEvlogIntegration } from 'evlog/ai'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const ai = createAILogger(log)

  const result = await generateText({
    model: ai.wrap('anthropic/claude-sonnet-4.6'),
    tools: { getWeather, searchDB },
    experimental_telemetry: {
      isEnabled: true,
      integrations: [createEvlogIntegration(ai)],
    },
  })

  return { text: result.text }
})
```

Your wide event now includes tool execution details:

```json [Wide Event]
{
  "ai": {
    "calls": 2,
    "steps": 2,
    "model": "claude-sonnet-4.6",
    "provider": "anthropic",
    "inputTokens": 3500,
    "outputTokens": 800,
    "totalTokens": 4300,
    "toolCalls": ["getWeather", "searchDB"],
    "tools": [
      { "name": "getWeather", "durationMs": 150, "success": true },
      { "name": "searchDB", "durationMs": 45, "success": true }
    ],
    "totalDurationMs": 2340,
    "msToFirstChunk": 180,
    "msToFinish": 2100,
    "tokensPerSecond": 380
  }
}
```

### Standalone (without middleware)

If your model is already wrapped (e.g. by another middleware), pass the request logger directly:

```typescript [server/api/chat.post.ts]
import { createEvlogIntegration } from 'evlog/ai'

const integration = createEvlogIntegration(log)

const result = await generateText({
  model: somePreWrappedModel,
  experimental_telemetry: {
    isEnabled: true,
    integrations: [integration],
  },
})
```

### What the integration captures

<table>
<thead>
  <tr>
    <th>
      Data
    </th>
    
    <th>
      Source
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        ai.tools[]
      </code>
    </td>
    
    <td>
      <code>
        onToolCallFinish
      </code>
    </td>
    
    <td>
      Per-tool <code>
        name
      </code>
      
      , <code>
        durationMs
      </code>
      
      , <code>
        success
      </code>
      
      , and <code>
        error
      </code>
      
       (if failed)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.totalDurationMs
      </code>
    </td>
    
    <td>
      <code>
        onStart
      </code>
      
       → <code>
        onFinish
      </code>
    </td>
    
    <td>
      Total wall time from generation start to completion
    </td>
  </tr>
</tbody>
</table>

The middleware captures tokens, model info, and streaming metrics. The integration captures tool execution timing. Together, they give you complete AI observability.

## Captured Data

<table>
<thead>
  <tr>
    <th>
      Wide event field
    </th>
    
    <th>
      Source
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        ai.calls
      </code>
    </td>
    
    <td>
      Call count
    </td>
    
    <td>
      Number of AI calls in this request
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.model
      </code>
    </td>
    
    <td>
      <code>
        response.modelId
      </code>
    </td>
    
    <td>
      Model that served the response
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.models
      </code>
    </td>
    
    <td>
      All model IDs
    </td>
    
    <td>
      Array of all models used (only when > 1)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.provider
      </code>
    </td>
    
    <td>
      <code>
        model.provider
      </code>
    </td>
    
    <td>
      Provider (<code>
        anthropic
      </code>
      
      , <code>
        openai
      </code>
      
      , <code>
        google
      </code>
      
      , etc.)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.inputTokens
      </code>
    </td>
    
    <td>
      <code>
        usage.inputTokens.total
      </code>
    </td>
    
    <td>
      Total input tokens across all calls
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.outputTokens
      </code>
    </td>
    
    <td>
      <code>
        usage.outputTokens.total
      </code>
    </td>
    
    <td>
      Total output tokens across all calls
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.totalTokens
      </code>
    </td>
    
    <td>
      Computed
    </td>
    
    <td>
      <code>
        inputTokens + outputTokens
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.cacheReadTokens
      </code>
    </td>
    
    <td>
      <code>
        usage.inputTokens.cacheRead
      </code>
    </td>
    
    <td>
      Tokens served from prompt cache
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.cacheWriteTokens
      </code>
    </td>
    
    <td>
      <code>
        usage.inputTokens.cacheWrite
      </code>
    </td>
    
    <td>
      Tokens written to prompt cache
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.reasoningTokens
      </code>
    </td>
    
    <td>
      <code>
        usage.outputTokens.reasoning
      </code>
    </td>
    
    <td>
      Reasoning tokens (extended thinking)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.finishReason
      </code>
    </td>
    
    <td>
      <code>
        finishReason.unified
      </code>
    </td>
    
    <td>
      Why generation ended (<code>
        stop
      </code>
      
      , <code>
        tool-calls
      </code>
      
      , etc.)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.toolCalls
      </code>
    </td>
    
    <td>
      Content / stream chunks
    </td>
    
    <td>
      <code>
        string[]
      </code>
      
       of tool names by default, or <code>
        Array<{ name, input }>
      </code>
      
       when <code>
        toolInputs
      </code>
      
       is enabled
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.responseId
      </code>
    </td>
    
    <td>
      <code>
        response.id
      </code>
    </td>
    
    <td>
      Provider-assigned response ID (e.g. Anthropic's <code>
        msg_...
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.steps
      </code>
    </td>
    
    <td>
      Step count
    </td>
    
    <td>
      Number of LLM calls (only when > 1)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.stepsUsage
      </code>
    </td>
    
    <td>
      Per-step accumulation
    </td>
    
    <td>
      Per-step token and tool call breakdown (only when > 1 step)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.msToFirstChunk
      </code>
    </td>
    
    <td>
      Stream timing
    </td>
    
    <td>
      Time to first text chunk (streaming only)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.msToFinish
      </code>
    </td>
    
    <td>
      Stream timing
    </td>
    
    <td>
      Total stream duration (streaming only)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.tokensPerSecond
      </code>
    </td>
    
    <td>
      Computed
    </td>
    
    <td>
      Output tokens per second (streaming only)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.error
      </code>
    </td>
    
    <td>
      Error capture
    </td>
    
    <td>
      Error message if a model call fails
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.tools
      </code>
    </td>
    
    <td>
      <code>
        TelemetryIntegration
      </code>
    </td>
    
    <td>
      Per-tool <code>
        { name, durationMs, success, error? }
      </code>
      
       (requires <code>
        createEvlogIntegration
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.totalDurationMs
      </code>
    </td>
    
    <td>
      <code>
        TelemetryIntegration
      </code>
    </td>
    
    <td>
      Total generation wall time (requires <code>
        createEvlogIntegration
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.embedding
      </code>
    </td>
    
    <td>
      <code>
        captureEmbed
      </code>
    </td>
    
    <td>
      <code>
        { model?, tokens, dimensions?, count? }
      </code>
      
       — embedding metadata
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ai.estimatedCost
      </code>
    </td>
    
    <td>
      Computed
    </td>
    
    <td>
      Estimated cost in dollars (requires <code>
        cost
      </code>
      
       option)
    </td>
  </tr>
</tbody>
</table>

## Composability

`ai.wrap()` works with models that are already wrapped by other tools. If you use supermemory, guardrails middleware, or any other model wrapper, pass the wrapped model to `ai.wrap()`:

```typescript [server/api/chat.post.ts]
import { createAILogger } from 'evlog/ai'
import { withSupermemory } from '@supermemory/tools/ai-sdk'
import { createGateway } from 'ai'

const gateway = createGateway({ ... })
const ai = createAILogger(log)
const base = gateway('anthropic/claude-sonnet-4.6')
const model = ai.wrap(withSupermemory(base, 'your-org-id', { mode: 'full' }))
```

For explicit middleware composition, use `createAIMiddleware` to get the raw middleware and compose it yourself via `wrapLanguageModel`:

```typescript [server/api/chat.post.ts]
import { createAIMiddleware } from 'evlog/ai'
import { wrapLanguageModel } from 'ai'

const model = wrapLanguageModel({
  model: base,
  middleware: [createAIMiddleware(log, { toolInputs: true }), otherMiddleware],
})
```

`createAIMiddleware` returns the same middleware that `createAILogger` uses internally. The difference: `createAIMiddleware` does not include `captureEmbed` (embedding models don't use middleware). Use `createAILogger` for the full API, `createAIMiddleware` when you need explicit middleware ordering.

## Error Handling

If a model call fails, the middleware captures the error into the wide event before re-throwing:

```json [Wide Event]
{
  "ai": {
    "calls": 1,
    "model": "claude-sonnet-4.6",
    "provider": "anthropic",
    "finishReason": "error",
    "error": "API rate limit exceeded"
  }
}
```

Stream errors (e.g. content filter) are also captured from the stream's error chunks.

## Works With All Frameworks

`evlog/ai` works with any framework that evlog supports:

<code-group>

```typescript [Nuxt]
import { useLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

const log = useLogger(event)
const ai = createAILogger(log)
```

```typescript [Express]
import { createAILogger } from 'evlog/ai'

app.post('/api/chat', (req, res) => {
  const ai = createAILogger(req.log)
  // ...
})
```

```typescript [Hono]
import { createAILogger } from 'evlog/ai'

app.post('/api/chat', (c) => {
  const ai = createAILogger(c.get('log'))
  // ...
})
```

```typescript [Fastify]
import { createAILogger } from 'evlog/ai'

app.post('/api/chat', async (request) => {
  const ai = createAILogger(request.log)
  // ...
})
```

```typescript [NestJS]
import { useLogger } from 'evlog/nestjs'
import { createAILogger } from 'evlog/ai'

const log = useLogger()
const ai = createAILogger(log)
```

```typescript [Standalone]
import { createLogger } from 'evlog'
import { createAILogger } from 'evlog/ai'

const log = createLogger()
const ai = createAILogger(log)
// ...
log.emit()
```

</code-group>



---

- [Wide Events](/logging/wide-events)
- [Adapters](/adapters/overview)
