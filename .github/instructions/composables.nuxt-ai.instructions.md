---
applyTo: **/composables/**/*.{ts,js}
---

# Nuxt Composables Best Practices

## Context

Rules for creating and using composables in Nuxt applications. Composables are auto-imported from the composables/ directory.

## Requirements

- Name composables with "use" prefix (e.g., useCounter)
- Return reactive values using ref/reactive
- Handle SSR compatibility in composables
- Implement proper cleanup in onUnmounted when needed
- Use TypeScript for better type inference
- Document composable parameters and return values
- Handle error states within composables
- Use useState for shared state management
- Implement proper disposal of resources
- Consider using async composables with useAsyncData

## Examples

<example>
export async function useAsyncResource<T>(
  key: string,
  fetcher: () => Promise<T>,
) {
  // Use built-in composables
  const nuxtApp = useNuxtApp()

// Use useAsyncData for data fetching
const { data, error, refresh } = await useAsyncData(
key,
() => fetcher(),
{
// Handle errors
onRequestError: ({ error }) => {
console.error(`Failed to fetch ${key}:`, error)
},
// Transform data if needed
transform: response => response,
// Cache management
watch: false,
// SSR options
server: true,
lazy: false,
},
)

// Provide refresh method
async function refetchData() {
await refresh()
}

return {
data: readonly(data),
error: readonly(error),
refresh: refetchData,
}
}

</example>

<example>
import { useState } from '#app'

export interface UseCounterOptions {
initial?: number
min?: number
max?: number
}

export function useCounter(options: UseCounterOptions = {}) {
const {
initial = 0,
min = Number.MIN_SAFE_INTEGER,
max = Number.MAX_SAFE_INTEGER,
} = options

// Use useState for SSR-friendly state
const count = useState('counter', () => initial)

function increment() {
if (count.value < max) {
count.value++
}
}

function decrement() {
if (count.value > min) {
count.value--
}
}

// Cleanup if needed
onUnmounted(() => {
// Clear state when component unmounts
count.value = initial
})

return {
count: readonly(count),
increment,
decrement,
}
}

</example>

<example type="invalid">
// ❌ WRONG: Not using "use" prefix
export function counter() {
  const count = ref(0)
  return { count }
}

</example>

<example type="invalid">
// ❌ WRONG: Direct DOM manipulation
export function useWindowSize() {
  const width = ref(0)
  const height = ref(0)

// Direct window access will fail in SSR
width.value = window.innerWidth
height.value = window.innerHeight

// No cleanup
window.addEventListener('resize', () => {
width.value = window.innerWidth
height.value = window.innerHeight
})

return { width, height }
}

</example>

## Critical Rules

- ALWAYS use "use" prefix for composable names
- Use useState for SSR-compatible shared state
- Implement proper cleanup in onUnmounted
- Handle SSR compatibility (no direct window/document access)
- Return readonly refs when state should be immutable
- Document composable parameters and return types
