---
applyTo: **/components/**/*.vue
---

# Vue Component Best Practices

## Context

Rules for Vue components in a Nuxt application.

## Requirements

- Create small, focused components
- Use defineModel for two-way binding
- Use props for data down, emits for events up
- Use composables for shared state/logic
- Structure: script → template → style
- Use TypeScript interfaces for props/emits
- Define complex types in /types directory
- Mark optional props with ? symbol

## Examples

<example>
<script setup lang="ts">
const props = defineProps<{
  fetchUrl: string
}>()

// Handle async data fetching with error states
const { data, error, pending, refresh } = await useFetch(
props.fetchUrl,
{
// Handle errors
onRequestError: ({ error }) => {
console.error('Request failed:', error)
},
// Retry failed requests
retry: 3,
retryDelay: 1000
}
)

// Show error toast on failure
watch(error, (newError) => {
if (newError) {
useToast().error({
title: 'Error',
message: newError.message
})
}
})
</script>

<template>
  <div>
    <!-- Loading state -->
    <LoadingSpinner v-if="pending" />

    <!-- Error state with retry -->
    <div v-else-if="error" class="error-state">
      <p>{{ error.message }}</p>
      <button @click="refresh">
        Try Again
      </button>
    </div>

    <!-- Success state -->
    <div v-else>
      <slot :data="data" />
    </div>

  </div>
</template>
</example>

<example>
<script setup lang="ts">
interface CardProps {
  title: string;
  description: string;
  image?: string;
}

const props = defineProps<CardProps>()
const emit = defineEmits<{
click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
emit('click', event)
}
</script>

<template>
  <div @click="handleClick">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <img v-if="image" :src="image" alt="Card image">
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

img {
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
}
</style>
</example>

<example>
<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
  }
}>()

// Handle error page head
useHead({
title: `Error ${props.error.statusCode}`
})

// Clear error and return to homepage
function handleError() {
clearError()
navigateTo('/')
}
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <div class="error-details">
      <p>{{ error.statusMessage || error.message }}</p>
      <button @click="handleError">
        Return Home
      </button>
    </div>
  </div>
</template>
</example>

<example type="invalid">
<!-- ❌ WRONG: Not using TypeScript or script setup -->
<!-- This example shows incorrect usage of Vue components -->

<script>
export default {
  props: ['title', 'description'], // Wrong: No types
  methods: {
    handleClick() {
      this.$emit('click') // Wrong: No event type
    }
  }
}
</script>

<template>
  <div @click="$emit('click', $event)">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<style>
/* Wrong: Not using scoped styles */
h2 {
  margin-bottom: 10px;
}
</style>
</example>

## Critical Rules

- ALWAYS use TypeScript interfaces for props/emits
- Keep components small and focused
- Use proper component structure (script → template → style)
