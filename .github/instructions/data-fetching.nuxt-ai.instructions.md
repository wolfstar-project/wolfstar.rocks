---
applyTo: **/*.{vue,ts}
---

# Nuxt Data Fetching

## Context

Rules for implementing data fetching in Nuxt applications.

- Use useFetch, useAsyncData, or $fetch
- Avoid fetch in lifecycle hooks
- Handle loading states
- Implement proper error handling
- Cache responses when appropriate

## Requirements

- Use useFetch for external API calls
- Use useAsyncData for internal server functions
- Use $fetch for direct API calls
- Handle loading states properly
- Implement proper error handling
- Cache responses when appropriate using key option

## Examples

<example>
<script setup lang="ts">
// Basic usage with error handling and lazy loading
const { data, status, error, refresh } = await useFetch('/api/users', {
  // Client-side only fetching
  lazy: true,
  // Cache key for response
  key: 'users-list',
  // Transform response before caching
  transform: (users) => users.map(u => ({
    ...u,
    fullName: `${u.firstName} ${u.lastName}`
  })),
  // Error handling
  onRequestError: ({ error }) => {
    console.error('Failed to fetch users:', error)
  },
  // Response validation
  pick: ['id', 'name', 'email'] // Only keep needed fields
})

// Retry logic for critical requests
const { data: critical } = await useFetch('/api/critical', {
retry: 3,
retryDelay: 1000,
timeout: 5000
})

// Refresh strategy
const refreshData = () => {
refresh()
}
</script>

<template>
  <div>
    <!-- Complete state handling -->
    <div v-if="status === 'pending'" class="loading">
      <LoadingSpinner />
    </div>
    <div v-else-if="status === 'error'" class="error">
      <ErrorDisplay :error="error" @retry="refreshData" />
    </div>
    <div v-else-if="!data?.length" class="empty">
      No users found
    </div>
    <div v-else class="success">
      <ul>
        <li v-for="item in data" :key="item.id">
          {{ item.fullName }}
        </li>
      </ul>
      <button @click="refreshData">Refresh</button>
    </div>
  </div>
</template>
</example>

<example type="invalid">
<script setup>
const data = ref(null)
const error = ref(null)
const loading = ref(true)

// ❌ Wrong: Fetching in lifecycle hook
onMounted(async () => {
try {
data.value = await $fetch('/api/data')
} catch (err) {
error.value = err
} finally {
loading.value = false
}
})

// ❌ Wrong: No error handling or state management
const fetchData = async () => {
const result = await $fetch('/api/data')
data.value = result
}

// ❌ Wrong: Not handling serialization
const processData = (rawData) => {
return {
...rawData,
// This will fail in SSR
date: new Date(rawData.timestamp),
// This will fail in SSR
handler: () => console.log('click')
}
}
</script>

<template>
  <div>
    <!-- ❌ Wrong: Incomplete state handling -->
    <div v-if="loading">Loading...</div>
    <div v-else>{{ data }}</div>
  </div>
</template>
</example>

## Critical Rules

- NEVER fetch data inside lifecycle hooks
- ALWAYS implement proper error handling
- Handle loading states properly
- Use appropriate Nuxt data fetching composables
