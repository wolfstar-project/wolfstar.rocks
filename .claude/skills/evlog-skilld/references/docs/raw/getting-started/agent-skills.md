# Agent Skills

> AI-assisted code review and evlog adoption using Agent Skills. Let AI review your logging patterns and guide migration to wide events.

evlog includes agent skills that help AI assistants review your logging patterns and guide evlog adoption.

## What are Agent Skills?

Agent Skills is an open specification for packaging AI assistant capabilities. Skills provide:

- **Domain knowledge**: Best practices for wide events and structured errors
- **Code review**: Identify logging anti-patterns in your codebase
- **Guided adoption**: Step-by-step help migrating to evlog

## Available Skills

<table>
<thead>
  <tr>
    <th>
      Skill
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
        skills/review-logging-patterns
      </code>
    </td>
    
    <td>
      Review code for logging patterns, suggest evlog adoption, guide wide event design
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        skills/analyze-logs
      </code>
    </td>
    
    <td>
      Analyze application logs from <code>
        .evlog/logs/
      </code>
      
       to debug errors, investigate performance, and understand behavior
    </td>
  </tr>
</tbody>
</table>

## Installing the Skill

Compatible agents (Cursor, Claude Code, etc.) can discover and use skills automatically.

To manually install with the skills CLI:

```bash [Terminal]
npx skills add hugorcd/evlog
```

## What the Skill Does

### Code Review

The skill analyzes your codebase for:

- **Scattered logging**: Multiple `console.log` or `logger.info` calls in request handlers
- **Missing context**: Logs without user, request, or business context
- **Unhelpful errors**: `throw new Error()` without structured fields
- **Correlation gaps**: Missing request IDs or trace IDs

### Adoption Guidance

The skill helps you:

- Convert traditional logging to wide events
- Design effective wide event schemas
- Implement structured errors with `why`, `fix`, and `link`
- Set up evlog in Nuxt, Nitro, or standalone TypeScript

### Log Analysis

The `analyze-logs` skill teaches your AI assistant to read structured logs from `.evlog/logs/`:

- **Error debugging**: Find and explain errors, stack traces, and failure patterns
- **Performance investigation**: Identify slow requests by duration
- **Request tracing**: Follow a request across its lifecycle using `requestId`
- **Pattern detection**: Spot recurring issues or anomalies

### Example Prompts

Ask your AI assistant:

<code-collapse>

```txt [Prompt]
Review this file for logging anti-patterns
```

</code-collapse>

<code-collapse>

```txt [Prompt]
Help me convert these console.log calls to a wide event
```

</code-collapse>

<code-collapse>

```txt [Prompt]
What context should I add to this wide event?
```

</code-collapse>

<code-collapse>

```txt [Prompt]
How do I structure this error with evlog?
```

</code-collapse>

<code-collapse>

```txt [Prompt]
Why is the checkout endpoint failing?
```

</code-collapse>

<code-collapse>

```txt [Prompt]
Show me the slowest requests from today
```

</code-collapse>

## Skill Structure

```text
skills/
├── review-logging-patterns/
│   ├── SKILL.md              # Main skill instructions
│   └── references/
│       ├── wide-events.md    # Wide event patterns
│       ├── structured-errors.md # Error handling guide
│       └── code-review.md    # Review checklist
└── analyze-logs/
    └── SKILL.md              # Log analysis from .evlog/logs/
```

## Reference Documents

The skill includes reference documents that provide:

### wide-events.md

- Wide event anatomy and best practices
- Context grouping patterns
- Output format examples

### structured-errors.md

- Error field definitions
- Status code guidelines
- Frontend integration patterns

### code-review.md

- Checklist for logging code review
- Common anti-patterns to identify
- Migration suggestions

## Next Steps

- [Quick Start](/getting-started/quick-start) - Get started with evlog
- [Wide Events](/core-concepts/wide-events) - Learn wide event design
- [Structured Errors](/core-concepts/structured-errors) - Error handling patterns



---

- Agent Skills Spec
