---
applyTo: **/*.vue
---

# Nuxt SSR Compatibility

## Context

Nuxt renders components on both server and client.

- Code should be isomorphic (runnable in both environments).
- Access window/document only within client-side hooks or checks.
- Be mindful of state hydration.

## Requirements

- Ensure code is isomorphic (runs on server and client)
- Access window/document only in client-side checks/hooks
- Use onMounted for client-side only logic
- Be mindful of state hydration mismatches
- Use <ClientOnly> for components incompatible with SSR

## Examples

<example>
<script setup lang="ts">
// Isomorphic state
const count = ref(0)
const message = ref('Hello')

// Environment-specific code
if (import.meta.server) {
// Server-only code
const headers = useRequestHeaders()
const userAgent = headers['user-agent']
console.log('Server-side render for:', userAgent)
}

// Safe to access window here
const handleResize = () => {
console.log('Window resized:', window.innerWidth)
}

// Client-only code in lifecycle hooks
onMounted(() => {
window.addEventListener('resize', handleResize)
})

// Cleanup
onUnmounted(() => {
window.removeEventListener('resize', handleResize)
})

// Async data fetching
const { data: posts } = await useAsyncData('posts', () =>
$fetch('/api/posts')
)

// Computed properties work on both client and server
const reversedMessage = computed(() =>
message.value.split('').reverse().join('')
)
</script>

<template>
  <div>
    <!-- Static content renders on server -->
    <h1>{{ message }}</h1>
    <p>{{ reversedMessage }}</p>

    <!-- Dynamic content hydrates on client -->
    <div>
      <button @click="count++">
        Count: {{ count }}
      </button>
    </div>

    <!-- Conditional client-only component -->
    <ClientOnly>
      <ThirdPartyWidget />
      <template #fallback>
        <div>Loading widget...</div>
      </template>
    </ClientOnly>

    <!-- Server-fetched data -->
    <div v-if="posts">
      <article v-for="post in posts" :key="post.id">
        {{ post.title }}
      </article>
    </div>

  </div>
</template>
</example>

<example type="invalid">
<script setup>
// ❌ Wrong: Direct browser API usage
const width = window.innerWidth
const height = window.innerHeight

// ❌ Wrong: Accessing document in setup
const title = document.title

// ❌ Wrong: Not using proper lifecycle hooks
const element = document.getElementById('app')

// ❌ Wrong: Direct localStorage access
const theme = localStorage.getItem('theme')

// ❌ Wrong: Not handling SSR properly
if (theme === 'dark') {
document.body.classList.add('dark')
}

// ❌ Wrong: Not using useAsyncData/useFetch
async function fetchData() {
const response = await fetch('/api/data')
return response.json()
}

// ❌ Wrong: Not handling hydration properly
const data = ref(await fetchData())

// ❌ Wrong: Not using proper environment checks
const isBrowser = typeof window !== 'undefined'
if (isBrowser) {
// Browser-specific code
}
</script>

<template>
  <div>
    <!-- ❌ Wrong: Not handling SSR states -->
    <div v-if="width > 768">
      Desktop View
    </div>
    <div v-else>
      Mobile View
    </div>

    <!-- ❌ Wrong: Not using ClientOnly -->
    <ThirdPartyComponent />

    <!-- ❌ Wrong: Not handling undefined data -->
    <div>{{ data.value.title }}</div>

  </div>
</template>
</example>

## Critical Rules

- NEVER access browser APIs without environment checks
- Use proper data fetching with useAsyncData/useFetch
- Handle hydration properly
- Use ClientOnly for client-only components
- Make components isomorphic
- Handle all rendering states
